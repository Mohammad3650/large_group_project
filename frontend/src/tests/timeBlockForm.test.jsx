import { render, screen, fireEvent } from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter,Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import TimeBlockForm from "../components/timeBlockForm";

describe("Test that all the functionality of the flexible time block form works and renders", () => {
    it("All form fields are rendered onto the screen", () => {
        render(
        <MemoryRouter>
            <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={[]}
            clearErrors={vi.fn()}
            />
        </MemoryRouter>
        );

        // Date input
        const dateInput = document.querySelector('input[type="date"]');
        expect(dateInput).toBeInTheDocument();

        // Text inputs
        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();

        // Block type select, default is study
        expect(screen.getByDisplayValue("Study")).toBeInTheDocument();

        // Fixed/Flexible select flexible by default
        expect(screen.getByDisplayValue(/flexible/i)).toBeInTheDocument();

        // Flexible-only fields
        expect(screen.getByPlaceholderText(/duration \(minutes\)/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/preferred time of day/i)).toBeInTheDocument();

        // Description textarea
        expect(screen.getByPlaceholderText(/description \(optional\)/i)).toBeInTheDocument();

        // Buttons
        expect(screen.getByRole("button", { name: /add another event/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create schedule/i })).toBeInTheDocument();

        // Fixed-only time inputs shouldn't be visible initially
        expect(document.querySelector('input[type="time"]')).not.toBeInTheDocument();
    });

    it("Shows start and end time fields when block is set to Fixed", () => {
        render(
        <MemoryRouter>
            <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={[]}
            clearErrors={vi.fn()}
            />
        </MemoryRouter>
        );

        // Select the Flexible/Fixed dropdown
        const fixedSelect = screen.getByDisplayValue(/flexible/i);

        // Change to Fixed
        fireEvent.change(fixedSelect, {
        target: { value: "true" },
        });

        //Start time input should now appear
        const timeInputs = document.querySelectorAll('input[type="time"]');
        expect(timeInputs.length).toBe(2);

        //Duration field should disappear
        expect(
        screen.queryByPlaceholderText(/duration \(minutes\)/i)
        ).not.toBeInTheDocument();

        //Preferred time of day should disappear
        expect(
        screen.queryByDisplayValue(/preferred time of day/i)
        ).not.toBeInTheDocument();
    });

    it("Add another event button works by checking if there are two name fields on the screen", () => {
        render(
        <MemoryRouter>
            <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={[]}
            clearErrors={vi.fn()}
            />
        </MemoryRouter>
        );

        // Add a second block so delete buttons appear
        fireEvent.click(screen.getByRole("button", { name: /add another event/i }));
        expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(2);

        // Now there are TWO delete buttons (one per block)
        const deleteButtons = screen.getAllByRole("button", { name: /delete event/i });
        expect(deleteButtons).toHaveLength(2);

        // Delete the first block
        fireEvent.click(deleteButtons[0]);

        // Back to one block
        expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(1);

        // With only one block left, delete button should disappear
        expect(screen.queryByRole("button", { name: /delete event/i })).not.toBeInTheDocument();
    });
});