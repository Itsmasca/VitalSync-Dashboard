'use client'

import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { Heart, Activity, Thermometer, Footprints, AlertTriangle, Bell, Users, Wifi, WifiOff, Settings, Clock, Shield, AlertCircle, CheckCircle, LogOut, Loader2, Plus, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GET_MY_FAMILY_GROUPS, GET_FAMILY_MEMBERS, GET_LATEST_VITAL, GET_ROLLING_VITALS, GET_ACTIVE_ALERTS } from '@/lib/graphql/queries';
import { ACKNOWLEDGE_ALERT, CREATE_FAMILY_GROUP } from '@/lib/graphql/mutations';
import { ALERT_CREATED, VITAL_UPDATED } from '@/lib/graphql/subscriptions';
import { useMutation, useSubscription } from '@apollo/client';

// Mapeo de avatars por relación
const relationshipAvatars = {
  padre: '👨',
  madre: '👩',
  abuelo: '👴',
  abuela: '👵',
  hijo: '👦',
  hija: '👧',
  esposo: '👨',
  esposa: '👩',
  hermano: '👦',
  hermana: '👧',
  self: '🧑',
  otro: '👤'
};

// Mapeo de status de GraphQL a local
const mapStatus = (status) => {
  if (!status) return 'normal';
  const s = status.toLowerCase();
  if (s === 'critical') return 'critical';
  if (s === 'warning') return 'warning';
  return 'normal';
};

// Componente Gauge Circular
const CircularGauge = ({ value, max, min, label, unit, icon: Icon, status }) => {
  const safeValue = value ?? 0;
  const percentage = Math.min(100, Math.max(0, ((safeValue - min) / (max - min)) * 100));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const statusColors = {
    normal: { stroke: '#10b981', bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
    warning: { stroke: '#f59e0b', bg: 'bg-amber-500/10', text: 'text-amber-500' },
    critical: { stroke: '#ef4444', bg: 'bg-red-500/10', text: 'text-red-500' }
  };

  const colors = statusColors[status] || statusColors.normal;

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-2xl ${colors.bg} transition-all duration-300`}>
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#1f2937" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke={colors.stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-5 h-5 ${colors.text} mb-1`} />
          <span className="text-2xl font-bold text-white">{safeValue || '-'}</span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-300">{label}</span>
    </div>
  );
};

