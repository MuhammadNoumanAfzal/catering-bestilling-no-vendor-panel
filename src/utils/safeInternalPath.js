// Treat notification destinations as untrusted input.
export function safeInternalPath(value, origin) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const base = new URL(origin);
    const target = new URL(value.trim(), base);
    if (!/^https?:$/.test(target.protocol) || target.origin !== base.origin || target.username || target.password) return null;
    const decodedPath = decodeURIComponent(target.pathname);
    if (decodedPath.startsWith("//") || decodedPath.includes("\\") || Array.from(decodedPath).some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) return null;
    return target.pathname + target.search + target.hash;
  } catch {
    return null;
  }
}
