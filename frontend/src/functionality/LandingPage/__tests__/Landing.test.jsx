import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Landing from "../Landing";

vi.mock("../Hero", () => ({
  default: () => <div>Mock Hero</div>,
}));

vi.mock("../Features", () => ({
  default: () => <div>Mock Features</div>,
}));

vi.mock("../Card", () => ({
  default: ({ avatar, name, stars, review }) => (
    <div data-testid="mock-card">
      <span>{avatar}</span>
      <span>{name}</span>
      <span>{stars}</span>
      <span>{review}</span>
    </div>
  ),
}));

describe("Landing", () => {
  it("renders the main layout and child components", () => {
    const { container } = render(<Landing />);

    expect(container.querySelector(".landing")).toBeInTheDocument();
    expect(container.querySelector(".landing_testimonials_wrapper")).toBeInTheDocument();
    expect(container.querySelector(".landing_testimonials")).toBeInTheDocument();
    expect(container.querySelector(".landing_testimonials_title")).toBeInTheDocument();

    expect(screen.getByText("Mock Hero")).toBeInTheDocument();
    expect(screen.getByText("Mock Features")).toBeInTheDocument();
    expect(screen.getByText("Student Testimonials")).toBeInTheDocument();
  });

  it("renders all six testimonial cards", () => {
    render(<Landing />);

    expect(screen.getAllByTestId("mock-card")).toHaveLength(6);
  });

  it("renders the correct testimonial content", () => {
    render(<Landing />);

    expect(screen.getByText("Omar Kassam")).toBeInTheDocument();
    expect(screen.getByText("Ijaj Ahmed")).toBeInTheDocument();
    expect(screen.getByText("Hamza Khan")).toBeInTheDocument();
    expect(screen.getByText("Mohammed Islam")).toBeInTheDocument();
    expect(screen.getByText("Abdulrahman Sharif")).toBeInTheDocument();
    expect(screen.getByText("Nabil Ahmed")).toBeInTheDocument();

    expect(screen.getByText("OK")).toBeInTheDocument();
    expect(screen.getByText("IA")).toBeInTheDocument();
    expect(screen.getByText("HK")).toBeInTheDocument();
    expect(screen.getByText("MI")).toBeInTheDocument();
    expect(screen.getByText("AS")).toBeInTheDocument();
    expect(screen.getByText("NA")).toBeInTheDocument();
  });

  it("renders the review text and star ratings", () => {
    render(<Landing />);

    expect(
      screen.getByText("“StudySync helped me actually plan my week instead of just hoping for the best. It’s simple and clear.”")
    ).toBeInTheDocument();

    expect(
      screen.getByText("“I used to miss deadlines all the time. Having everything in one place made a huge difference.”")
    ).toBeInTheDocument();

    expect(
      screen.getByText("“Perfect for university life. I like that it focuses on planning, not distractions or unncessary clutter.”")
    ).toBeInTheDocument();

    expect(
      screen.getByText("“Straightforward, easy to use, and actually helpful. Exactly what I needed as a student.”")
    ).toBeInTheDocument();

    expect(
      screen.getByText("“Using StudySync made my weeks feel more organised, and far less chaotic.”")
    ).toBeInTheDocument();

    expect(
      screen.getByText("“It’s really helped me balance lectures, coursework, and revision without feeling overwhelmed.”")
    ).toBeInTheDocument();

    expect(screen.getAllByText("⭐⭐⭐⭐⭐")).toHaveLength(5);
    expect(screen.getByText("⭐⭐⭐⭐")).toBeInTheDocument();
  });
});