import { apiClient } from "./client";
import type { AppNotification } from "@/types/notification";

/**
 * Fetch the authenticated user's notifications, newest first.
 */
export async function getNotifications(
  jwt: string,
  signal?: AbortSignal
): Promise<AppNotification[]> {
  const response = await apiClient.get<AppNotification[]>(
    "/notifications",
    jwt,
    signal
  );
  return response.data;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(
  id: string,
  jwt: string,
  signal?: AbortSignal
): Promise<void> {
  await apiClient.post<void>(`/notifications/${id}/read`, {}, jwt, signal);
}

/**
 * Mark every notification as read.
 */
export async function markAllNotificationsAsRead(
  jwt: string,
  signal?: AbortSignal
): Promise<void> {
  await apiClient.post<void>("/notifications/read-all", {}, jwt, signal);
}