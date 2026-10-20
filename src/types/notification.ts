export type NotificationType =
  | "reward_claimed"
  | "course_completed"
  | "credential_minted"
  | "announcement"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  read: boolean;
  createdAt: string;
}