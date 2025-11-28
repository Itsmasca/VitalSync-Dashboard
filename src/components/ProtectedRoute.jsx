'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Heart } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 animate-pulse">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-gray-400 mt-2">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return children;
}
