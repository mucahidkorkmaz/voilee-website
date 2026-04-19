export type NotificationPayload = {
  title: string;
  content: string;
};

// Manus Notification Service removed.
// This is a local stub that logs to console instead.
export async function notifyOwner(payload: NotificationPayload): Promise<boolean> {
  console.log(`[Notification] ${payload.title}: ${payload.content}`);
  return true;
}
