import { safeInternalPath } from '../../../utils/safeInternalPath.js';
export function loginReturnPath(from, fallback, origin) {
  const candidate=typeof from==='string' ? from : from?.pathname ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '';
  const safe=safeInternalPath(candidate,origin);
  if(!safe || /^\/auth(?:\/|$)/i.test(safe.split(/[?#]/)[0]))return fallback;
  return safe;
}
