export function offerDetailPath(basePath, request) {
  const name = String(request.menuName || 'offer').toLowerCase()
    .replace(/\u00e6/g, 'ae').replace(/\u00f8/g, 'o')
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/g, '') || 'offer';
  return basePath + '/' + name + (/^\d+$/.test(String(request.id)) ? '-' : '--') + encodeURIComponent(request.id);
}

export function offerIdFromSlug(value) {
  const slug=String(value||'');
  if(slug.includes('--'))return slug.slice(slug.lastIndexOf('--')+2);
  return /^.+-([0-9]+)$/.exec(slug)?.[1] || slug;
}
