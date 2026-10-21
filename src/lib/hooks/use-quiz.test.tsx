import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthStore } from "@/store/auth-store";
import { getQuiz } from "@/lib/api/quizzes";
import { useQuiz } from "./use-quiz";

vi.mock("@/lib/api/quizzes", () => ({
  getQuiz: vi.fn(),
}));

vi.mock("@/lib/api/client", () => ({
  isAbortError: vi.fn((error) => error?.name === "AbortError"),
}));

describe("useQuiz", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({ jwt: null });
  });

  it("clears a previous course error when fetching a new course", async () => {
    let resolveSecondFetch!: (quiz: { id: string }) => void;
    vi.mocked(getQuiz)
      .mockRejectedValueOnce(new Error("Course A failed"))
      .mockImplementationOnce(
        () => new Promise((resolve) => { resolveSecondFetch = resolve; }) as never
      );

    const { result, rerender } = renderHook(
      ({ courseId }) => useQuiz(courseId),
      { initialProps: { courseId: "course-a" } }
    );

    await waitFor(() => expect(result.current.error).toBe("Course A failed"));

    rerender({ courseId: "course-b" });
    await waitFor(() => expect(result.current.loading).toBe(true));
    expect(result.current.error).toBeNull();

    await act(async () => {
      resolveSecondFetch({ id: "quiz-b" });
    });
    await waitFor(() => expect(result.current.quiz).toEqual({ id: "quiz-b" }));
  });
});