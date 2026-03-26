import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Hero from "../Hero";

const mockNavigate = vi.fn();
const mockUseAuthStatus = vi.fn();

vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("../../../utils/authStatus", () => ({
  default: () => mockUseAuthStatus(),
}));

describe("Hero", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUseAuthStatus.mockReset();
  });

  it("renders the main text", () => {
    mockUseAuthStatus.mockReturnValue(false);

    render(<Hero />);

    expect(screen.getByText("Plan your study.")).toBeInTheDocument();
    expect(screen.getByText("Live your life.")).toBeInTheDocument();
  });

  it("renders signup and login buttons when logged out", () => {
    mockUseAuthStatus.mockReturnValue(false);

    render(<Hero />);

    expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
  });

  it("navigates to signup when Sign Up is clicked", () => {
    mockUseAuthStatus.mockReturnValue(false);

    render(<Hero />);

    fireEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("navigates to login when Login is clicked", () => {
    mockUseAuthStatus.mockReturnValue(false);

    render(<Hero />);

    fireEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("renders calendar and dashboard buttons when logged in", () => {
    mockUseAuthStatus.mockReturnValue(true);

    render(<Hero />);

    expect(screen.getByRole("button", { name: "Calendar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Dashboard" })).toBeInTheDocument();
  });

  it("navigates to calendar when Calendar is clicked", () => {
    mockUseAuthStatus.mockReturnValue(true);

    render(<Hero />);

    fireEvent.click(screen.getByRole("button", { name: "Calendar" }));

    expect(mockNavigate).toHaveBeenCalledWith("/calendar");
  });

  it("navigates to dashboard when Dashboard is clicked", () => {
    mockUseAuthStatus.mockReturnValue(true);

    render(<Hero />);

    fireEvent.click(screen.getByRole("button", { name: "Dashboard" }));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("renders the hero image", () => {
    mockUseAuthStatus.mockReturnValue(false);

    render(<Hero />);

    expect(screen.getByAltText("StudySync hero")).toBeInTheDocument();
  });

  it("applies the expected layout classes", () => {
    mockUseAuthStatus.mockReturnValue(false);

    const { container } = render(<Hero />);

    expect(container.querySelector(".hero")).toBeInTheDocument();
    expect(container.querySelector(".hero-content")).toBeInTheDocument();
    expect(container.querySelector(".hero-left")).toBeInTheDocument();
    expect(container.querySelector(".hero-right")).toBeInTheDocument();
    expect(container.querySelector(".hero-quote")).toBeInTheDocument();
    expect(container.querySelector(".hero-text-top")).toBeInTheDocument();
    expect(container.querySelector(".hero-text-bottom")).toBeInTheDocument();
    expect(container.querySelector(".hero-buttons")).toBeInTheDocument();
    expect(container.querySelector(".hero-button.black")).toBeInTheDocument();
    expect(container.querySelector(".hero-button.white")).toBeInTheDocument();
    expect(container.querySelector(".hero-image")).toBeInTheDocument();
  });
});