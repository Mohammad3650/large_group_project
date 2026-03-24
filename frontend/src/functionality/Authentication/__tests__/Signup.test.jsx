import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "../Signup.jsx";
import { isTokenValid } from "../../../utils/authToken.js";
import userEvent from "@testing-library/user-event"
import { publicApi } from "../../../api.js";
import { saveTokens } from "../../../utils/handleLocalStorage.js";
import { formatApiError } from "../../../utils/errors.js";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    
    return{
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock("../../../utils/authToken.js", () => ({
    isTokenValid: vi.fn(),
}));

vi.mock("../../../api.js", () => ({
    publicApi: {
        post: vi.fn(),
    },
}));

vi.mock("../../../utils/handleLocalStorage.js", () => ({
    saveTokens: vi.fn(),
}));

vi.mock("../../../utils/errors.js", () => ({
    formatApiError: vi.fn(),
}))


describe("Signup page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        isTokenValid.mockResolvedValue(false);
    })


    it("renders the signup form", () => {
        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        expect(screen.getByText("Create your account")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Choose a username")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("First name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Last name")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("e.g. 07123 456 789")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Confirm password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
    });

    it("redirects to dashboard if token is already valid", async () => {
        isTokenValid.mockResolvedValue(true);

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
        });
    });

    it("calls signup API, save tokens, and redirects on success", async () => {
        const user = userEvent.setup();

        publicApi.post.mockResolvedValue({
            data: {
                access: "mock-access",
                refresh: "mock-refresh",
            },
        });

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
        await user.type(screen.getByPlaceholderText("Choose a username"), "testuser");
        await user.type(screen.getByPlaceholderText("First name"), "Test");
        await user.type(screen.getByPlaceholderText("Last name"), "User");
        await user.type(screen.getByPlaceholderText("e.g. 07123 456 789"), "07123456789");
        await user.type(screen.getByPlaceholderText("Create a password"), "Password123!");
        await user.type(screen.getByPlaceholderText("Confirm password"), "Password123!");

        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(publicApi.post).toHaveBeenCalledWith("/auth/signup/", {
            email: "test@example.com",
            username: "testuser",
            first_name: "Test",
            last_name: "User",
            phone_number: "07123456789",
            password: "Password123!",
        });

        expect(saveTokens).toHaveBeenCalledWith("mock-access", "mock-refresh");
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    })

    it("shows error when passwords do not match", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
        await user.type(screen.getByPlaceholderText("Choose a username"), "testuser");
        await user.type(screen.getByPlaceholderText("First name"), "Test");
        await user.type(screen.getByPlaceholderText("Last name"), "User");
        await user.type(screen.getByPlaceholderText("e.g. 07123 456 789"), "07123456789");
        await user.type(screen.getByPlaceholderText("Create a password"), "Password123!");
        await user.type(screen.getByPlaceholderText("Confirm password"), "Different123!");

        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(await screen.findByText("Passwords do not match.")).toBeInTheDocument();
        expect(publicApi.post).not.toHaveBeenCalled();
    });
    
    it("shows required field errors when form is submitted empty", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(await screen.findByText("Email is required.")).toBeInTheDocument();
        expect(screen.getByText("Username is required.")).toBeInTheDocument();
        expect(screen.getByText("First name is required.")).toBeInTheDocument();
        expect(screen.getByText("Last name is required.")).toBeInTheDocument();
        expect(screen.getByText("Phone number is required.")).toBeInTheDocument();
        expect(screen.getByText("Password is required.")).toBeInTheDocument();
        expect(screen.getByText("Please confirm your password.")).toBeInTheDocument();

        expect(publicApi.post).not.toHaveBeenCalled();
    });

    
    it("does not submit again while loading", async () => {
        const user = userEvent.setup();

        publicApi.post.mockImplementation(() => new Promise(() => {})); 

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
        await user.type(screen.getByPlaceholderText("Choose a username"), "testuser");
        await user.type(screen.getByPlaceholderText("First name"), "Test");
        await user.type(screen.getByPlaceholderText("Last name"), "User");
        await user.type(screen.getByPlaceholderText("e.g. 07123 456 789"), "07123456789");
        await user.type(screen.getByPlaceholderText("Create a password"), "Password123!");
        await user.type(screen.getByPlaceholderText("Confirm password"), "Password123!");

        const button = screen.getByRole("button", { name: /sign up/i });

        await user.click(button);
        await user.click(button);

        expect(publicApi.post).toHaveBeenCalledTimes(1);
    });

    it("shows API error when signup request fails", async () => {
        const user = userEvent.setup();

        publicApi.post.mockRejectedValue(new Error("API error"));

        formatApiError.mockReturnValue({
            fieldErrors: {},
            global: ["Signup failed"],
        });

        render(
            <MemoryRouter>
                <Signup />
            </MemoryRouter>
        );

        await user.type(screen.getByPlaceholderText("you@example.com"), "test@example.com");
        await user.type(screen.getByPlaceholderText("Choose a username"), "testuser");
        await user.type(screen.getByPlaceholderText("First name"), "Test");
        await user.type(screen.getByPlaceholderText("Last name"), "User");
        await user.type(screen.getByPlaceholderText("e.g. 07123 456 789"), "07123456789");
        await user.type(screen.getByPlaceholderText("Create a password"), "Password123!");
        await user.type(screen.getByPlaceholderText("Confirm password"), "Password123!");

        await user.click(screen.getByRole("button", { name: /sign up/i }));

        expect(formatApiError).toHaveBeenCalled();
        expect(await screen.findByText("Signup failed")).toBeInTheDocument();
    })
})