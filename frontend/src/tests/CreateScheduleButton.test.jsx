import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import {describe, it, expect} from "vitest";
import "@testing-library/jest-dom/vitest";
import CreateScheduleButton from "../components/CreateScheduleButton";

describe("Create schedule button takes the user to the page to create a time block", () => {
    it("navigates to /create-schedule when clicked", () => {
    render(
        <MemoryRouter initialEntries={["/"]}>
        <Routes>
            <Route path="/" element={<CreateScheduleButton />} />
            <Route
            path="/create-schedule"
            element={<h2>Create Time Block</h2>}
            />
        </Routes>
        </MemoryRouter>
    );

    const button = screen.getByRole("button", {
        name: /create schedule/i,
    });

    fireEvent.click(button);

    expect(
        screen.getByText("Create Time Block")
    ).toBeInTheDocument();
    });
});