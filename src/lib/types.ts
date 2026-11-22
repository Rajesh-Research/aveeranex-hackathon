export type CertificateStatus = 'NOT_REQUESTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  teamName: string;
  email: string;
  contact: string;
  college: string;
  location: string;
  state: string;
  country: string;
  pincode: string;
  topicTitle: string;
  topicDomain: string;
  presentedOn: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
  certificateStatus: CertificateStatus;
  certificateId?: string;
  certificateApprovedAt?: string;
  certificateApprovedBy?: string;
  rejectionReason?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
}

export interface PublicParticipantInfo {
  id: string;
  name: string;
  teamName: string;
  email: string;
  contact: string;
  college: string;
  location: string;
  state: string;
  country: string;
  pincode: string;
  topicTitle: string;
  topicDomain: string;
  presentedOn: string;
  role: UserRole;
  createdAt: string;
  certificateStatus: CertificateStatus;
  certificateId?: string;
  certificateApprovedAt?: string;
  rejectionReason?: string;
}

export interface CertificateVerificationData {
  certificateId: string;
  participantName: string;
  teamName: string;
  topicTitle: string;
  topicDomain: string;
  presentedOn: string;
  college: string;
  issueDate: string;
  status: 'VALID' | 'REVOKED' | 'NOT_FOUND';
  directorName: string;
  organization: string;
  verificationHash: string;
}
