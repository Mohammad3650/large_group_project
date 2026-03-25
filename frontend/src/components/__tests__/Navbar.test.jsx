import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../Navbar";
import useAuthStatus from "../../utils/authStatus";
import * as useUsernameModule from "../../utils/useUsername.js";

vi.mock("../../utils/authStatus", () => ({
    default: vi.fn(),
}));

vi.mock("../../utils/useUsername.js", () => ({
    default: vi.fn(),
}));

vi.mock("../LogoutButton.jsx", () => ({
    default: () => <button>Logout</button>,
}));

vi.mock("../../assets/Navbar/user.png", () => ({ default: "user.png" }));
vi.mock("../../assets/Navbar/task_list.png", () => ({ default: "task_list.png" }));
vi.mock("../../assets/calendar_icon.png", () => ({ default: "calendar_icon.png" }));
vi.mock("../stylesheets/Navbar.css", () => ({}));

const renderNavbar = () =>
    render(
        <MemoryRouter>
        <Navbar />
        </MemoryRouter>
    );

describe("Navbar", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("when the user is not logged in", () => {
        beforeEach(() => {
            useAuthStatus.mockReturnValue(false);
            useUsernameModule.default.mockReturnValue("");
        });

        it("renders the site title linking to /", async () => {
            renderNavbar();
            await waitFor(() => {
                expect(screen.getByText("StudySync")).toBeInTheDocument();
            });
            expect(screen.getByText("StudySync").closest("a")).toHaveAttribute("href", "/");
        });

        it("does not render the Dashboard or Calendar links", () => {
            renderNavbar();
            expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
            expect(screen.queryByText("Calendar")).not.toBeInTheDocument();
        });

        it("renders the 'Built for Students' tagline", () => {
            renderNavbar();
            expect(screen.getByText("Built for Students")).toBeInTheDocument();
        });

        it("does not render the user icon", () => {
            renderNavbar();
            expect(screen.queryByAltText("User")).not.toBeInTheDocument();
        });
    });

    describe("when the user is logged in", () => {
        beforeEach(() => {
            useAuthStatus.mockReturnValue(true);
            useUsernameModule.default.mockReturnValue("testuser");
        });

        it("renders the Dashboard link", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
            expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute("href", "/dashboard");
        });

        it("renders the Calendar link", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByText("Calendar")).toBeInTheDocument());
            expect(screen.getByText("Calendar").closest("a")).toHaveAttribute("href", "/calendar");
        });

        it("renders the Dashboard icon with the correct alt text", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("Dashboard")).toBeInTheDocument());
        });

        it("renders the Calendar icon with the correct alt text", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("Calendar")).toBeInTheDocument());
        });

        it("renders the user icon", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("User")).toBeInTheDocument());
        });

        it("does not render the 'Built for Students' tagline", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("User")).toBeInTheDocument());
            expect(screen.queryByText("Built for Students")).not.toBeInTheDocument();
        });

        it("the dropdown is closed by default", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("User")).toBeInTheDocument());
            expect(screen.queryByText("testuser")).not.toBeInTheDocument();
            expect(screen.queryByRole("link", { name: "Profile" })).not.toBeInTheDocument();
            expect(screen.queryByText("Logout")).not.toBeInTheDocument();
        });

        it("opens the dropdown when the user icon is clicked", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("User")).toBeInTheDocument());

            fireEvent.click(screen.getByAltText("User"));

            expect(screen.getByText("testuser")).toBeInTheDocument();
            expect(screen.getByText("Profile").closest("a")).toHaveAttribute("href", "/profile");
            expect(screen.getByText("Logout")).toBeInTheDocument();
        });

        it("closes the dropdown when the user icon is clicked a second time", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("User")).toBeInTheDocument());

            fireEvent.click(screen.getByAltText("User"));
            fireEvent.click(screen.getByAltText("User"));

            expect(screen.queryByText("testuser")).not.toBeInTheDocument();
            expect(screen.queryByText("Logout")).not.toBeInTheDocument();
        });

        it("closes the dropdown when the Profile link is clicked", async () => {
            renderNavbar();
            await waitFor(() => expect(screen.getByAltText("User")).toBeInTheDocument());

            fireEvent.click(screen.getByAltText("User"));
            expect(screen.getByText("Profile")).toBeInTheDocument();

            fireEvent.click(screen.getByText("Profile"));

            expect(screen.queryByText("testuser")).not.toBeInTheDocument();
            expect(screen.queryByText("Logout")).not.toBeInTheDocument();
        });
    });
});