import { useMemo } from "react";

export function useSidebar(user: any) {

  const role = useMemo(() => {
    if (!user || !user.role) return 'MEMBER';
    return String(user.role).toUpperCase();
  }, [user]);

  const isAdmin = role === 'ADMINISTRATOR';
  const isModerator = role === 'MODERATOR';
  const isMember = role === 'MEMBER';

  // Tabs visible to ADMINISTRATOR and MODERATOR
  const canAccessVerification = isAdmin || isModerator;
  const canAccessSchedules = isAdmin || isModerator;

  // Tab visible to ADMINISTRATOR only
  const canManageRoles = isAdmin;

  const displayPosition = user?.position || (
    isAdmin ? "Administrator" : isModerator ? "Moderator" : "Staff Member"
  );

  const getInitials = (name: string) => {
    if (!name) return isAdmin ? 'AD' : 'ST';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const userInitials = useMemo(() => getInitials(user?.name), [user?.name, isAdmin]);

  return {
    role,
    isAdmin,
    isModerator,
    isMember,
    canAccessVerification,
    canAccessSchedules,
    canManageRoles,
    displayPosition,
    userInitials
  };
}
