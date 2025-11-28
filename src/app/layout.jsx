import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata = {
  title: 'VitalSync - Dashboard de Salud Familiar',
  description: 'Tu familia, conectada. Su bienestar, en tiempo real.',
  keywords: ['salud', 'monitoreo', 'familia', 'signos vitales', 'wearables'],
  authors: [{ name: 'VitalSync Team' }],
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#111827',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
