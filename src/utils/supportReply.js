// The server may return an existing message on a retry; never append it twice.
export function mergeSupportReply(messages = [], reply) {
  if (!reply?.id) return messages;
  return messages.some(message => String(message.id) === String(reply.id)) ? messages : [...messages, reply];
}