// Componente de Tarjeta de Familiar
const FamilyMemberCard = ({ member, isSelected, onClick }) => {
  // Query para obtener el último vital del miembro
  const { data: vitalData } = useQuery(GET_LATEST_VITAL, {
    variables: { memberId: member.memberId },
    pollInterval: 5000,
    skip: !member.memberId
  });

  const vital = vitalData?.latestVital;
  const overallStatus = mapStatus(vital?.overallStatus);

  const statusStyles = {
    normal: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/50 bg-amber-500/10',
    critical: 'border-red-500/50 bg-red-500/10 animate-pulse'
  };

  const avatar = relationshipAvatars[member.relationship?.toLowerCase()] || '👤';

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${statusStyles[overallStatus]} ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{avatar}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{member.name}</h3>
          <p className="text-sm text-gray-400 capitalize">{member.relationship}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
              {member.deviceType?.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${overallStatus === 'normal' ? 'bg-emerald-500' : overallStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
      </div>

      {vital && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          <div className="text-center">
            <Heart className={`w-4 h-4 mx-auto ${mapStatus(vital.heartRateStatus) === 'critical' ? 'text-red-500' : mapStatus(vital.heartRateStatus) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-xs text-gray-400">{vital.heartRate ?? '-'}</span>
          </div>
          <div className="text-center">
            <Activity className={`w-4 h-4 mx-auto ${mapStatus(vital.oxygenStatus) === 'critical' ? 'text-red-500' : mapStatus(vital.oxygenStatus) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-xs text-gray-400">{vital.oxygenLevel ?? '-'}%</span>
          </div>
          <div className="text-center">
            <Thermometer className={`w-4 h-4 mx-auto ${mapStatus(vital.temperatureStatus) === 'critical' ? 'text-red-500' : mapStatus(vital.temperatureStatus) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-xs text-gray-400">{vital.bodyTemperature ?? '-'}°</span>
          </div>
          <div className="text-center">
            <Footprints className={`w-4 h-4 mx-auto ${mapStatus(vital.stepsStatus) === 'critical' ? 'text-red-500' : mapStatus(vital.stepsStatus) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="text-xs text-gray-400">{vital.steps?.toLocaleString() ?? '-'}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de Alerta
const AlertItem = ({ alert, onAcknowledge, loading }) => {
  const severityStyles = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    normal: 'bg-gray-500/10 border-gray-500/30 text-gray-400'
  };

  const severity = mapStatus(alert.severity);

  return (
    <div className={`p-3 rounded-lg border ${severityStyles[severity]} mb-2 transition-all`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {new Date(alert.createdAt).toLocaleTimeString()}
          </p>
        </div>
        {alert.status === 'ACTIVE' && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            disabled={loading}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reconocer'}
          </button>
        )}
      </div>
    </div>
  );
};

// Modal para crear familia
const CreateFamilyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    plan: 'basic'
  });
  const [error, setError] = useState('');

  const [createFamily, { loading }] = useMutation(CREATE_FAMILY_GROUP, {
    onCompleted: (data) => {
      onSuccess(data.createFamilyGroup);
      onClose();
    },
    onError: (err) => {
      setError(err.message || 'Error al crear la familia');
    },
    refetchQueries: [{ query: GET_MY_FAMILY_GROUPS }]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    createFamily({
      variables: {
        input: {
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          plan: formData.plan
        }
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Crear Familia</h2>
              <p className="text-sm text-gray-400">Configura tu grupo familiar</p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre de la familia *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Familia García"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción de tu grupo familiar..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Plan
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['basic', 'premium', 'enterprise'].map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, plan }))}
                    className={`py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                      formData.plan === plan
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {plan.charAt(0).toUpperCase() + plan.slice(1)}
                  </button>
                ))}
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
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Crear Familia
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Componente de Gráfico Rolling
const RollingChart = ({ data, metric, label, statusField }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-800/50 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">{label}</h3>
        <div className="h-24 flex items-center justify-center text-gray-500">
          Sin datos
        </div>
      </div>
    );
  }

  const values = data.map(d => d[metric]).filter(v => v != null);
  const maxVal = Math.max(...values);
  const minVal = Math.min(...values);
  const range = maxVal - minVal || 1;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">{label}</h3>
      <div className="h-24 flex items-end gap-1">
        {data.slice(-30).map((point, i) => {
          const value = point[metric];
          if (value == null) return null;
          const height = ((value - minVal) / range) * 100;
          const status = mapStatus(point[statusField]);
          const colors = { normal: 'bg-emerald-500', warning: 'bg-amber-500', critical: 'bg-red-500' };
          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-300 ${colors[status]}`}
              style={{ height: `${Math.max(10, height)}%` }}
              title={`${value} - ${new Date(point.readingTimestamp).toLocaleTimeString()}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>-2 min</span>
        <span>Ahora</span>
      </div>
    </div>
  );
};

// Componente Principal del Dashboard
export default function VitalSyncDashboard() {
  const { user, logout } = useAuth();
  const [selectedMember, setSelectedMember] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showCreateFamilyModal, setShowCreateFamilyModal] = useState(false);
  const [realtimeAlerts, setRealtimeAlerts] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Query para obtener los grupos familiares
  const { data: groupsData, loading: groupsLoading } = useQuery(GET_MY_FAMILY_GROUPS);

  // Obtener el primer grupo
  const familyGroup = groupsData?.myFamilyGroups?.[0];

  // Query para obtener los miembros del grupo
  const { data: membersData, loading: membersLoading } = useQuery(GET_FAMILY_MEMBERS, {
    variables: { familyId: familyGroup?.id },
    skip: !familyGroup?.id
  });

  const familyMembers = membersData?.familyMembers || [];

  // Seleccionar el primer miembro cuando se carguen
  useEffect(() => {
    if (familyMembers.length > 0 && !selectedMember) {
      setSelectedMember(familyMembers[0]);
    }
  }, [familyMembers, selectedMember]);

  // Query para el vital del miembro seleccionado
  const { data: vitalData, loading: vitalLoading } = useQuery(GET_LATEST_VITAL, {
    variables: { memberId: selectedMember?.memberId },
    skip: !selectedMember?.memberId,
    pollInterval: 3000,
    onCompleted: () => setLastUpdate(new Date())
  });

  const currentVital = vitalData?.latestVital;

  // Query para rolling vitals
  const { data: rollingData } = useQuery(GET_ROLLING_VITALS, {
    variables: { memberId: selectedMember?.memberId, minutes: 2 },
    skip: !selectedMember?.memberId,
    pollInterval: 5000
  });

  const rollingVitals = rollingData?.rollingVitals || [];

  // Query para alertas activas (fallback si WebSocket falla)
  const { data: alertsData, loading: alertsLoading, refetch: refetchAlerts } = useQuery(GET_ACTIVE_ALERTS, {
    pollInterval: wsConnected ? 0 : 10000 // Deshabilitar polling si WebSocket está conectado
  });

  const queryAlerts = alertsData?.activeAlerts || [];

  // Subscription para alertas en tiempo real via WebSocket
  useSubscription(ALERT_CREATED, {
    variables: { familyId: familyGroup?.id },
    skip: !familyGroup?.id,
    onData: ({ data }) => {
      if (data?.data?.alertCreated) {
        const newAlert = data.data.alertCreated;
        setRealtimeAlerts(prev => {
          // Evitar duplicados
          if (prev.some(a => a.id === newAlert.id)) return prev;
          return [newAlert, ...prev];
        });
        setLastUpdate(new Date());
        setWsConnected(true);

        // Notificación del navegador si es crítica
        if (newAlert.severity === 'CRITICAL' && Notification.permission === 'granted') {
          new Notification('VitalSync - Alerta Crítica', {
            body: newAlert.message,
            icon: '/favicon.ico'
          });
        }
      }
    },
    onError: (error) => {
      console.error('WebSocket error:', error);
      setWsConnected(false);
    }
  });

  // Subscription para vitales en tiempo real
  useSubscription(VITAL_UPDATED, {
    variables: { memberId: selectedMember?.memberId },
    skip: !selectedMember?.memberId,
    onData: ({ data }) => {
      if (data?.data?.vitalUpdated) {
        setLastUpdate(new Date());
        setWsConnected(true);
      }
    },
    onError: () => setWsConnected(false)
  });

  // Combinar alertas de query + tiempo real (sin duplicados)
  const alerts = [...realtimeAlerts, ...queryAlerts].reduce((acc, alert) => {
    if (!acc.some(a => a.id === alert.id)) acc.push(alert);
    return acc;
  }, []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Solicitar permiso para notificaciones
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Mutation para reconocer alertas
  const [acknowledgeAlert, { loading: ackLoading }] = useMutation(ACKNOWLEDGE_ALERT, {
    onCompleted: () => refetchAlerts()
  });

  const handleAcknowledge = async (alertId) => {
    try {
      await acknowledgeAlert({ variables: { alertId } });
      // Actualizar estado local de alertas en tiempo real
      setRealtimeAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (error) {
      console.error('Error al reconocer alerta:', error);
    }
  };

  // Loading state
  if (groupsLoading || membersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // No data state
  if (!familyGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sin grupo familiar</h2>
          <p className="text-gray-400 mb-6">
            No tienes ningún grupo familiar. Crea uno nuevo para empezar a monitorear a tus seres queridos.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => setShowCreateFamilyModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Crear Familia
            </button>
            <button
              onClick={logout}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        <CreateFamilyModal
          isOpen={showCreateFamilyModal}
          onClose={() => setShowCreateFamilyModal(false)}
          onSuccess={() => {
            setShowCreateFamilyModal(false);
          }}
        />
      </div>
    );
  }

  const avatar = selectedMember ? (relationshipAvatars[selectedMember.relationship?.toLowerCase()] || '👤') : '👤';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              VitalSync
            </h1>
            <p className="text-xs text-gray-400">Tu familia, conectada. Su bienestar, en tiempo real.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${wsConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {wsConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{wsConnected ? 'Tiempo Real' : 'Polling'}</span>
          </div>
          <div className="text-xs text-gray-500">
            <Clock className="w-3 h-3 inline mr-1" />
            {lastUpdate.toLocaleTimeString()}
          </div>
          {user && (
            <div className="flex items-center gap-2 pl-3 border-l border-gray-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-white">{user.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Familiares */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold">{familyGroup.name}</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 capitalize">
                {familyGroup.plan}
              </span>
            </div>

            <div className="space-y-3">
              {familyMembers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No hay miembros registrados
                </p>
              ) : (
                familyMembers.map(member => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    isSelected={selectedMember?.id === member.id}
                    onClick={() => setSelectedMember(member)}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info del Familiar Seleccionado */}
          {selectedMember ? (
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-6xl">{avatar}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                  <p className="text-gray-400 capitalize">{selectedMember.relationship}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700">
                      {selectedMember.deviceType?.replace('_', ' ')}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700 font-mono">
                      {selectedMember.deviceId}
                    </span>
                  </div>
                  {selectedMember.medicalNotes && (
                    <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                      <Shield className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {selectedMember.medicalNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Gauges de Signos Vitales */}
              {vitalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : currentVital ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <CircularGauge
                    value={currentVital.heartRate}
                    min={40} max={150}
                    label="Heart Rate"
                    unit="bpm"
                    icon={Heart}
                    status={mapStatus(currentVital.heartRateStatus)}
                  />
                  <CircularGauge
                    value={currentVital.oxygenLevel}
                    min={80} max={100}
                    label="SpO₂"
                    unit="%"
                    icon={Activity}
                    status={mapStatus(currentVital.oxygenStatus)}
                  />
                  <CircularGauge
                    value={currentVital.bodyTemperature}
                    min={35} max={40}
                    label="Temperatura"
                    unit="°C"
                    icon={Thermometer}
                    status={mapStatus(currentVital.temperatureStatus)}
                  />
                  <CircularGauge
                    value={currentVital.steps}
                    min={0} max={10000}
                    label="Pasos"
                    unit="steps"
                    icon={Footprints}
                    status={mapStatus(currentVital.stepsStatus)}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Sin lecturas de signos vitales</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-2xl p-6 text-center">
              <p className="text-gray-500">Selecciona un miembro para ver sus signos vitales</p>
            </div>
          )}

          {/* Gráficos Rolling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RollingChart
              data={rollingVitals}
              metric="heartRate"
              statusField="heartRateStatus"
              label="Heart Rate (últimos 2 min)"
            />
            <RollingChart
              data={rollingVitals}
              metric="bodyTemperature"
              statusField="temperatureStatus"
              label="Temperatura (últimos 2 min)"
            />
          </div>

          {/* Tabla de Umbrales */}
          {selectedMember?.thresholds && (
            <div className="bg-gray-800/50 rounded-2xl p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-400" />
                Umbrales Configurados
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">Heart Rate</p>
                  <p className="text-white">{selectedMember.thresholds.hrMin} - {selectedMember.thresholds.hrMax} bpm</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">SpO₂ mín</p>
                  <p className="text-white">{selectedMember.thresholds.spo2Min}%</p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-400">Temperatura</p>
                  <p className="text-white">{selectedMember.thresholds.tempMin} - {selectedMember.thresholds.tempMax}°C</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel de Alertas */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 rounded-2xl p-4 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                <h2 className="font-semibold">Alertas</h2>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">
                {alerts.filter(a => a.status === 'ACTIVE').length} activas
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {alertsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-emerald-500/30" />
                  <p>Sin alertas activas</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    loading={ackLoading}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>VitalSync • {familyGroup.name} • {familyMembers.length} miembros</p>
        <p className="mt-1">
          GraphQL • {wsConnected ? 'WebSocket Real-time' : 'Polling Fallback'}
        </p>
      </footer>
    </div>
  );
}
