import { describe, it, expect } from "vitest";
import Capitalise from "../Formatters/capitalise.js";

describe("Capitalise", () => {
    it("capitalises the first letter of a lowercase string", () => {
        expect(Capitalise("lecture")).toBe("Lecture");
    });

    it("leaves the rest of the string unchanged", () => {
        expect(Capitalise("helloWorld")).toBe("HelloWorld");
    });

    it("returns the same string if the first letter is already capitalised", () => {
        expect(Capitalise("Lecture")).toBe("Lecture");
    });

    it("returns an empty string when given an empty string", () => {
        expect(Capitalise("")).toBe("");
    });

    it("handles a single character string", () => {
        expect(Capitalise("a")).toBe("A");
    });

    it("does not alter strings that start with a number", () => {
        expect(Capitalise("1lecture")).toBe("1lecture");
    });

    it("does not alter strings that start with a special character", () => {
        expect(Capitalise("_lecture")).toBe("_lecture");
    });
});