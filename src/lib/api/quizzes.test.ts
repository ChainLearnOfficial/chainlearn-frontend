import { describe, it, expect, vi, beforeEach } from "vitest";
import { getQuiz, submitQuiz, getQuizAttempts } from "./quizzes";

vi.mock("./client", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { apiClient } from "./client";

const mockGet = vi.mocked(apiClient.get);
const mockPost = vi.mocked(apiClient.post);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("quizzes API", () => {
  describe("getQuiz", () => {
    it("fetches a quiz by course ID", async () => {
      const quiz = { id: "q1", courseId: "c1", title: "Intro Quiz", questions: [] };
      mockGet.mockResolvedValue({ data: quiz, success: true });
      const result = await getQuiz("c1", "jwt");
      expect(result).toEqual(quiz);
      expect(mockGet).toHaveBeenCalledWith("/courses/c1/quiz", "jwt");
    });

    it("works without JWT", async () => {
      const quiz = { id: "q1", courseId: "c1", title: "Quiz", questions: [] };
      mockGet.mockResolvedValue({ data: quiz, success: true });
      await getQuiz("c1");
      expect(mockGet).toHaveBeenCalledWith("/courses/c1/quiz", undefined);
    });

    it("throws when quiz not found", async () => {
      mockGet.mockRejectedValue(new Error("404"));
      await expect(getQuiz("bad")).rejects.toThrow();
    });
  });

  describe("submitQuiz", () => {
    it("submits answers and returns attempt", async () => {
      const attempt = { id: "a1", quizId: "q1", score: 90, passed: true };
      mockPost.mockResolvedValue({ data: attempt, success: true });
      const submission = { quizId: "q1", answers: [{ questionId: "1", selectedOption: 0 }] };
      const result = await submitQuiz(submission as never, "jwt");
      expect(result).toEqual(attempt);
      expect(mockPost).toHaveBeenCalledWith("/quizzes/q1/submit", submission, "jwt");
    });

    it("throws on invalid submission", async () => {
      mockPost.mockRejectedValue(new Error("bad request"));
      await expect(
        submitQuiz({ quizId: "q1", answers: [] } as never, "jwt")
      ).rejects.toThrow();
    });
  });

  describe("getQuizAttempts", () => {
    it("fetches past attempts for a quiz", async () => {
      const attempts = [{ id: "a1", quizId: "q1", score: 85, passed: true }];
      mockGet.mockResolvedValue({ data: attempts, success: true });
      const result = await getQuizAttempts("q1", "jwt");
      expect(result).toEqual(attempts);
      expect(mockGet).toHaveBeenCalledWith("/quizzes/q1/attempts", "jwt");
    });

    it("throws on unauthorized", async () => {
      mockGet.mockRejectedValue(new Error("401"));
      await expect(getQuizAttempts("q1", "bad")).rejects.toThrow();
    });
  });
});
