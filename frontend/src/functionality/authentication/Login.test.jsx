import { render, screen, waitFor } from "@testing-library/react"
import Login from "./Login"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import "@testing-library/jest-dom/vitest"

vi.mock("../../utils/authToken", () => ({
    isTokenValid: vi.fn(),
}));

vi.mock("../../utils/handleLocalStorage", () => ({
    saveTokens: vi.fn(),
    getAccessToken: vi.fn(),
}));

vi.mock("../../api", () => ({
    publicApi: {
        post: vi.fn(),
    },
}))


import { publicApi } from "../../api";
import { isTokenValid } from "../../utils/authToken"
import { saveTokens } from "../../utils/handleLocalStorage"

beforeEach(() => {
    vi.clearAllMocks();
})

describe("Login page", () => {
    it("renders email, password and login btn", async () => {
        isTokenValid.mockResolvedValue(false);

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Enter your password...")).toBeInTheDocument();

        expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    })




    it("calls API with email and password when form submitted", async () => {
        const user = userEvent.setup();

        isTokenValid.mockResolvedValue(false);

        publicApi.post.mockResolvedValue({
            data: { access: "A", refresh: "R"},
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

    const emailInput = await screen.findByPlaceholderText("you@example.com");
    const passwordInput = await screen.findByPlaceholderText("Enter your password...");
    const submitBtn = screen.getByRole("button", { name: /log in/i });

    await user.type(emailInput, "test@gmail.com");
    await user.type(passwordInput, "password123");

    await user.click(submitBtn);

    await waitFor(() => {
            expect(publicApi.post).toHaveBeenCalledWith("/api/token/", {
                email: "test@gmail.com",
                password: "password123"
            });
    });


    })

    it("redirects to dashboard after successful login", async () => {
        const user = userEvent.setup();
        isTokenValid.mockResolvedValue(false);

        publicApi.post.mockResolvedValue({
            data: { access: "A", refresh: "R" }
        });

        render(
            <MemoryRouter initialEntries={["/login"]}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<h2>Dashboard Page</h2>}/>
                </Routes>
            </MemoryRouter>
        );

        await user.type(
            screen.getByPlaceholderText("you@example.com"),
            "test@gmail.com"
        )

        await user.type(
            screen.getByPlaceholderText("Enter your password..."),
            "password123"
        )

        await user.click(
            screen.getByRole("button", { name: /log in/i})
        )

        expect(
            await screen.findByText(/dashboard/i)
        ).toBeInTheDocument()

    })


    it("shows error when login fails", async () => {
        const user = userEvent.setup();

        isTokenValid.mockResolvedValue(false);

        publicApi.post.mockRejectedValue(new Error("login failed"));

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        )

        await user.type(
            screen.getByPlaceholderText("you@example.com"),
            "wrong@gmail.com"
            
        )

        await user.type(
            screen.getByPlaceholderText("Enter your password..."),
            "wrongpassword"
        )

        await user.click(
            screen.getByRole("button", { name: /log in/i})
        );

        expect(
            await screen.findByText(/something went wrong/i)
        ).toBeInTheDocument();
    })
})