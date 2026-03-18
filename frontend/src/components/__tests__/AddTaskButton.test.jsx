import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AddTaskButton from "../AddTaskButton";

vi.mock("../stylesheets/AddTaskButton.css", () => ({}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return { ...actual, useNavigate: () => mockNavigate };
});

describe("AddTaskButton", () => {
    it("renders the button with the correct text", () => {
        render(<MemoryRouter><AddTaskButton /></MemoryRouter>);
        expect(screen.getByText("+ Add Task")).toBeInTheDocument();
    });

    it("navigates to /create-schedule when the button is clicked", () => {
        render(<MemoryRouter><AddTaskButton /></MemoryRouter>);
        fireEvent.click(screen.getByText("+ Add Task"));
        expect(mockNavigate).toHaveBeenCalledWith("/create-schedule");
    });
});