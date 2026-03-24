import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Hero from "../Hero";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

describe("Hero", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the main text", () => {
    render(<Hero />);

    expect(screen.getByText("Plan your study.")).toBeInTheDocument();
    expect(screen.getByText("Live your life.")).toBeInTheDocument();
  });

  it("renders both buttons", () => {
    render(<Hero />);

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("navigates to signup", () => {
    render(<Hero />);

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("navigates to login", () => {
    render(<Hero />);

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders the hero image", () => {
    render(<Hero />);

    expect(screen.getByAltText("StudySync hero")).toBeInTheDocument();
  });

  it("applies layout classes", () => {
    const { container } = render(<Hero />);

    expect(container.querySelector(".hero")).toBeInTheDocument();
    expect(container.querySelector(".hero_content")).toBeInTheDocument();
    expect(container.querySelector(".hero_left")).toBeInTheDocument();
    expect(container.querySelector(".hero_right")).toBeInTheDocument();
    expect(container.querySelector(".hero_buttons")).toBeInTheDocument();
    expect(container.querySelector(".hero_button.black")).toBeInTheDocument();
    expect(container.querySelector(".hero_button.white")).toBeInTheDocument();
    expect(container.querySelector(".hero_image")).toBeInTheDocument();
  });
});