import { apiClient } from "./client";
import { getValidToken } from "./auth";
import type { AppNotification } from "@/types/notification";

/**
 * Fetch the authenticated user's notifications, newest first.
 */
export async function getNotifications(
  jwt: string,
  signal?: AbortSignal
): Promise<AppNotification[]> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  const response = await apiClient.get<AppNotification[]>(
    "/notifications",
    token,
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
  const validToken = await getValidToken();
  const token = validToken || jwt;
  await apiClient.post<void>(`/notifications/${id}/read`, {}, token, signal);
}

/**
 * Mark every notification as read.
 */
export async function markAllNotificationsAsRead(
  jwt: string,
  signal?: AbortSignal
): Promise<void> {
  const validToken = await getValidToken();
  const token = validToken || jwt;
  await apiClient.post<void>("/notifications/read-all", {}, token, signal);
}