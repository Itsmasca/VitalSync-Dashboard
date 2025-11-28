import { gql } from '@apollo/client';

// ============================================================================
// FRAGMENTS
// ============================================================================

export const VITAL_FRAGMENT = gql`
  fragment VitalFields on VitalType {
    id
    memberId
    heartRate
    oxygenLevel
    bodyTemperature
    steps
    respiratoryRate
    heartRateStatus
    oxygenStatus
    temperatureStatus
    stepsStatus
    overallStatus
    isAnomaly
    readingTimestamp
    receivedAt
  }
`;

export const ALERT_FRAGMENT = gql`
  fragment AlertFields on AlertType {
    id
    memberId
    vitalId
    alertType
    severity
    metricValue
    thresholdValue
    thresholdType
    message
    status
    acknowledgedBy
    acknowledgedAt
    resolvedAt
    createdAt
  }
`;

export const FAMILY_MEMBER_FRAGMENT = gql`
  fragment FamilyMemberFields on FamilyMemberType {
    id
    familyId
    memberId
    name
    relationship
    dateOfBirth
    gender
    deviceId
    deviceType
    deviceName
    medicalNotes
    emergencyContact
    emergencyPhone
    thresholds {
      hrMin
      hrMax
      spo2Min
      tempMin
      tempMax
      stepsMin
    }
    isActive
    alertsEnabled
    avatarUrl
    age
    createdAt
    updatedAt
  }
`;

export const USER_FRAGMENT = gql`
  fragment UserFields on UserType {
    id
    email
    name
    role
    phone
    avatarUrl
    isActive
    emailVerified
    lastLoginAt
    createdAt
  }
`;

// ============================================================================
// QUERIES
// ============================================================================

// Auth & User
export const GET_ME = gql`
  query GetMe {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// Family Groups
export const GET_MY_FAMILY_GROUPS = gql`
  query GetMyFamilyGroups {
    myFamilyGroups {
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

export const GET_FAMILY_GROUP = gql`
  query GetFamilyGroup($id: String!) {
    familyGroup(id: $id) {
      id
      name
      description
      adminId
      plan
      planStartedAt
      planExpiresAt
      timezoneStr
      isActive
      maxMembers
    }
  }
`;

// Family Members
export const GET_FAMILY_MEMBERS = gql`
  query GetFamilyMembers($familyId: String!) {
    familyMembers(familyId: $familyId) {
      ...FamilyMemberFields
    }
  }
  ${FAMILY_MEMBER_FRAGMENT}
`;

export const GET_FAMILY_MEMBER = gql`
  query GetFamilyMember($id: String!) {
    familyMember(id: $id) {
      ...FamilyMemberFields
    }
  }
  ${FAMILY_MEMBER_FRAGMENT}
`;

// Vitals
export const GET_LATEST_VITAL = gql`
  query GetLatestVital($memberId: String!) {
    latestVital(memberId: $memberId) {
      ...VitalFields
    }
  }
  ${VITAL_FRAGMENT}
`;

export const GET_VITALS = gql`
  query GetVitals($memberId: String!, $limit: Int, $offset: Int) {
    vitals(memberId: $memberId, limit: $limit, offset: $offset) {
      ...VitalFields
    }
  }
  ${VITAL_FRAGMENT}
`;

export const GET_ROLLING_VITALS = gql`
  query GetRollingVitals($memberId: String!, $minutes: Int) {
    rollingVitals(memberId: $memberId, minutes: $minutes) {
      ...VitalFields
    }
  }
  ${VITAL_FRAGMENT}
`;

export const GET_DAILY_AVERAGES = gql`
  query GetDailyAverages($memberId: String!, $startDate: Date!, $endDate: Date!) {
    dailyAverages(memberId: $memberId, startDate: $startDate, endDate: $endDate) {
      date
      avgHeartRate
      avgOxygenLevel
      avgBodyTemperature
      maxSteps
      readingCount
    }
  }
`;

// Alerts
export const GET_ACTIVE_ALERTS = gql`
  query GetActiveAlerts {
    activeAlerts {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;

export const GET_ALERTS_BY_MEMBER = gql`
  query GetAlertsByMember($memberId: String!, $limit: Int, $offset: Int) {
    alertsByMember(memberId: $memberId, limit: $limit, offset: $offset) {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;

export const GET_RECENT_ALERTS = gql`
  query GetRecentAlerts($hours: Int) {
    recentAlerts(hours: $hours) {
      ...AlertFields
    }
  }
  ${ALERT_FRAGMENT}
`;

// Caregivers
export const GET_CAREGIVERS = gql`
  query GetCaregivers($groupId: String!) {
    caregivers(groupId: $groupId) {
      id
      groupId
      userId
      canAcknowledgeAlerts
      canViewHistory
      canEditMembers
      joinedAt
      invitedBy
    }
  }
`;

// System Health
export const GET_SYSTEM_HEALTH = gql`
  query GetSystemHealth {
    systemHealth {
      status
      timestamp
      activeUsers
      activeMembers
      readingsLastHour
      activeAlerts
      version
    }
  }
`;
