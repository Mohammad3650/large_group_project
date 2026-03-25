import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Login from "../Login";
import { publicApi } from "../../../api";
import { isTokenValid } from "../../../utils/authToken";
import { saveTokens } from "../../../utils/authStorage";

vi.mock("../../../utils/authToken", () => ({
    isTokenValid: vi.fn(),
}));

vi.mock("../../../utils/authStorage", () => ({
    saveTokens: vi.fn(),
}));

vi.mock("../../../api", () => ({
    publicApi: {
        post: vi.fn(),
    },
}));

function renderLoginWithRoutes() {
    return render(
        <MemoryRouter initialEntries={["/login"]}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<h2>Dashboard Page</h2>} />
            </Routes>
        </MemoryRouter>
    );
}

async function fillLoginForm(user, overrides = {}) {
    const values = {
        email: "test@gmail.com",
        password: "password123",
        ...overrides,
    };

    await user.type(screen.getByPlaceholderText("you@example.com"), values.email);
    await user.type(
        screen.getByPlaceholderText("Enter your password..."),
        values.password
    );
}

describe("Login page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isTokenValid.mockResolvedValue(false);
    });

    it("renders the login form fields and submit button", () => {
        renderLoginWithRoutes();

        expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Enter your password...")
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /log in/i })
        ).toBeInTheDocument();
    });

    it("redirects authenticated users to the dashboard", async () => {
        isTokenValid.mockResolvedValue(true);

        renderLoginWithRoutes();

        await waitFor(() => {
            expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
        });
    });

    it("submits login credentials, stores tokens, and redirects on success", async () => {
        const user = userEvent.setup();

        publicApi.post.mockResolvedValue({
            data: { access: "A", refresh: "R" },
        });

        renderLoginWithRoutes();
        await fillLoginForm(user);

        await user.click(screen.getByRole("button", { name: /log in/i }));

        await waitFor(() => {
            expect(publicApi.post).toHaveBeenCalledWith("/api/token/", {
            email: "test@gmail.com",
            password: "password123",
            });
        });

        expect(saveTokens).toHaveBeenCalledWith("A", "R");
        expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
    });

    it("shows validation errors and does not submit when fields are empty", async () => {
        const user = userEvent.setup();

        renderLoginWithRoutes();

        await user.click(screen.getByRole("button", { name: /log in/i }));

        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(screen.getByText("Password is required.")).toBeInTheDocument();
        expect(publicApi.post).not.toHaveBeenCalled();
    });

    it("shows a global error message when login fails", async () => {
        const user = userEvent.setup();

        publicApi.post.mockRejectedValue(new Error("login failed"));

        renderLoginWithRoutes();
        await fillLoginForm(user);

        await user.click(screen.getByRole("button", { name: /log in/i }));

        expect(
            await screen.findByText(/something went wrong/i)
        ).toBeInTheDocument();
    });

    it("does not submit the form again while the request is loading", async () => {
        const user = userEvent.setup();

        publicApi.post.mockImplementation(() => new Promise(() => {}));

        renderLoginWithRoutes();
        await fillLoginForm(user);

        const button = screen.getByRole("button", { name: /log in/i });

        await user.click(button);
        await user.click(button);

        expect(publicApi.post).toHaveBeenCalledTimes(1);
    });
});