import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter } from "react-router-dom";
import TimeBlockForm from "../TimeBlockForm.jsx";

describe("TimeBlockForm tests", () => {
  it("Renders all current form fields", () => {
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

    expect(document.querySelector('input[type="date"]')).toBeInTheDocument();

    expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();

    // block type select defaults to Study
    expect(screen.getByDisplayValue("Study")).toBeInTheDocument();

    // time inputs are always present in the actual component
    const timeInputs = document.querySelectorAll('input[type="time"]');
    expect(timeInputs).toHaveLength(2);

    expect(
        screen.getByPlaceholderText(/description \(optional\)/i)
    ).toBeInTheDocument();

    expect(
        screen.getByRole("button", { name: /add another event/i })
    ).toBeInTheDocument();

    expect(
        screen.getByRole("button", { name: /create schedule/i })
    ).toBeInTheDocument();
  });

  it("renders all server errors when provided", () => {
    const serverErrors = [
        {
        date: ["Date is required"],
        name: ["Name is required"],
        location: ["Location is required"],
        start_time: ["Start time is required"],
        end_time: ["End time is required"],
        },
    ];

    render(
        <MemoryRouter>
        <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={serverErrors}
            clearErrors={vi.fn()}
        />
        </MemoryRouter>
    );

    expect(screen.getByText(/date is required/i)).toBeInTheDocument();
    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/location is required/i)).toBeInTheDocument();
    expect(screen.getByText(/start time is required/i)).toBeInTheDocument();
    expect(screen.getByText(/end time is required/i)).toBeInTheDocument();
  });



  it("Lets the user add and delete events", () => {
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

    fireEvent.click(screen.getByRole("button", { name: /add another event/i }));

    expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(2);

    const deleteButtons = screen.getAllByRole("button", {
      name: /delete event/i,
    });
    expect(deleteButtons).toHaveLength(2);

    fireEvent.click(deleteButtons[0]);

    expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(1);
    expect(
      screen.queryByRole("button", { name: /delete event/i })
    ).not.toBeInTheDocument();
  });

  it("does not show delete button when only one block exists", () => {
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

    expect(
        screen.queryByRole("button", { name: /delete event/i })
    ).not.toBeInTheDocument();
    });

  it("Submits the form data for all blocks", () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <TimeBlockForm
          onSubmit={onSubmit}
          loading={false}
          serverErrors={[]}
          clearErrors={vi.fn()}
        />
      </MemoryRouter>
    );

    const dateInput = document.querySelector('input[type="date"]');
    const nameInput = screen.getByPlaceholderText(/name/i);
    const locationInput = screen.getByPlaceholderText(/location/i);
    const descriptionInput = screen.getByPlaceholderText(/description \(optional\)/i);
    const timeInputs = document.querySelectorAll('input[type="time"]');

    fireEvent.change(dateInput, { target: { value: "2026-03-23" } });
    fireEvent.change(nameInput, { target: { value: "Maths Revision" } });
    fireEvent.change(locationInput, { target: { value: "Library" } });
    fireEvent.change(descriptionInput, { target: { value: "Simplex algorithm" } });
    fireEvent.change(timeInputs[0], { target: { value: "09:00" } });
    fireEvent.change(timeInputs[1], { target: { value: "11:00" } });

    fireEvent.click(screen.getByRole("button", { name: /create schedule/i }));

    expect(onSubmit).toHaveBeenCalledWith([
      {
        id: undefined,
        date: "2026-03-23",
        name: "Maths Revision",
        location: "Library",
        description: "Simplex algorithm",
        block_type: "study",
        start_time: "09:00",
        end_time: "11:00",
        timezone: "Europe/London",
      },
    ]);
  });

  it("Shows Create Schedule when loading is false", () => {
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

    expect(
        screen.getByRole("button", { name: /create schedule/i })
    ).toBeInTheDocument();
  });

  it("Clears errors when adding, updating, and deleting blocks", () => {
    const clearErrors = vi.fn();

    render(
      <MemoryRouter>
        <TimeBlockForm
          onSubmit={vi.fn()}
          loading={false}
          serverErrors={[]}
          clearErrors={clearErrors}
        />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Task 1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add another event/i }));

    let deleteButtons = screen.getAllByRole("button", { name: /delete event/i });
    fireEvent.click(deleteButtons[0]);

    expect(clearErrors).toHaveBeenCalled();
  });

  it("Shows Saving... and disables submit button when loading is true", () => {
    render(
      <MemoryRouter>
        <TimeBlockForm
          onSubmit={vi.fn()}
          loading={true}
          serverErrors={[]}
          clearErrors={vi.fn()}
        />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole("button", { name: /saving/i });
    expect(submitButton).toBeDisabled();
  });

  it("Changes block type from study to work after editing", () => {
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

    const select = screen.getByDisplayValue("Study");
    fireEvent.change(select, { target: { value: "work" } });

    expect(screen.getByDisplayValue("Work")).toBeInTheDocument();
  });

  it("hides add another event button in edit mode", () => {
    const initialData = {
        id: 1,
        date: "2026-03-24",
        name: "Meeting",
        location: "Room 2",
        block_type: "work",
        description: "Code Review",
        start_time: "14:00",
        end_time: "15:00",
    };

    render(
        <MemoryRouter>
        <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={[]}
            clearErrors={vi.fn()}
            initialData={initialData}
        />
        </MemoryRouter>
    );

    expect(
        screen.queryByRole("button", { name: /add another event/i })
    ).not.toBeInTheDocument();
  });

  it("Submits multiple blocks correctly", () => {
    const onSubmit = vi.fn();

    render(
      <MemoryRouter>
        <TimeBlockForm
          onSubmit={onSubmit}
          loading={false}
          serverErrors={[]}
          clearErrors={vi.fn()}
        />
      </MemoryRouter>
    );

    fireEvent.change(document.querySelector('input[type="date"]'), {
      target: { value: "2026-03-23" },
    });

    fireEvent.change(screen.getByPlaceholderText(/name/i), {
      target: { value: "Lecture prep" },
    });

    fireEvent.change(screen.getByPlaceholderText(/location/i), {
      target: { value: "Library" },
    });

    let timeInputs = document.querySelectorAll('input[type="time"]');
    fireEvent.change(timeInputs[0], { target: { value: "09:00" } });
    fireEvent.change(timeInputs[1], { target: { value: "10:00" } });

    fireEvent.click(screen.getByRole("button", { name: /add another event/i }));

    const nameInputs = screen.getAllByPlaceholderText(/name/i);
    const locationInputs = screen.getAllByPlaceholderText(/location/i);
    const descriptionInputs = screen.getAllByPlaceholderText(/description \(optional\)/i);
    timeInputs = document.querySelectorAll('input[type="time"]');

    fireEvent.change(nameInputs[1], { target: { value: "Gym" } });
    fireEvent.change(locationInputs[1], { target: { value: "Campus gym" } });
    fireEvent.change(descriptionInputs[1], { target: { value: "Leg day" } });
    fireEvent.change(timeInputs[2], { target: { value: "18:00" } });
    fireEvent.change(timeInputs[3], { target: { value: "19:00" } });

    fireEvent.click(screen.getByRole("button", { name: /create schedule/i }));

    expect(onSubmit).toHaveBeenCalledWith([
      {
        id: undefined,
        date: "2026-03-23",
        name: "Lecture prep",
        location: "Library",
        description: "",
        block_type: "study",
        start_time: "09:00",
        end_time: "10:00",
        timezone: "Europe/London",
      },
      {
        id: undefined,
        date: "2026-03-23",
        name: "Gym",
        location: "Campus gym",
        description: "Leg day",
        block_type: "study",
        start_time: "18:00",
        end_time: "19:00",
        timezone: "Europe/London",
      },
    ]);
  });

  it("Updates the form when initialData changes after render", () => {
    const firstData = {
        id: 1,
        date: "2026-03-26",
        name: "First block",
        location: "Room A",
        block_type: "study",
        description: "First description",
        start_time: "08:00",
        end_time: "09:00",
    };

    const secondData = {
        id: 2,
        date: "2026-03-27",
        name: "Second block",
        location: "Room B",
        block_type: "work",
        description: "Second description",
        start_time: "10:00",
        end_time: "11:30",
    };

    const { rerender } = render(
        <MemoryRouter>
        <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={[]}
            clearErrors={vi.fn()}
            initialData={firstData}
        />
        </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/name/i)).toHaveValue("First block");

    rerender(
        <MemoryRouter>
        <TimeBlockForm
            onSubmit={vi.fn()}
            loading={false}
            serverErrors={[]}
            clearErrors={vi.fn()}
            initialData={secondData}
        />
        </MemoryRouter>
    );

    expect(document.querySelector('input[type="date"]')).toHaveValue("2026-03-27");
    expect(screen.getByPlaceholderText(/name/i)).toHaveValue("Second block");
    expect(screen.getByPlaceholderText(/location/i)).toHaveValue("Room B");
    expect(screen.getByPlaceholderText(/description \(optional\)/i)).toHaveValue("Second description");
    expect(screen.getByDisplayValue("Work")).toBeInTheDocument();

    const timeInputs = document.querySelectorAll('input[type="time"]');
    expect(timeInputs[0]).toHaveValue("10:00");
    expect(timeInputs[1]).toHaveValue("11:30");
    });

    it("Falls back to empty strings when initialData times are missing", () => {
        const initialData = {
            id: 3,
            date: "2026-03-28",
            name: "No times block",
            location: "Library",
            block_type: "study",
            description: "Missing times",
            start_time: null,
            end_time: null,
        };

        render(
            <MemoryRouter>
            <TimeBlockForm
                onSubmit={vi.fn()}
                loading={false}
                serverErrors={[]}
                clearErrors={vi.fn()}
                initialData={initialData}
            />
            </MemoryRouter>
        );

        const timeInputs = document.querySelectorAll('input[type="time"]');
        expect(timeInputs[0]).toHaveValue("");
        expect(timeInputs[1]).toHaveValue("");
    });

    it("Updates from create mode to edit mode when initialData is later provided", () => {
        const data = {
            id: 7,
            date: "2026-03-29",
            name: "Later block",
            location: "Room C",
            block_type: "lecture",
            description: "Loaded later",
            start_time: "12:00",
            end_time: "13:00",
        };

        const { rerender } = render(
            <MemoryRouter>
            <TimeBlockForm
                onSubmit={vi.fn()}
                loading={false}
                serverErrors={[]}
                clearErrors={vi.fn()}
            />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/name/i)).toHaveValue("");

        rerender(
            <MemoryRouter>
            <TimeBlockForm
                onSubmit={vi.fn()}
                loading={false}
                serverErrors={[]}
                clearErrors={vi.fn()}
                initialData={data}
            />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText(/name/i)).toHaveValue("Later block");
        expect(screen.getByPlaceholderText(/location/i)).toHaveValue("Room C");
    });

    it("Updates description to an empty string when initialData description is missing", () => {
        const firstData = {
            id: 1,
            date: "2026-03-26",
            name: "First block",
            location: "Room A",
            block_type: "study",
            description: "Has description",
            start_time: "08:00",
            end_time: "09:00",
        };

        const secondData = {
            id: 2,
            date: "2026-03-27",
            name: "Second block",
            location: "Room B",
            block_type: "work",
            description: "",
            start_time: "10:00",
            end_time: "11:30",
        };

        const { rerender } = render(
            <MemoryRouter>
            <TimeBlockForm
                onSubmit={vi.fn()}
                loading={false}
                serverErrors={[]}
                clearErrors={vi.fn()}
                initialData={firstData}
            />
            </MemoryRouter>
        );

        expect(
            screen.getByPlaceholderText(/description \(optional\)/i)
        ).toHaveValue("Has description");

        rerender(
            <MemoryRouter>
            <TimeBlockForm
                onSubmit={vi.fn()}
                loading={false}
                serverErrors={[]}
                clearErrors={vi.fn()}
                initialData={secondData}
            />
            </MemoryRouter>
        );

        expect(
            screen.getByPlaceholderText(/description \(optional\)/i)
        ).toHaveValue("");
    });
});