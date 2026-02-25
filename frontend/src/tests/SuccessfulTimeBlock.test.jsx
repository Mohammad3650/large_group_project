import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SuccessfulTimeBlock from "../components/successfulTimeBlock";

test("renders success message", () => {
  render(
    <MemoryRouter>
      <SuccessfulTimeBlock />
    </MemoryRouter>
  );

  expect(
    screen.getByText(/time block created successfully/i)
  ).toBeInTheDocument();
});