// import { render, screen } from "@testing-library/react";
// import { describe, it, expect, vi } from "vitest";
// import CalendarPlaceholder from "../CalendarPlaceholder";

// vi.mock("../../../components/Navbar.jsx", () => ({
//   default: () => <div>Mock Navbar</div>,
// }));

// describe("CalendarPlaceholder", () => {
//   it("renders the placeholder layout", () => {
//     const { container } = render(<CalendarPlaceholder />);

//     expect(container.querySelector(".calendardiv")).toBeInTheDocument();
//     expect(container.querySelector(".title")).toBeInTheDocument();
//   });

//   it("renders the navbar", () => {
//     render(<CalendarPlaceholder />);

//     expect(screen.getByText("Mock Navbar")).toBeInTheDocument();
//   });

//   it("renders the calendar title", () => {
//     render(<CalendarPlaceholder />);

//     expect(screen.getByText("Calendar")).toBeInTheDocument();
//   });
// });