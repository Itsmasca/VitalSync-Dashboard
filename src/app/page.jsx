'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import VitalSyncDashboard from '@/components/VitalSyncDashboard'

export default function Home() {
  return (
    <ProtectedRoute>
      <VitalSyncDashboard />
    </ProtectedRoute>
  )
}
