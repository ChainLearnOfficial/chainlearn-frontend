import { describe, expect, it } from "vitest";
import { parseModuleContent } from "./courses";
import type { Module, ModuleContent } from "@/types/course";

function createModule(
  contentType: Module["contentType"],
  content: Module["content"],
): Module {
  return {
    id: "module-1",
    courseId: "course-1",
    title: "Module",
    description: "Description",
    order: 1,
    contentType,
    content,
    estimatedMinutes: 10,
  };
}

describe("parseModuleContent", () => {
  it("parses string-backed text content", () => {
    expect(parseModuleContent(createModule("text", "<p>Lesson</p>"))).toEqual({
      type: "text",
      body: "<p>Lesson</p>",
    });
  });

  it("parses string-backed video and interactive content", () => {
    expect(parseModuleContent(createModule("video", "/lesson.mp4"))).toEqual({
      type: "video",
      url: "/lesson.mp4",
    });
    expect(
      parseModuleContent(createModule("interactive", "challenge-1")),
    ).toEqual({
      type: "interactive",
      challengeId: "challenge-1",
    });
  });

  it("preserves structured module content", () => {
    const content: ModuleContent = {
      type: "interactive",
      challengeId: "challenge-2",
      instructions: "Complete the task",
    };
    expect(parseModuleContent(createModule("interactive", content))).toBe(
      content,
    );
  });
});
