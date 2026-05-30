import { UserRole } from '../../types/workspace';

export class WorkspaceEngine {
  public static checkPermission(role: UserRole, action: string): boolean {
    const rolesOrder: Record<UserRole, number> = {
      owner: 5, admin: 4, manager: 3, agent: 2, viewer: 1
    };
    const actionRequirements: Record<string, number> = {
      'view_conversations': 1,
      'send_replies': 2,
      'approve_strategies': 3,
      'invite_members': 4,
      'billing_settings': 5,
      'edit_ai_config': 4,
    };
    return (rolesOrder[role] || 1) >= (actionRequirements[action] || 5);
  }
}
