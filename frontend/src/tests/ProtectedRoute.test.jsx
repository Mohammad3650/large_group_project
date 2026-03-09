import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter, Routes, Route } from "react-router-dom"
import ProtectedRoute from "../components/ProtectedRoute"
import { isTokenValid } from "../utils/authToken"

vi.mock("../utils/authToken", () => ({
    isTokenValid: vi.fn(),
}));

describe("ProtectedRoute", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function renderProtectedRoute() {
        return render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Routes>
                    <Route 
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <h1>Dashboard Page</h1>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/login" element={<h1>Login Page</h1>} />
                </Routes>
            </MemoryRouter>
        );
    }

    it("renders page when token is valid", async () => {
        isTokenValid.mockResolvedValue(true);

        renderProtectedRoute();

        expect(await screen.findByText("Dashboard Page")).toBeInTheDocument();
    });

    it("redirects to login when token is invalid", async () => {
        isTokenValid.mockResolvedValue(false);

        renderProtectedRoute();

        expect(await screen.findByText("Login Page")).toBeInTheDocument();
    })

})