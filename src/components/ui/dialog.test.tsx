import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

/**
 * The accessibility behaviour is the point of using Radix here, so it is what
 * these tests assert: labelling, focus trapping, focus restoration, and the two
 * dismissal paths.
 */

function Example({
  onConfirm = () => {},
  ...contentProps
}: { onConfirm?: () => void } & React.ComponentProps<typeof DialogContent>) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Enroll</Button>
      </DialogTrigger>
      <DialogContent {...contentProps}>
        <DialogHeader>
          <DialogTitle>Enroll in this course?</DialogTitle>
          <DialogDescription>You can leave at any time.</DialogDescription>
        </DialogHeader>
        <p>Course body content</p>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("is closed until the trigger is activated", () => {
    render(<Example />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enroll" })).toBeInTheDocument();
  });

  it("opens when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByRole("button", { name: "Enroll" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Course body content")).toBeInTheDocument();
  });

  it("is announced with its title and description", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));

    const dialog = await screen.findByRole("dialog");

    // Radix wires aria-labelledby/aria-describedby to the title and
    // description, which is what a screen reader reads on open.
    const labelledBy = dialog.getAttribute("aria-labelledby");
    const describedBy = dialog.getAttribute("aria-describedby");

    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toHaveTextContent(
      "Enroll in this course?"
    );
    expect(document.getElementById(describedBy as string)).toHaveTextContent(
      "You can leave at any time."
    );
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("closes when the overlay is clicked", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("dialog");

    const overlay = document.querySelector('[class*="bg-black/50"]');
    expect(overlay).toBeTruthy();

    // Radix dismisses on pointerdown-outside, and while the dialog is modal it
    // sets pointer-events:none on the rest of the document — which userEvent
    // refuses to click through. Dispatching the event Radix actually listens
    // for exercises the real dismissal path.
    fireEvent.pointerDown(overlay as Element, {
      button: 0,
      ctrlKey: false,
      pointerType: "mouse",
    });
    // Radix confirms a pointerdown-outside with the trailing click before
    // dismissing, so both are needed to reproduce a real overlay click.
    fireEvent.click(overlay as Element, { button: 0, ctrlKey: false });

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("closes via the built-in close button", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Close" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("closes via a DialogClose in the footer", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("runs a footer action without closing on its own", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Example onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "Confirm" }));

    // The caller owns when a confirm action dismisses; the dialog does not
    // assume success.
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("moves focus into the dialog on open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const dialog = await screen.findByRole("dialog");

    await waitFor(() =>
      expect(dialog.contains(document.activeElement)).toBe(true)
    );
  });

  it("traps focus inside the dialog", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const dialog = await screen.findByRole("dialog");

    // Tab through more elements than the dialog contains; focus must never
    // escape to the trigger or the document body.
    for (let i = 0; i < 8; i += 1) {
      await user.tab();
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it("restores focus to the trigger when closed", async () => {
    const user = userEvent.setup();
    render(<Example />);
    const trigger = screen.getByRole("button", { name: "Enroll" });

    await user.click(trigger);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("hides background content from assistive tech while open", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const dialog = await screen.findByRole("dialog");

    // Radix enforces modality by aria-hidden-ing the rest of the document and
    // bracketing the content in focus guards, rather than by setting
    // aria-modal. Assert the mechanism it actually uses.
    const hiddenSiblings = Array.from(document.body.children).filter(
      (el) => el !== dialog.parentElement && el.getAttribute("aria-hidden") === "true"
    );
    const portalSiblings = Array.from(dialog.parentElement?.children ?? []);

    expect(
      hiddenSiblings.length > 0 ||
        portalSiblings.some((el) => el.getAttribute("aria-hidden") === "true")
    ).toBe(true);
    expect(
      portalSiblings.filter((el) => el.hasAttribute("data-radix-focus-guard"))
    ).toHaveLength(2);
  });

  it("omits the close button when asked", async () => {
    const user = userEvent.setup();
    render(<Example hideCloseButton />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    await screen.findByRole("dialog");

    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    // Escape still dismisses, so the dialog is never a trap.
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    );
  });

  it("can be prevented from closing on outside interaction", async () => {
    const user = userEvent.setup();
    render(
      <Dialog defaultOpen>
        <DialogContent
          onEscapeKeyDown={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <DialogTitle>Claiming reward</DialogTitle>
          <DialogDescription>Do not close mid-transaction.</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");

    // A transaction in flight should not be dismissable by accident.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("supports controlled open state", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Controlled</DialogTitle>
          <DialogDescription>Owned by the parent.</DialogDescription>
        </DialogContent>
      </Dialog>
    );

    expect(await screen.findByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("applies the animation classes for enter and exit", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));
    const dialog = await screen.findByRole("dialog");

    expect(dialog.className).toContain("data-[state=open]:animate-content-in");
    expect(dialog.className).toContain("data-[state=closed]:animate-content-out");
  });

  it("merges a caller className onto the content", async () => {
    const user = userEvent.setup();
    render(<Example className="max-w-2xl" />);
    await user.click(screen.getByRole("button", { name: "Enroll" }));

    expect((await screen.findByRole("dialog")).className).toContain("max-w-2xl");
  });
});

describe("Dialog layout parts", () => {
  it("renders header and footer with their classes", () => {
    render(
      <div>
        <DialogHeader data-testid="header" className="custom-header" />
        <DialogFooter data-testid="footer" className="custom-footer" />
      </div>
    );

    expect(screen.getByTestId("header").className).toContain("custom-header");
    expect(screen.getByTestId("header").className).toContain("flex-col");
    expect(screen.getByTestId("footer").className).toContain("custom-footer");
    expect(screen.getByTestId("footer").className).toContain("sm:justify-end");
  });
});
