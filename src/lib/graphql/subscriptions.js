import { gql } from '@apollo/client';
import { VITAL_FRAGMENT, ALERT_FRAGMENT, FAMILY_MEMBER_FRAGMENT } from './queries';

// ============================================================================
// SUBSCRIPTIONS - Real-time updates via WebSocket
// ============================================================================

/**
 * Suscripción a actualizaciones de signos vitales en tiempo real.
 * @param memberId - ID del miembro a monitorear. Si es null, recibe todos.
 */
export const VITAL_UPDATED = gql`
  subscription VitalUpdated($memberId: String) {
    vitalUpdated(memberId: $memberId) {
      ...VitalFields
    }
  }
  ${VITAL_FRAGMENT}
`;

/**
 * Suscripción a nuevas alertas en tiempo real.
 * @param familyId - ID de la familia. Si es null, recibe todas las alertas.
 */
export const ALERT_CREATED = gql`
  subscription AlertCreated($familyId: String) {
    alertCreated(familyId: $familyId) {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;

/**
 * Suscripción a cambios de estado de un miembro específico.
 * @param memberId - ID del miembro a monitorear (requerido).
 */
export const MEMBER_STATUS_CHANGED = gql`
  subscription MemberStatusChanged($memberId: String!) {
    memberStatusChanged(memberId: $memberId) {
      ...FamilyMemberFields
    }
  }
  ${FAMILY_MEMBER_FRAGMENT}
`;
