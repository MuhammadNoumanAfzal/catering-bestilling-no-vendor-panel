export const AUTH_ROLE = import.meta.env.VITE_AUTH_ROLE || "vendor";

export function isAllowedAuthRole(role) {
  return role === AUTH_ROLE;
}
