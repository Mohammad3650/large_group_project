import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";

//Mock api.js to prevent it from executing its top-level localStorage.getItem call on module load
vi.mock("../../api.js", () => ({
  default: {},
}));

import SuccessfulTimeBlock from "../SuccessfulTimeBlock.jsx";

describe("Succesful time block created", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Renders the text to show a time block has been created successfully", () => {
    render(
      <MemoryRouter>
        <SuccessfulTimeBlock />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Time Block Created Successfully"))
      .toBeInTheDocument();

    expect(
      screen.getByText("Your time block was created successfully"))
      .toBeInTheDocument();
  });

  it("Renders the buttons for when a time block has been created successfully", () => {
    render(
      <MemoryRouter
        initialEntries={[
          { pathname: "/success", state: { id: 123 } }
        ]}
      >
    <Routes>
      <Route path="/success" element={<SuccessfulTimeBlock />} />
    </Routes>
  </MemoryRouter>
);

    const newBlockButton = screen.getByRole("button", {
      name: /new time block/i,
    });

    const editTimeBlockButton = screen.getByRole("button", {
      name: /edit time block/i,
    });

    const dashboardButton = screen.getByRole("button", {
      name: /return to dashboard/i,
    });

    const viewInCalendarButton = screen.getByRole("button", {
      name: /view in calendar/i,
    });

    expect(newBlockButton).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /edit time block/i })).toBeInTheDocument();
    expect(dashboardButton).toBeInTheDocument();
    expect(viewInCalendarButton).toBeInTheDocument();
  });

  it("Tick image loads up on the screen", () => {
    render(
    <MemoryRouter>
      <SuccessfulTimeBlock />
    </MemoryRouter>
    );

    const image = screen.getByRole("img", {
      name: /success tick icon/i,
    });

    expect(image).toBeInTheDocument();
  });

  it("New time block button takes the user to the create time block page", () => {
    render(
    <MemoryRouter initialEntries={["/successful-timeblock"]}>
      <Routes>
        <Route path="/successful-timeblock" element={<SuccessfulTimeBlock />} />
        <Route path="/create-schedule" element={<h2>Create Time Block</h2>} />
      </Routes>
    </MemoryRouter>
    );

    const newBlockButton = screen.getByRole("button", {
      name: /new time block/i,
    });

    fireEvent.click(newBlockButton);

    expect(screen.getByText("Create Time Block")).toBeInTheDocument();
  });

  it("Return to dashboard navigates to /dashboard", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/success"]}>
        <Routes>
          <Route path="/success" element={<SuccessfulTimeBlock />} />
          <Route path="/dashboard" element={<p>🎉 Congrats, you have no tasks for the next week!</p>} />
        </Routes>
      </MemoryRouter>
    );

    const dashboardButton = screen.getByRole("button", {
      name: /return to dashboard/i,
    });

    fireEvent.click(dashboardButton);

    expect(screen.getByText("🎉 Congrats, you have no tasks for the next week!")).toBeInTheDocument();
  });

  it("Does not render the Edit Time Block button when blockId is missing", () => {
    render(
      <MemoryRouter initialEntries={["/success"]}>
        <Routes>
          <Route path="/success" element={<SuccessfulTimeBlock />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.queryByRole("button", { name: /edit time block/i })
    ).not.toBeInTheDocument();
  });

  it("Edit Time Block button navigates to the edit page when blockId exists", () => {
    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/success", state: { id: 123 } }]}
      >
        <Routes>
          <Route path="/success" element={<SuccessfulTimeBlock />} />
          <Route path="/timeblocks/123/edit" element={<h2>Edit Time Block Page</h2>} />
        </Routes>
      </MemoryRouter>
    );

    const editButton = screen.getByRole("button", {
      name: /edit time block/i,
    });

    fireEvent.click(editButton);

    expect(screen.getByText("Edit Time Block Page")).toBeInTheDocument();
  });

  it("View in Calendar button navigates to the calendar page", () => {
    render(
      <MemoryRouter initialEntries={["/success"]}>
        <Routes>
          <Route path="/success" element={<SuccessfulTimeBlock />} />
          <Route path="/calendar" element={<h2>Calendar Page</h2>} />
        </Routes>
      </MemoryRouter>
    );

    const calendarButton = screen.getByRole("button", {
      name: /view in calendar/i,
    });

    fireEvent.click(calendarButton);

    expect(screen.getByText("Calendar Page")).toBeInTheDocument();
  });
});


