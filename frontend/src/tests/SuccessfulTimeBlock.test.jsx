import { render, screen, fireEvent } from "@testing-library/react";
import {describe, it, expect} from "vitest";
import "@testing-library/jest-dom/vitest"
import { MemoryRouter,Routes, Route } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import SuccessfulTimeBlock from "../components/successfulTimeBlock";

describe("Succesful time block created", () => {
  it("renders the text to show a time block has been created successfully", () => {
    render(
      <MemoryRouter>
        <SuccessfulTimeBlock />
      </MemoryRouter>
    );

    expect(
      screen.getByText("Time Block Created Successfully"))
      .toBeInTheDocument();

    expect(
      screen.getByText("Your time block was created successfully. You can either create a new time block or return to your dashboard."))
      .toBeInTheDocument();
  });

  it("renders the buttons for when a time block has been created successfully", () => {
    render(
      <MemoryRouter>
        <SuccessfulTimeBlock />
      </MemoryRouter>
    );

    const newBlockButton = screen.getByRole("button", {
      name: /New Time Block/,
    });

    const dashboardButton = screen.getByRole("button", {
      name: /Return To Dashboard/,
    });

    expect(newBlockButton).toBeInTheDocument();
    expect(dashboardButton).toBeInTheDocument();
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
      name: /New Time Block/,
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
          <Route path="/dashboard" element={<h1>Dashboard Page</h1>} />
        </Routes>
      </MemoryRouter>
    );

    await user.click(
      screen.getByRole("button", { name: /return to dashboard/i })
    );

    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});


