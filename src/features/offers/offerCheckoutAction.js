export function offerCheckoutAction(request, current, permissions = request?.permissions) {
  if (!request || !current || request.orderId) return null;
  if (request.status === 'ACCEPTED') return 'continue';
  if (request.status === 'OFFERED' && permissions?.canAccept) return 'accept';
  return null;
}
