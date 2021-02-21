import { role } from './DataTypes';

export const allRoles: role[] = [
  'lead',
  'admin',
  'tpm',
  'pm',
  'developer',
  'designer'
];

export class PermissionsManager {
  static canEditMembers(role: role): boolean {
    if (role === 'lead' || role === 'admin') {
      return true;
    }
    return false;
  }

  static canEditTeams(role: role): boolean {
    if (role === 'lead' || role === 'admin') {
      return true;
    }
    return false;
  }
}
