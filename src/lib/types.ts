export type CertificateStatus = 'NOT_REQUESTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type UserRole = 'user' | 'admin' | 'super_admin';

export type UserCategory =
  | 'PARTICIPANT'
  | 'MENTOR_JURY'
  | 'TECHNICAL_COORDINATOR'
  | 'EVENT_COORDINATOR'
  | 'ADMIN';

export type AwardLevel =
  | 'PARTICIPATION'
  | 'WINNER_1ST'
  | 'WINNER_2ND'
  | 'WINNER_3RD'
  | 'RUNNER_4TH'
  | 'RUNNER_5TH';

export interface User {
  id: string;
  name: string;
  email: string;
  contact: string;
  passwordHash: string;
  role: UserRole;
  category: UserCategory;
  createdAt: string;

  // Participant specific
  teamName?: string;
  college?: string;
  location?: string;
  state?: string;
  country?: string;
  pincode?: string;
  topicTitle?: string;
  topicDomain?: string;
  presentedOn: string; // Event Name

  // Mentor / Jury / Coordinator / Admin specific
  organization?: string;
  designation?: string;
  specialization?: string;
  technicalResponsibility?: string;
  committeeRole?: string;
  linkedinUrl?: string;

  // Admin & Event Host specific
  canApproveCertificates?: boolean;
  assignedEvent?: string;
  eventRounds?: string;
  eventDates?: string;
  eventPrizes?: string;
  eventBannerUrl?: string;
  eventDescription?: string;
  eventApproved?: boolean;

  // Custom Event Certificate Template Designer
  certOrientation?: 'landscape' | 'portrait';
  certBgStyle?: 'classic' | 'gold' | 'dark' | 'white';
  certFontStyle?: 'royal' | 'modern' | 'classic';
  certAccentColor?: string;
  certCustomTitle?: string;
  certHostSignatory?: string;
  certCustomLogoUrl?: string;
  certLogoPosition?: 'left' | 'center' | 'right';
  certCustomRibbonText?: string;
  certCustomBodyText?: string;
  certSignatures?: string; // JSON array of { name, title, imageUrl, position }

  // Submission details (Phase 1 evaluation)
  submissionFileUrl?: string;
  submissionFileName?: string;
  submissionFileSize?: string;
  submissionFileType?: string;
  submissionGithubUrl?: string;
  submissionNotes?: string;
  submittedAt?: string;

  // Certificate details
  certificateStatus: CertificateStatus;
  certificateId?: string;
  participationCertificateId?: string;
  certificateApprovedAt?: string;
  certificateApprovedBy?: string;
  rejectionReason?: string;
  awardLevel?: AwardLevel;
  awardOrientation?: 'landscape' | 'portrait';
  runnerTheme?: 'white' | 'black';

  // Password reset
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

export interface PublicParticipantInfo {
  id: string;
  name: string;
  email: string;
  contact: string;
  role: UserRole;
  category: UserCategory;
  createdAt: string;

  teamName?: string;
  college?: string;
  location?: string;
  state?: string;
  country?: string;
  pincode?: string;
  topicTitle?: string;
  topicDomain?: string;
  presentedOn: string;

  organization?: string;
  designation?: string;
  specialization?: string;
  technicalResponsibility?: string;
  committeeRole?: string;
  linkedinUrl?: string;

  canApproveCertificates?: boolean;
  assignedEvent?: string;
  eventRounds?: string;
  eventDates?: string;
  eventPrizes?: string;
  eventBannerUrl?: string;
  eventDescription?: string;
  eventApproved?: boolean;

  // Custom Event Certificate Template Designer
  certOrientation?: 'landscape' | 'portrait';
  certBgStyle?: 'classic' | 'gold' | 'dark' | 'white';
  certFontStyle?: 'royal' | 'modern' | 'classic';
  certAccentColor?: string;
  certCustomTitle?: string;
  certHostSignatory?: string;
  certCustomLogoUrl?: string;
  certLogoPosition?: 'left' | 'center' | 'right';
  certCustomRibbonText?: string;
  certCustomBodyText?: string;
  certSignatures?: string; // JSON array of { name, title, imageUrl, position }

  submissionFileUrl?: string;
  submissionFileName?: string;
  submissionFileSize?: string;
  submissionFileType?: string;
  submissionGithubUrl?: string;
  submissionNotes?: string;
  submittedAt?: string;

  certificateStatus: CertificateStatus;
  certificateId?: string;
  participationCertificateId?: string;
  certificateApprovedAt?: string;
  rejectionReason?: string;
  awardLevel?: AwardLevel;
  awardOrientation?: 'landscape' | 'portrait';
  runnerTheme?: 'white' | 'black';
}

export interface CertificateVerificationData {
  certificateId: string;
  participantName: string;
  category: UserCategory;
  awardLevel?: AwardLevel;
  teamName?: string;
  topicTitle?: string;
  topicDomain?: string;
  presentedOn: string;
  college?: string;
  organization?: string;
  designation?: string;
  specialization?: string;
  technicalResponsibility?: string;
  committeeRole?: string;
  issueDate: string;
  status: 'VALID' | 'REVOKED' | 'NOT_FOUND';
  directorName: string;
  organizationName: string;
  verificationHash: string;
}
