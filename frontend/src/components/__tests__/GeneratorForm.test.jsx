import { render, screen, fireEvent } from "@testing-library/react";
import {describe, it, expect, vi} from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter,Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import GeneratorForm from "../GeneratorForm.jsx";

describe("Test generator form", () => {
    it("renders all main forms", () => {
        render(
            <GeneratorForm
                onSubmit={vi.fn()}
                loading={false}
                serverErrors={{}}
                clearErrors={vi.fn()}
            />
        );
        
        // Date and time input labels
        expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/wake up/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sleep/i)).toBeInTheDocument();

        // Global checkbox option labels
        expect(screen.getByLabelText(/even spread/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/include scheduled/i)).toBeInTheDocument();

        // Inputs
        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/duration \(minutes\)/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/frequency \(times per week\)/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/description \(optional\)/i)).toBeInTheDocument();

        // Dropdown options
        expect(screen.getByDisplayValue("None")).toBeInTheDocument();

        // Buttons
        expect(screen.getByRole("button", { name: /add another event/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create schedule/i })).toBeInTheDocument(); 
    });

    it("include scheduled is disabled initially and becomes enabled when even spread is checked", () => {
        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={{}}
            clearErrors={vi.fn()}
        />
        );

        const evenSpreadCheckbox = screen.getByLabelText(/even spread/i);
        const includeScheduledCheckbox = screen.getByLabelText(/include scheduled/i);

        expect(includeScheduledCheckbox).toBeDisabled();

        fireEvent.click(evenSpreadCheckbox);
        expect(includeScheduledCheckbox).not.toBeDisabled();

        fireEvent.click(evenSpreadCheckbox);
        expect(includeScheduledCheckbox).toBeDisabled();
        expect(includeScheduledCheckbox).not.toBeChecked();
    });

    it("daily checkbox disables frequency and sets it to 1", () => {
        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={{}}
            clearErrors={vi.fn()}
        />
        );

        const dailyCheckbox = screen.getByLabelText(/daily/i);
        const frequencyInput = screen.getByPlaceholderText(/frequency \(times per week\)/i);

        expect(frequencyInput).not.toBeDisabled();

        fireEvent.click(dailyCheckbox);

        expect(frequencyInput).toBeDisabled();
        expect(frequencyInput).toHaveValue(1);
    });

    it("add another event and delete event works", () => {
        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={{}}
            clearErrors={vi.fn()}
        />
        );

        fireEvent.click(screen.getByRole("button", { name: /add another event/i }));
        expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(2);

        const deleteButtons = screen.getAllByRole("button", { name: /delete event/i });
        expect(deleteButtons).toHaveLength(2);

        fireEvent.click(deleteButtons[0]);

        expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(1);
        expect(screen.queryByRole("button", { name: /delete event/i })).not.toBeInTheDocument();
    });

    

})
