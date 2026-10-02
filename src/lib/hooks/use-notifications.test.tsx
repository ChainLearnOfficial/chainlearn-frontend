import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useNotifications } from "./use-notifications";
import { useAuthStore } from "@/store/auth-store";

// Mock API modules
vi.mock("@/lib/api/notifications", () => ({
  getNotifications: vi.fn(),
  markAllNotificationsAsRead: vi.fn(),
  markNotificationAsRead: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  isAbortError: vi.fn((err) => err?.name === "AbortError"),
}));

describe("useNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ jwt: null });
  });

  it("should initialize with empty notifications when not authenticated", () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
    expect(result.current.loading).toBe(false);
  });

  it("should fetch notifications when authenticated", async () => {
    const mockNotifications = [
      { id: "notif-1", message: "Test", read: false },
      { id: "notif-2", message: "Test 2", read: true },
    ];
    const { getNotifications } = await import("@/lib/api/notifications");
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications as any);

    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("should calculate unread count correctly", async () => {
    const mockNotifications = [
      { id: "notif-1", message: "Test", read: false },
      { id: "notif-2", message: "Test 2", read: false },
      { id: "notif-3", message: "Test 3", read: true },
    ];
    const { getNotifications } = await import("@/lib/api/notifications");
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications as any);

    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.unreadCount).toBe(2);
    });
  });

  it("should mark notification as read", async () => {
    const mockNotifications = [{ id: "notif-1", message: "Test", read: false }];
    const { getNotifications, markNotificationAsRead } =
      await import("@/lib/api/notifications");
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications as any);
    vi.mocked(markNotificationAsRead).mockResolvedValue(undefined);

    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead("notif-1");
    });

    expect(markNotificationAsRead).toHaveBeenCalledWith("notif-1", "mock-jwt");
    expect(result.current.notifications[0].read).toBe(true);
  });

  it("should revert mark as read on error", async () => {
    const mockNotifications = [{ id: "notif-1", message: "Test", read: false }];
    const { getNotifications, markNotificationAsRead } =
      await import("@/lib/api/notifications");
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications as any);
    vi.mocked(markNotificationAsRead).mockRejectedValue(new Error("Failed"));

    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAsRead("notif-1");
    });

    expect(result.current.notifications[0].read).toBe(false);
  });

  it("should mark all notifications as read", async () => {
    const mockNotifications = [
      { id: "notif-1", message: "Test", read: false },
      { id: "notif-2", message: "Test 2", read: false },
    ];
    const { getNotifications, markAllNotificationsAsRead } =
      await import("@/lib/api/notifications");
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications as any);
    vi.mocked(markAllNotificationsAsRead).mockResolvedValue(undefined);

    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(markAllNotificationsAsRead).toHaveBeenCalledWith("mock-jwt");
    expect(result.current.notifications.every((n: any) => n.read)).toBe(true);
  });

  it("should refetch notifications", async () => {
    const mockNotifications = [{ id: "notif-1", message: "Test", read: false }];
    const { getNotifications } = await import("@/lib/api/notifications");
    vi.mocked(getNotifications).mockResolvedValue(mockNotifications as any);

    useAuthStore.setState({ jwt: "mock-jwt" });
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.refetch();
    });

    expect(getNotifications).toHaveBeenCalledTimes(2);
  });
});
