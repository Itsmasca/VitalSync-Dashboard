'use client'

import { useQuery, useMutation } from '@apollo/client';
import { GET_FAMILY_MEMBERS, GET_FAMILY_MEMBER, GET_MY_FAMILY_GROUPS } from '@/lib/graphql/queries';
import { CREATE_FAMILY_MEMBER, SET_MEMBER_THRESHOLDS, TOGGLE_MEMBER_ALERTS } from '@/lib/graphql/mutations';

/**
 * Hook para obtener los grupos familiares del usuario actual
 */
export function useMyFamilyGroups() {
  const { data, loading, error, refetch } = useQuery(GET_MY_FAMILY_GROUPS);

  return {
    groups: data?.myFamilyGroups || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para obtener miembros de una familia
 */
export function useFamilyMembers(familyId) {
  const { data, loading, error, refetch } = useQuery(GET_FAMILY_MEMBERS, {
    variables: { familyId },
    skip: !familyId,
  });

  return {
    members: data?.familyMembers || [],
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para obtener un miembro específico
 */
export function useFamilyMember(memberId) {
  const { data, loading, error, refetch } = useQuery(GET_FAMILY_MEMBER, {
    variables: { id: memberId },
    skip: !memberId,
  });

  return {
    member: data?.familyMember,
    loading,
    error,
    refetch,
  };
}

/**
 * Hook para crear un nuevo miembro
 */
export function useCreateFamilyMember() {
  const [create, { data, loading, error }] = useMutation(CREATE_FAMILY_MEMBER, {
    refetchQueries: [{ query: GET_MY_FAMILY_GROUPS }],
  });

  return {
    create: (input) => create({ variables: { input } }),
    member: data?.createFamilyMember,
    loading,
    error,
  };
}

/**
 * Hook para configurar umbrales de un miembro
 */
export function useSetMemberThresholds() {
  const [setThresholds, { data, loading, error }] = useMutation(SET_MEMBER_THRESHOLDS);

  return {
    setThresholds: (memberId, thresholds) =>
      setThresholds({ variables: { memberId, thresholds } }),
    member: data?.setMemberThresholds,
    loading,
    error,
  };
}

/**
 * Hook para habilitar/deshabilitar alertas de un miembro
 */
export function useToggleMemberAlerts() {
  const [toggle, { data, loading, error }] = useMutation(TOGGLE_MEMBER_ALERTS);

  return {
    toggle: (memberId, enabled) => toggle({ variables: { memberId, enabled } }),
    member: data?.toggleMemberAlerts,
    loading,
    error,
  };
}
