import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Harness({
  onValueChange,
  disabledItem,
}: {
  onValueChange?: (v: string) => void;
  disabledItem?: boolean;
}) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger aria-label="Difficulty">
        <SelectValue placeholder="Select difficulty" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="beginner">Beginner</SelectItem>
        <SelectItem value="intermediate" disabled={disabledItem}>
          Intermediate
        </SelectItem>
        <SelectItem value="advanced">Advanced</SelectItem>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("renders the trigger with placeholder", () => {
    render(<Harness />);
    expect(screen.getByRole("combobox")).toHaveTextContent("Select difficulty");
  });

  it("opens the listbox and shows options", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Beginner" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Advanced" })).toBeInTheDocument();
  });

  it("selects an option via click and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "Advanced" }));
    expect(onValueChange).toHaveBeenCalledWith("advanced");
    expect(screen.getByRole("combobox")).toHaveTextContent("Advanced");
  });

  it("supports disabled options", async () => {
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} disabledItem />);
    await userEvent.click(screen.getByRole("combobox"));
    const disabledOption = screen.getByRole("option", { name: "Intermediate" });
    expect(disabledOption.getAttribute("data-disabled")).not.toBeNull();
  });

  it("supports keyboard navigation to open and select", async () => {
    const onValueChange = vi.fn();
    render(<Harness onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox");
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });
});
