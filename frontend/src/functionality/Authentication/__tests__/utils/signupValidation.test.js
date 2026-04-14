import { describe, it, expect } from "vitest";
import { validateSignupForm } from "../../utils/Validation/validateSignupForm.js";

const validForm = {
    email: "test@example.com",
    username: "testuser",
    firstName: "Test",
    lastName: "User",
    phoneNumber: "07123456789",
    password: "Password123!",
    confirmPassword: "Password123!",
};

describe("Tests for validateSignupForm", () => {
    it("returns no errors for a valid form", () => {
        const result = validateSignupForm(validForm);

        expect(result).toEqual({});
    });

    it("returns all required field errors when the form is empty", () => {
        const result = validateSignupForm({
            email: "",
            username: "",
            firstName: "",
            lastName: "",
            phoneNumber: "",
            password: "",
            confirmPassword: "",
        });

        expect(result).toEqual({
            email: "Email is required.",
            username: "Username is required.",
            first_name: "First name is required.",
            last_name: "Last name is required.",
            phone_number: "Phone number is required.",
            password: "Password is required.",
            confirmPassword: "Please confirm your password.",
        });
    });

    it("treats whitespace-only values as empty for text fields", () => {
        const result = validateSignupForm({
            ...validForm,
            email: "   ",
            username: "   ",
            firstName: "   ",
            lastName: "   ",
            phoneNumber: "   ",
        });

        expect(result).toEqual({
            email: "Email is required.",
            username: "Username is required.",
            first_name: "First name is required.",
            last_name: "Last name is required.",
            phone_number: "Phone number is required.",
        });
    });

    it("returns an error when confirm password is missing", () => {
        const result = validateSignupForm({
            ...validForm,
            confirmPassword: "",
        });

        expect(result).toEqual({
            confirmPassword: "Please confirm your password.",
        });
    });

    it("returns an error when passwords do not match", () => {
        const result = validateSignupForm({
            ...validForm,
            confirmPassword: "Different123!",
        });

        expect(result).toEqual({
            confirmPassword: "Passwords do not match.",
        });
    });

    it("returns both password and confirm password errors when both are missing", () => {
        const result = validateSignupForm({
            ...validForm,
            password: "",
            confirmPassword: "",
        });

        expect(result).toEqual({
            password: "Password is required.",
            confirmPassword: "Please confirm your password.",
        });
    });

    it("does not return a mismatch error when password is missing and confirm password is filled", () => {
        const result = validateSignupForm({
            ...validForm,
            password: "",
            confirmPassword: "Password123!",
        });

        expect(result).toEqual({
            password: "Password is required.",
        });
    });

    it("does not return a mismatch error when confirm password is missing", () => {
        const result = validateSignupForm({
            ...validForm,
            confirmPassword: "",
        });

        expect(result).toEqual({
            confirmPassword: "Please confirm your password.",
        });
    });
});