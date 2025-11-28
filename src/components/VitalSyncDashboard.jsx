'use client'

import React, { useState, useEffect } from 'react';
import { Heart, Activity, Thermometer, Footprints, AlertTriangle, Bell, Users, Wifi, WifiOff, Settings, ChevronDown, RefreshCw, User, Clock, Shield, AlertCircle, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// Datos simulados basados en el DDL de VitalSync
const familyMembers = [
  {
    id: 1,
    memberId: 'familia-garcia-papa',
    name: 'Roberto García',
    relationship: 'Padre',
    deviceId: 'XIAOMI-PAPA-001',
    deviceType: 'Xiaomi Mi Band',
    avatar: '👨',
    medicalNotes: 'Hipertensión controlada, toma losartán 50mg',
  },
  {
    id: 2,
    memberId: 'familia-garcia-mama',
    name: 'Elena García',
    relationship: 'Madre',
    deviceId: 'APPLE-MAMA-002',
    deviceType: 'Apple Watch',
    avatar: '👩',
    medicalNotes: 'Diabetes tipo 2, control mensual',
  },
  {
    id: 3,
    memberId: 'familia-garcia-abuelo',
    name: 'José García Sr.',
    relationship: 'Abuelo',
    deviceId: 'FITBIT-ABUELO-003',
    deviceType: 'Fitbit',
    avatar: '👴',
    medicalNotes: 'Marcapasos, arritmia controlada',
  }
];

// Umbrales de VitalSync (del DDL)
const thresholds = {
  heartRate: { critical_low: 50, warning_low: 60, warning_high: 100, critical_high: 120 },
  oxygenLevel: { critical: 90, warning: 95 },
  temperature: { critical_low: 35, warning_low: 36.1, warning_high: 37.2, critical_high: 38 },
  steps: { critical: 2000, warning: 5000 }
};

// Función para determinar el estado según umbrales
const getVitalStatus = (metric, value) => {
  if (metric === 'heartRate') {
    if (value < thresholds.heartRate.critical_low || value > thresholds.heartRate.critical_high) return 'critical';
    if (value < thresholds.heartRate.warning_low || value > thresholds.heartRate.warning_high) return 'warning';
    return 'normal';
  }
  if (metric === 'oxygenLevel') {
    if (value < thresholds.oxygenLevel.critical) return 'critical';
    if (value < thresholds.oxygenLevel.warning) return 'warning';
    return 'normal';
  }
  if (metric === 'temperature') {
    if (value < thresholds.temperature.critical_low || value > thresholds.temperature.critical_high) return 'critical';
    if (value < thresholds.temperature.warning_low || value > thresholds.temperature.warning_high) return 'warning';
    return 'normal';
  }
  if (metric === 'steps') {
    if (value < thresholds.steps.critical) return 'critical';
    if (value < thresholds.steps.warning) return 'warning';
    return 'normal';
  }
  return 'normal';
};

// Generar datos vitales simulados
const generateVitals = (memberId, isAnomaly = false) => {
  const baseValues = {
    1: { hr: 72, o2: 96.5, temp: 36.5, steps: 3350 },
    2: { hr: 68, o2: 98.0, temp: 36.8, steps: 4260 },
    3: { hr: 57, o2: 94.0, temp: 36.4, steps: 1900 }
  };

  const base = baseValues[memberId] || baseValues[1];
  const variation = isAnomaly ? 30 : 5;

  return {
    heartRate: Math.round(base.hr + (Math.random() - 0.5) * variation),
    oxygenLevel: Math.round((base.o2 + (Math.random() - 0.5) * (isAnomaly ? 8 : 2)) * 10) / 10,
    temperature: Math.round((base.temp + (Math.random() - 0.5) * (isAnomaly ? 2 : 0.3)) * 10) / 10,
    steps: Math.round(base.steps + Math.random() * 50),
    timestamp: new Date().toISOString()
  };
};

// Componente Gauge Circular
const CircularGauge = ({ value, max, min, label, unit, icon: Icon, status }) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
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
          <span className="text-2xl font-bold text-white">{value}</span>
          <span className="text-xs text-gray-400">{unit}</span>
        </div>
      </div>
      <span className="mt-2 text-sm font-medium text-gray-300">{label}</span>
    </div>
  );
};

