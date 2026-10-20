import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationBell } from "@/components/shared/notification-bell";
import type { AppNotification } from "@/types/notification";

const { notificationsState } = vi.hoisted(() => ({
  notificationsState: { value: [] as AppNotification[] },
}));

const markAsRead = vi.fn();
const markAllAsRead = vi.fn();

vi.mock("@/lib/hooks/use-notifications", () => ({
  useNotifications: () => ({
    notifications: notificationsState.value,
    unreadCount: notificationsState.value.filter((n) => !n.read).length,
    loading: false,
    error: null,
    refetch: vi.fn(),
    markAsRead,
    markAllAsRead,
  }),
}));

vi.mock("@/store/auth-store", () => ({
  useAuthStore: (selector: (s: { isAuthenticated: boolean; jwt: string }) => unknown) =>
    selector({ isAuthenticated: true, jwt: "test-jwt" }),
}));

function makeNotification(
  overrides: Partial<AppNotification> = {}
): AppNotification {
  return {
    id: "n1",
    type: "reward_claimed",
    title: "Reward claimed",
    message: "You earned 10 LEARN",
    read: false,
    createdAt: new Date(Date.now() - 30_000).toISOString(),
    ...overrides,
  };
}

beforeEach(() => {
  markAsRead.mockClear();
  markAllAsRead.mockClear();
  notificationsState.value = [
    makeNotification(),
    makeNotification({
      id: "n2",
      type: "credential_minted",
      title: "Credential minted",
      read: true,
      createdAt: new Date(Date.now() - 3_600_000).toISOString(),
    }),
  ];
});

describe("NotificationBell", () => {
  it("renders a bell button with the unread count", () => {
    render(<NotificationBell />);
    expect(
      screen.getByRole("button", { name: /notifications, 1 unread/i })
    ).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("hides the badge when there are no unread notifications", () => {
    notificationsState.value = notificationsState.value.map((n) => ({
      ...n,
      read: true,
    }));
    render(<NotificationBell />);
    expect(
      screen.getByRole("button", { name: /^notifications$/i })
    ).toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("opens the panel and lists notifications with timestamps", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Reward claimed")).toBeInTheDocument();
    expect(screen.getByText(/Just now/i)).toBeInTheDocument();
    expect(screen.getByText("Credential minted")).toBeInTheDocument();
  });

  it("marks a notification as read when clicked", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole("button", { name: /notifications/i }));
    const item = await screen.findByText("Reward claimed");
    await user.click(item);
    expect(markAsRead).toHaveBeenCalledWith("n1");
  });

  it("offers mark all read when there are unread notifications", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole("button", { name: /notifications/i }));
    await user.click(
      await screen.findByRole("button", { name: /mark all read/i })
    );
    expect(markAllAsRead).toHaveBeenCalledTimes(1);
  });

  it("closes the panel on escape", async () => {
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("Reward claimed")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByText("Reward claimed")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no notifications", async () => {
    notificationsState.value = [];
    const user = userEvent.setup();
    render(<NotificationBell />);
    await user.click(screen.getByRole("button", { name: /notifications/i }));
    expect(await screen.findByText("No notifications")).toBeInTheDocument();
  });
});