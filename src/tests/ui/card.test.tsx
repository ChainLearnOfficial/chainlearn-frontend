import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("Card", () => {
  it("renders children inside a div", () => {
    render(<Card>card body</Card>);
    expect(screen.getByText("card body")).toBeInTheDocument();
  });

  it("applies default border/shadow classes", () => {
    const { container } = render(<Card />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toMatch(/rounded-xl/);
    expect(el.className).toMatch(/border/);
    expect(el.className).toMatch(/bg-white/);
  });

  it("merges custom className", () => {
    const { container } = render(<Card className="my-class" />);
    expect((container.firstChild as HTMLElement).className).toContain("my-class");
  });

  it("forwards ref", () => {
    const ref = { current: null } as React.RefObject<HTMLDivElement>;
    render(<Card ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>header</CardHeader>);
    expect(screen.getByText("header")).toBeInTheDocument();
  });
});

describe("CardTitle", () => {
  it("renders as h3", () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole("heading", { level: 3, name: "Title" })).toBeInTheDocument();
  });
});

describe("CardDescription", () => {
  it("renders description text", () => {
    render(<CardDescription>desc</CardDescription>);
    expect(screen.getByText("desc")).toBeInTheDocument();
  });
});

describe("CardContent", () => {
  it("renders children", () => {
    render(<CardContent>content</CardContent>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

describe("CardFooter", () => {
  it("renders children", () => {
    render(<CardFooter>footer</CardFooter>);
    expect(screen.getByText("footer")).toBeInTheDocument();
  });
});

describe("Card composition", () => {
  it("composes all sub-components together", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>My Card</CardTitle>
          <CardDescription>A description</CardDescription>
        </CardHeader>
        <CardContent>body text</CardContent>
        <CardFooter>footer text</CardFooter>
      </Card>
    );
    expect(screen.getByRole("heading", { name: "My Card" })).toBeInTheDocument();
    expect(screen.getByText("A description")).toBeInTheDocument();
    expect(screen.getByText("body text")).toBeInTheDocument();
    expect(screen.getByText("footer text")).toBeInTheDocument();
  });
});