// Componente de Tarjeta de Familiar
const FamilyMemberCard = ({ member, vitals, isSelected, onClick }) => {
  const overallStatus = ['heartRate', 'oxygenLevel', 'temperature', 'steps']
    .map(m => getVitalStatus(m, vitals[m === 'heartRate' ? 'heartRate' : m === 'oxygenLevel' ? 'oxygenLevel' : m === 'temperature' ? 'temperature' : 'steps']))
    .reduce((worst, current) => {
      const priority = { critical: 3, warning: 2, normal: 1 };
      return priority[current] > priority[worst] ? current : worst;
    }, 'normal');

  const statusStyles = {
    normal: 'border-emerald-500/30 bg-emerald-500/5',
    warning: 'border-amber-500/50 bg-amber-500/10',
    critical: 'border-red-500/50 bg-red-500/10 animate-pulse'
  };

  return (
    <div
      onClick={onClick}
      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${statusStyles[overallStatus]} ${isSelected ? 'ring-2 ring-blue-500 scale-[1.02]' : 'hover:scale-[1.01]'}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-4xl">{member.avatar}</div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{member.name}</h3>
          <p className="text-sm text-gray-400">{member.relationship}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-300">
              {member.deviceType}
            </span>
          </div>
        </div>
        <div className={`w-3 h-3 rounded-full ${overallStatus === 'normal' ? 'bg-emerald-500' : overallStatus === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
      </div>

      <div className="grid grid-cols-4 gap-2 mt-4">
        <div className="text-center">
          <Heart className={`w-4 h-4 mx-auto ${getVitalStatus('heartRate', vitals.heartRate) === 'critical' ? 'text-red-500' : getVitalStatus('heartRate', vitals.heartRate) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="text-xs text-gray-400">{vitals.heartRate}</span>
        </div>
        <div className="text-center">
          <Activity className={`w-4 h-4 mx-auto ${getVitalStatus('oxygenLevel', vitals.oxygenLevel) === 'critical' ? 'text-red-500' : getVitalStatus('oxygenLevel', vitals.oxygenLevel) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="text-xs text-gray-400">{vitals.oxygenLevel}%</span>
        </div>
        <div className="text-center">
          <Thermometer className={`w-4 h-4 mx-auto ${getVitalStatus('temperature', vitals.temperature) === 'critical' ? 'text-red-500' : getVitalStatus('temperature', vitals.temperature) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="text-xs text-gray-400">{vitals.temperature}°</span>
        </div>
        <div className="text-center">
          <Footprints className={`w-4 h-4 mx-auto ${getVitalStatus('steps', vitals.steps) === 'critical' ? 'text-red-500' : getVitalStatus('steps', vitals.steps) === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="text-xs text-gray-400">{vitals.steps.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

// Componente de Alerta
const AlertItem = ({ alert, onAcknowledge }) => {
  const severityStyles = {
    critical: 'bg-red-500/10 border-red-500/30 text-red-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400'
  };

  return (
    <div className={`p-3 rounded-lg border ${severityStyles[alert.severity]} mb-2 transition-all`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{alert.message}</p>
          <p className="text-xs text-gray-500 mt-1">
            {alert.memberName} • {new Date(alert.timestamp).toLocaleTimeString()}
          </p>
        </div>
        {alert.status === 'active' && (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Reconocer
          </button>
        )}
      </div>
    </div>
  );
};

// Componente de Gráfico Rolling
const RollingChart = ({ data, metric, label }) => {
  const maxVal = Math.max(...data.map(d => d[metric]));
  const minVal = Math.min(...data.map(d => d[metric]));
  const range = maxVal - minVal || 1;

  return (
    <div className="bg-gray-800/50 rounded-xl p-4">
      <h3 className="text-sm font-medium text-gray-300 mb-3">{label}</h3>
      <div className="h-24 flex items-end gap-1">
        {data.slice(-30).map((point, i) => {
          const height = ((point[metric] - minVal) / range) * 100;
          const status = getVitalStatus(metric, point[metric]);
          const colors = { normal: 'bg-emerald-500', warning: 'bg-amber-500', critical: 'bg-red-500' };
          return (
            <div
              key={i}
              className={`flex-1 rounded-t transition-all duration-300 ${colors[status]}`}
              style={{ height: `${Math.max(10, height)}%` }}
              title={`${point[metric]} - ${new Date(point.timestamp).toLocaleTimeString()}`}
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
  const [selectedMember, setSelectedMember] = useState(familyMembers[0]);
  const [vitalsData, setVitalsData] = useState({});
  const [vitalsHistory, setVitalsHistory] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [isConnected, setIsConnected] = useState(true);
  const [isEmitting, setIsEmitting] = useState(true);
  const [anomalyMode, setAnomalyMode] = useState(false);
  const [interval, setInterval_] = useState(1000);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Inicializar datos
  useEffect(() => {
    const initialData = {};
    const initialHistory = {};
    familyMembers.forEach(m => {
      initialData[m.id] = generateVitals(m.id);
      initialHistory[m.id] = Array(30).fill(null).map(() => generateVitals(m.id));
    });
    setVitalsData(initialData);
    setVitalsHistory(initialHistory);

    // Alertas iniciales (del DDL)
    setAlerts([
      { id: 1, memberId: 3, memberName: 'José García Sr.', severity: 'warning', message: '⚠️ Heart rate bajo: 56 bpm (mín: 60)', timestamp: new Date().toISOString(), status: 'active' },
      { id: 2, memberId: 3, memberName: 'José García Sr.', severity: 'warning', message: '⚠️ Oxygen level bajo: 93.5% (mín: 95%)', timestamp: new Date().toISOString(), status: 'active' },
      { id: 3, memberId: 3, memberName: 'José García Sr.', severity: 'critical', message: '🚨 Steps muy bajo: 1,820 pasos (mín: 2,000)', timestamp: new Date().toISOString(), status: 'active' }
    ]);
  }, []);

  // Simulación de datos en tiempo real
  useEffect(() => {
    if (!isEmitting) return;

    const timer = setInterval(() => {
      setVitalsData(prev => {
        const newData = { ...prev };
        familyMembers.forEach(m => {
          newData[m.id] = generateVitals(m.id, anomalyMode);
        });
        return newData;
      });

      setVitalsHistory(prev => {
        const newHistory = { ...prev };
        familyMembers.forEach(m => {
          const newVitals = generateVitals(m.id, anomalyMode);
          newHistory[m.id] = [...(prev[m.id] || []).slice(-29), newVitals];
        });
        return newHistory;
      });

      setLastUpdate(new Date());

      // Generar alertas si hay anomalías
      if (anomalyMode && Math.random() > 0.7) {
        const randomMember = familyMembers[Math.floor(Math.random() * familyMembers.length)];
        const alertTypes = ['Heart rate', 'Oxygen level', 'Temperatura', 'Steps'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        setAlerts(prev => [{
          id: Date.now(),
          memberId: randomMember.id,
          memberName: randomMember.name,
          severity: Math.random() > 0.5 ? 'critical' : 'warning',
          message: `${Math.random() > 0.5 ? '🚨' : '⚠️'} ${alertType} anómalo detectado`,
          timestamp: new Date().toISOString(),
          status: 'active'
        }, ...prev.slice(0, 9)]);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isEmitting, anomalyMode, interval]);

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, status: 'acknowledged' } : a));
  };

  const currentVitals = vitalsData[selectedMember.id] || generateVitals(selectedMember.id);
  const currentHistory = vitalsHistory[selectedMember.id] || [];

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
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
            {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
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
              <h2 className="font-semibold">Familia García</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">Familiar</span>
            </div>

            <div className="space-y-3">
              {familyMembers.map(member => (
                <FamilyMemberCard
                  key={member.id}
                  member={member}
                  vitals={vitalsData[member.id] || generateVitals(member.id)}
                  isSelected={selectedMember.id === member.id}
                  onClick={() => setSelectedMember(member)}
                />
              ))}
            </div>
          </div>

          {/* Panel de Control */}
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold">Control Panel</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Data Emission</span>
                <button
                  onClick={() => setIsEmitting(!isEmitting)}
                  className={`w-12 h-6 rounded-full transition-colors ${isEmitting ? 'bg-emerald-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isEmitting ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Interval: {interval}ms</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={interval}
                  onChange={(e) => setInterval_(Number(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Anomaly Mode</span>
                <button
                  onClick={() => setAnomalyMode(!anomalyMode)}
                  className={`w-12 h-6 rounded-full transition-colors ${anomalyMode ? 'bg-red-500' : 'bg-gray-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${anomalyMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info del Familiar Seleccionado */}
          <div className="bg-gray-800/50 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-6xl">{selectedMember.avatar}</div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{selectedMember.name}</h2>
                <p className="text-gray-400">{selectedMember.relationship}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-700">
                    {selectedMember.deviceType}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CircularGauge
                value={currentVitals.heartRate}
                min={40} max={150}
                label="Heart Rate"
                unit="bpm"
                icon={Heart}
                status={getVitalStatus('heartRate', currentVitals.heartRate)}
              />
              <CircularGauge
                value={currentVitals.oxygenLevel}
                min={80} max={100}
                label="SpO₂"
                unit="%"
                icon={Activity}
                status={getVitalStatus('oxygenLevel', currentVitals.oxygenLevel)}
              />
              <CircularGauge
                value={currentVitals.temperature}
                min={35} max={40}
                label="Temperatura"
                unit="°C"
                icon={Thermometer}
                status={getVitalStatus('temperature', currentVitals.temperature)}
              />
              <CircularGauge
                value={currentVitals.steps}
                min={0} max={10000}
                label="Pasos"
                unit="steps"
                icon={Footprints}
                status={getVitalStatus('steps', currentVitals.steps)}
              />
            </div>
          </div>

          {/* Gráficos Rolling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RollingChart
              data={currentHistory}
              metric="heartRate"
              label="Heart Rate (últimos 2 min)"
            />
            <RollingChart
              data={currentHistory}
              metric="temperature"
              label="Temperatura (últimos 2 min)"
            />
          </div>

          {/* Tabla de Umbrales */}
          <div className="bg-gray-800/50 rounded-2xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              Umbrales de Alertas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-700">
                    <th className="pb-2">Métrica</th>
                    <th className="pb-2 text-center">Critical</th>
                    <th className="pb-2 text-center">Warning</th>
                    <th className="pb-2 text-center">Normal</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300">
                  <tr className="border-b border-gray-700/50">
                    <td className="py-2">Heart Rate</td>
                    <td className="text-center text-red-400">&lt;50 / &gt;120</td>
                    <td className="text-center text-amber-400">50-60 / 100-120</td>
                    <td className="text-center text-emerald-400">60-100 bpm</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-2">SpO₂</td>
                    <td className="text-center text-red-400">&lt;90%</td>
                    <td className="text-center text-amber-400">90-95%</td>
                    <td className="text-center text-emerald-400">&gt;95%</td>
                  </tr>
                  <tr className="border-b border-gray-700/50">
                    <td className="py-2">Temperatura</td>
                    <td className="text-center text-red-400">&lt;35° / &gt;38°</td>
                    <td className="text-center text-amber-400">35-36.1° / 37.2-38°</td>
                    <td className="text-center text-emerald-400">36.1-37.2°C</td>
                  </tr>
                  <tr>
                    <td className="py-2">Steps</td>
                    <td className="text-center text-red-400">&lt;2,000</td>
                    <td className="text-center text-amber-400">2,000-5,000</td>
                    <td className="text-center text-emerald-400">&gt;5,000</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
                {alerts.filter(a => a.status === 'active').length} activas
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {alerts.length === 0 ? (
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
                  />
                ))
              )}
            </div>

            {alerts.length > 0 && (
              <button
                onClick={() => setAlerts([])}
                className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Limpiar historial
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>VitalSync MVP • Proyecto SIS4415 • Familia García • 3 dispositivos activos</p>
        <p className="mt-1">PostgreSQL 14+ • FastAPI • GraphQL Subscriptions • Node-RED Simulator</p>
      </footer>
    </div>
  );
}
