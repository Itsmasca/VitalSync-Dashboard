'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { requestPasswordReset } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await requestPasswordReset(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al resetear contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de éxito
  if (success) {
    return (
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">
          Contraseña reseteada
        </h2>
        <p className="text-gray-400 text-sm mb-4">
          Tu contraseña ha sido reseteada exitosamente.
        </p>
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-300 mb-1">Nueva contraseña:</p>
          <code className="text-lg font-mono text-blue-400">VitalSync123!</code>
        </div>
        <p className="text-xs text-gray-500 mb-6">
          Te recomendamos cambiar tu contraseña después de iniciar sesión.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all"
        >
          Ir al login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="text-xl font-semibold text-white text-center mb-2">
        Recuperar Contraseña
      </h2>
      <p className="text-gray-400 text-sm text-center mb-6">
        Ingresa tu correo y resetearemos tu contraseña al valor por defecto.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              required
              placeholder="tu@email.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Procesando...
            </>
          ) : (
            'Resetear contraseña'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al login
        </Link>
      </div>
    </>
  );
}
