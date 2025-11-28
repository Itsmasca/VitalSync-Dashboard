import { Heart } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            VitalSync
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Tu familia, conectada. Su bienestar, en tiempo real.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8">
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          VitalSync © 2024 • Proyecto SIS4415
        </p>
      </div>
    </div>
  );
}
