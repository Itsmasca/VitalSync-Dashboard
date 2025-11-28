// Servicio de autenticación para conectar con el backend FastAPI

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Registrar nuevo usuario
 * RF-AUTH-01: Registro de usuarios
 */
export async function register({ email, password, name, phone }) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, phone }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Error al registrar usuario');
  }

  // Guardar tokens
  saveTokens(data);
  return data;
}

/**
 * Iniciar sesión
 * RF-AUTH-02: Login con JWT
 */
export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Credenciales inválidas');
  }

  // Guardar tokens
  saveTokens(data);
  return data;
}

/**
 * Refrescar access token
 * RF-AUTH-04: Refresh de tokens
 */
export async function refreshToken() {
  const refresh = getRefreshToken();

  if (!refresh) {
    throw new Error('No hay refresh token');
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  const data = await response.json();

  if (!response.ok) {

    clearTokens();
    throw new Error(data.detail || 'Sesión expirada');
  }

  // Actualizar tokens
  saveTokens(data);
  return data;
}


export async function requestPasswordReset(email) {
  const response = await fetch(`${API_URL}/auth/password-reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Error al resetear contraseña');
  }

  return data;
}

/**
 * Cerrar sesión
 */
export function logout() {
  clearTokens();
  window.location.href = '/auth/login';
}

/**
 * Obtener usuario actual del token
 */
export function getCurrentUser() {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Verificar si el token está expirado
 */
export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convertir a milliseconds
    return Date.now() >= exp;
  } catch {
    return true;
  }
}

/**
 * Verificar si está autenticado
 */
export function isAuthenticated() {
  const token = getAccessToken();
  return token && !isTokenExpired(token);
}

// Funciones de almacenamiento de tokens
function saveTokens({ access_token, refresh_token }) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
  }
}

export function getAccessToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

export function getRefreshToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('refresh_token');
  }
  return null;
}

function clearTokens() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
}

/**
 * Fetch con autenticación automática y refresh
 */
export async function authFetch(url, options = {}) {
  let token = getAccessToken();

  // Si el token está expirado, intentar refresh
  if (isTokenExpired(token)) {
    try {
      await refreshToken();
      token = getAccessToken();
    } catch {
      logout();
      throw new Error('Sesión expirada');
    }
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Si recibimos 401, intentar refresh una vez más
  if (response.status === 401) {
    try {
      await refreshToken();
      token = getAccessToken();

      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      logout();
      throw new Error('Sesión expirada');
    }
  }

  return response;
}
