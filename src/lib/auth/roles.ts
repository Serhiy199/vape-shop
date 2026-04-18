import { UserRole } from "@prisma/client";

export function isAdminRole(role: UserRole | null | undefined) {
  return role === UserRole.ADMIN;
}

export function getRoleLabel(role: UserRole | null | undefined) {
  if (role === UserRole.ADMIN) {
    return "Адміністратор";
  }

  return "Клієнт";
}

export function getRoleHomePath(role: UserRole | null | undefined) {
  return isAdminRole(role) ? "/admin" : "/";
}
