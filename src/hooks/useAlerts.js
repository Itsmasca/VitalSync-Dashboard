'use client'

import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_ACTIVE_ALERTS, GET_ALERTS_BY_MEMBER, GET_RECENT_ALERTS } from '@/lib/graphql/queries';
import { ACKNOWLEDGE_ALERT, RESOLVE_ALERT, DISMISS_ALERT } from '@/lib/graphql/mutations';
import { ALERT_CREATED } from '@/lib/graphql/subscriptions';

/**
 * Hook para obtener alertas activas
 */
export function useActiveAlerts() {
  const { data, loading, error, refetch } = useQuery(GET_ACTIVE_ALERTS, {
    pollInterval: 10000, // Polling cada 10 segundos
  });

  return {
    alerts: data?.activeAlerts || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para obtener alertas de un miembro
 */
export function useAlertsByMember(memberId, limit = 50, offset = 0) {
  const { data, loading, error, refetch } = useQuery(GET_ALERTS_BY_MEMBER, {
    variables: { memberId, limit, offset },
    skip: !memberId,
  });

  return {
    alerts: data?.alertsByMember || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para obtener alertas recientes
 */
export function useRecentAlerts(hours = 24) {
  const { data, loading, error, refetch } = useQuery(GET_RECENT_ALERTS, {
    variables: { hours },
    pollInterval: 30000, // Polling cada 30 segundos
  });

  return {
    alerts: data?.recentAlerts || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para reconocer una alerta
 */
export function useAcknowledgeAlert() {
  const [acknowledge, { data, loading, error }] = useMutation(ACKNOWLEDGE_ALERT, {
    refetchQueries: [{ query: GET_ACTIVE_ALERTS }],
  });

  return {
    acknowledge: (alertId) => acknowledge({ variables: { alertId } }),
    alert: data?.acknowledgeAlert,
    loading,
    error,
  };
}

/**
 * Hook para resolver una alerta
 */
export function useResolveAlert() {
  const [resolve, { data, loading, error }] = useMutation(RESOLVE_ALERT, {
    refetchQueries: [{ query: GET_ACTIVE_ALERTS }],
  });

  return {
    resolve: (alertId, notes) => resolve({ variables: { alertId, notes } }),
    alert: data?.resolveAlert,
    loading,
    error,
  };
}

/**
 * Hook para descartar una alerta
 */
export function useDismissAlert() {
  const [dismiss, { data, loading, error }] = useMutation(DISMISS_ALERT, {
    refetchQueries: [{ query: GET_ACTIVE_ALERTS }],
  });

  return {
    dismiss: (alertId, notes) => dismiss({ variables: { alertId, notes } }),
    alert: data?.dismissAlert,
    loading,
    error,
  };
}

/**
 * Hook para suscripción a nuevas alertas en tiempo real
 */
export function useAlertSubscription(familyId, onNewAlert) {
  const { data, loading, error } = useSubscription(ALERT_CREATED, {
    variables: { familyId },
    onData: ({ data }) => {
      if (data?.data?.alertCreated && onNewAlert) {
        onNewAlert(data.data.alertCreated);
      }
    },
  });

  return {
    alert: data?.alertCreated,
    loading,
    error,
  };
}
