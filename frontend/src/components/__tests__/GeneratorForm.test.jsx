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

        fireEvent.click(includeScheduledCheckbox);
        expect(includeScheduledCheckbox).toBeChecked();

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
        expect(frequencyInput).toHaveValue(null);

        fireEvent.click(dailyCheckbox);

        expect(frequencyInput).toBeDisabled();
        expect(frequencyInput).toHaveValue(1);

        fireEvent.click(dailyCheckbox);
        expect(frequencyInput).not.toBeDisabled();
        expect(frequencyInput).toHaveValue(null);
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

    it("calls clearErrors via useEffect", () => {
        const mockClearErrors = vi.fn();
        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={{}}
            clearErrors={mockClearErrors}
        />
        );
        expect(mockClearErrors).toHaveBeenCalledTimes(1);
    });

    it("updates text, number, select, textarea, and time/date inputs", async () => {
        const user = userEvent.setup();
        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={{}}
            clearErrors={vi.fn()}
        />
        );

        await user.type(screen.getByPlaceholderText(/^name$/i), "Math Revision");
        await user.type(screen.getByPlaceholderText(/duration \(minutes\)/i), "90");
        await user.type(screen.getByPlaceholderText(/frequency \(times per week\)/i), "3");
        await user.type(screen.getByPlaceholderText(/location/i), "Library");
        await user.type(screen.getByPlaceholderText(/description \(optional\)/i), "practice");

        fireEvent.change(screen.getByLabelText(/start/i), { target: { value: "2026-03-23" } });
        fireEvent.change(screen.getByLabelText(/end/i), { target: { value: "2026-03-29" } });
        fireEvent.change(screen.getByLabelText(/wake up/i), { target: { value: "07:30" } });
        fireEvent.change(screen.getByLabelText(/sleep/i), { target: { value: "23:00" } });

        fireEvent.change(screen.getByDisplayValue("None"), { target: { value: "Late" } });
        fireEvent.change(screen.getByDisplayValue("Study"), { target: { value: "work" } });

        expect(screen.getByPlaceholderText(/^name$/i)).toHaveValue("Math Revision");
        expect(screen.getByPlaceholderText(/duration \(minutes\)/i)).toHaveValue(90);
        expect(screen.getByPlaceholderText(/frequency \(times per week\)/i)).toHaveValue(3);
        expect(screen.getByPlaceholderText(/location/i)).toHaveValue("Library");
        expect(screen.getByPlaceholderText(/description \(optional\)/i)).toHaveValue("practice");

        expect(screen.getByLabelText(/start/i)).toHaveValue("2026-03-23");
        expect(screen.getByLabelText(/end/i)).toHaveValue("2026-03-29");
        expect(screen.getByLabelText(/wake up/i)).toHaveValue("07:30");
        expect(screen.getByLabelText(/sleep/i)).toHaveValue("23:00");

        expect(screen.getByDisplayValue("Late")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Work")).toBeInTheDocument();
    });

    it("shows loading state and disables submit button", () => {
        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={true}
            serverErrors={{}}
            clearErrors={vi.fn()}
        />
        );

        const submitButton = screen.getByRole("button", { name: /generating/i });
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/generating/i)).toBeInTheDocument();
        expect(screen.getByText((_, el) => el?.classList.contains("spinner"))).toBeInTheDocument();
    });

    it("submits the full payload", async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn();
        render(
        <GeneratorForm
            onSubmit={mockOnSubmit}
            loading={false}
            serverErrors={{}}
            clearErrors={vi.fn()}
        />
        );

        fireEvent.change(screen.getByLabelText(/start/i), { target: { value: "2026-03-23" } });
        fireEvent.change(screen.getByLabelText(/end/i), { target: { value: "2026-03-29" } });
        fireEvent.change(screen.getByLabelText(/wake up/i), { target: { value: "08:00" } });
        fireEvent.change(screen.getByLabelText(/sleep/i), { target: { value: "22:30" } });

        await user.type(screen.getByPlaceholderText(/^name$/i), "Algorithms");
        await user.type(screen.getByPlaceholderText(/duration \(minutes\)/i), "120");
        await user.type(screen.getByPlaceholderText(/frequency \(times per week\)/i), "4");
        await user.type(screen.getByPlaceholderText(/location/i), "Campus");
        await user.type(screen.getByPlaceholderText(/description \(optional\)/i), "Past papers");

        await user.click(screen.getByLabelText(/even spread/i));
        await user.click(screen.getByLabelText(/include scheduled/i));

        fireEvent.change(screen.getByDisplayValue("None"), { target: { value: "Early" } });
        fireEvent.change(screen.getByDisplayValue("Study"), { target: { value: "lecture" } });

        await user.click(screen.getByRole("button", { name: /create schedule/i }));

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
            week_start: "2026-03-23",
            week_end: "2026-03-29",
            even_spread: true,
            include_scheduled: true,
            windows: [ { start_min: "08:00", end_min: "22:30", daily: true, }, ],
            unscheduled: [
                {
                    name: "Algorithms",
                    duration: "120",
                    frequency: "4",
                    daily: false,
                    start_time_preference: "Early",
                    location: "Campus",
                    block_type: "lecture",
                    description: "Past papers",
                },
            ],
        });
    });

    it("renders all unscheduled field errors for a block", async () => {
        const user = userEvent.setup();
        const serverErrors= {
            unscheduled: [
                {
                    name: ["Name error"],
                    duration: ["Duration error"],
                    daily: ["Daily error"],
                    frequency: ["Frequency error"],
                    start_time_preference: ["Preference error"],
                    location: ["Location error"],
                    block_type: ["Type error"],
                },
            ],
        };

        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={serverErrors}
            clearErrors={vi.fn()}
        />
        );

        expect(screen.getByText("Name error")).toBeInTheDocument();
        expect(screen.getByText("Duration error")).toBeInTheDocument();
        expect(screen.getByText("Daily error")).toBeInTheDocument();
        expect(screen.getByText("Frequency error")).toBeInTheDocument();
        expect(screen.getByText("Preference error")).toBeInTheDocument();
        expect(screen.getByText("Location error")).toBeInTheDocument();
        expect(screen.getByText("Type error")).toBeInTheDocument();

        await user.click(screen.getByLabelText(/daily/i));
        expect(screen.getByPlaceholderText(/frequency \(times per week\)/i)).toBeDisabled();
    });

    it("renders general and date-level server errors", () => {{
        const serverErrors= {
            general: ["Something went wrong"],
            week_start: ["Week start is required"],
        };

        render(
        <GeneratorForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={serverErrors}
            clearErrors={vi.fn()}
        />
        );

        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByText("Week start is required")).toBeInTheDocument();
    }});



})
