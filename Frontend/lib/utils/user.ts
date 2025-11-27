import type { User } from '@/types/user';

export function getFullName(user: User | null | undefined): string {
  if (!user) return 'Guest';
  if (user.name) return user.name;
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || 'User';
}

export function getInitials(user: User | null | undefined): string {
  if (!user) return 'G';
  const firstName = user.firstName || user.name?.split(' ')[0] || '';
  const lastName = user.lastName || user.name?.split(' ')[1] || '';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  return initials || 'U';
}

export function getDisplayEmail(email: string): string {
  // Truncate long emails
  if (email.length > 30) {
    return `${email.substring(0, 27)}...`;
  }
  return email;
}
