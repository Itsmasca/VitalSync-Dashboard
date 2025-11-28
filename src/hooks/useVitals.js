'use client'

import { useQuery, useSubscription } from '@apollo/client';
import { GET_LATEST_VITAL, GET_ROLLING_VITALS, GET_VITALS } from '@/lib/graphql/queries';
import { VITAL_UPDATED } from '@/lib/graphql/subscriptions';

/**
 * Hook para obtener la última lectura de signos vitales de un miembro
 */
export function useLatestVital(memberId) {
  const { data, loading, error, refetch } = useQuery(GET_LATEST_VITAL, {
    variables: { memberId },
    skip: !memberId,
    pollInterval: 5000, // Polling cada 5 segundos como fallback
  });

  return {
    vital: data?.latestVital,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para obtener lecturas rolling (últimos N minutos)
 */
export function useRollingVitals(memberId, minutes = 2) {
  const { data, loading, error, refetch } = useQuery(GET_ROLLING_VITALS, {
    variables: { memberId, minutes },
    skip: !memberId,
    pollInterval: 5000,
  });

  return {
    vitals: data?.rollingVitals || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para obtener historial de vitales
 */
export function useVitalsHistory(memberId, limit = 100, offset = 0) {
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_VITALS, {
    variables: { memberId, limit, offset },
    skip: !memberId,
  });

  return {
    vitals: data?.vitals || [],
    loading,
    error,
    refetch,
    fetchMore,
  };
}

/**
 * Hook para suscripción a actualizaciones de vitales en tiempo real
 */
export function useVitalSubscription(memberId, onData) {
  const { data, loading, error } = useSubscription(VITAL_UPDATED, {
    variables: { memberId },
    skip: !memberId,
    onData: ({ data }) => {
      if (data?.data?.vitalUpdated && onData) {
        onData(data.data.vitalUpdated);
      }
    },
  });

  return {
    vital: data?.vitalUpdated,
    loading,
    error,
  };
}
