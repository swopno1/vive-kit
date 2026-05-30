/**
 * ViveKit Phase 13 - Authentication, Multi-Workspace & Team Collaboration Types
 */

export type UserRole = 'owner' | 'admin' | 'manager' | 'agent' | 'viewer';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  tenantId: string;
  plan: 'free' | 'growth' | 'enterprise';
  maxSeats: number;
  activeSeats: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'active' | 'invited';
  joinedAt: string;
}

export interface UserWorkspaceMembership {
  workspaceId: string;
  userId: string;
  role: UserRole;
  joinedAt: string;
}

export interface CollaborationComment {
  id: string;
  conversationId: string;
  authorName: string;
  authorRole: UserRole;
  text: string;
  timestamp: string;
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: string;
}

export interface WorkspaceAuditLog {
  id: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
