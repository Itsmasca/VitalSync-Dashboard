import { gql } from '@apollo/client';
import { USER_FRAGMENT, VITAL_FRAGMENT, ALERT_FRAGMENT, FAMILY_MEMBER_FRAGMENT } from './queries';

// ============================================================================
// MUTATIONS
// ============================================================================

// Auth
export const REGISTER = gql`
  mutation Register($input: CreateUserInput!) {
    register(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      tokenType
      expiresIn
      user {
        ...UserFields
      }
    }
  }
  ${USER_FRAGMENT}
`;

// Family Groups
export const CREATE_FAMILY_GROUP = gql`
  mutation CreateFamilyGroup($input: CreateFamilyGroupInput!) {
    createFamilyGroup(input: $input) {
      id
      name
      description
      adminId
      plan
      isActive
      maxMembers
      createdAt
    }
  }
`;

export const ADD_CAREGIVER = gql`
  mutation AddCaregiver($input: AddCaregiverInput!) {
    addCaregiver(input: $input) {
      id
      groupId
      userId
      canAcknowledgeAlerts
      canViewHistory
      canEditMembers
      joinedAt
    }
  }
`;

// Family Members
export const CREATE_FAMILY_MEMBER = gql`
  mutation CreateFamilyMember($input: CreateFamilyMemberInput!) {
    createFamilyMember(input: $input) {
      ...FamilyMemberFields
    }
  }
  ${FAMILY_MEMBER_FRAGMENT}
`;

export const SET_MEMBER_THRESHOLDS = gql`
  mutation SetMemberThresholds($memberId: String!, $thresholds: VitalThresholdsInput!) {
    setMemberThresholds(memberId: $memberId, thresholds: $thresholds) {
      ...FamilyMemberFields
    }
  }
  ${FAMILY_MEMBER_FRAGMENT}
`;

export const TOGGLE_MEMBER_ALERTS = gql`
  mutation ToggleMemberAlerts($memberId: String!, $enabled: Boolean!) {
    toggleMemberAlerts(memberId: $memberId, enabled: $enabled) {
      id
      name
      alertsEnabled
    }
  }
`;

// Vitals
export const RECORD_VITAL = gql`
  mutation RecordVital($input: RecordVitalInput!) {
    recordVital(input: $input) {
      ...VitalFields
    }
  }
  ${VITAL_FRAGMENT}
`;

// Alerts
export const ACKNOWLEDGE_ALERT = gql`
  mutation AcknowledgeAlert($alertId: String!) {
    acknowledgeAlert(alertId: $alertId) {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;

export const RESOLVE_ALERT = gql`
  mutation ResolveAlert($alertId: String!, $notes: String) {
    resolveAlert(alertId: $alertId, notes: $notes) {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;

export const DISMISS_ALERT = gql`
  mutation DismissAlert($alertId: String!, $notes: String) {
    dismissAlert(alertId: $alertId, notes: $notes) {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;
