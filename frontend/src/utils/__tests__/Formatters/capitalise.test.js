import { describe, it, expect } from "vitest";
import capitalise from "../../Formatters/capitalise.js";

describe("capitalise", () => {
    it("capitalises the first letter of a lowercase string", () => {
        expect(capitalise("lecture")).toBe("Lecture");
    });

    it("leaves the rest of the string unchanged", () => {
        expect(capitalise("helloWorld")).toBe("HelloWorld");
    });

    it("returns the same string if the first letter is already capitalised", () => {
        expect(capitalise("Lecture")).toBe("Lecture");
    });

    it("returns an empty string when given an empty string", () => {
        expect(capitalise("")).toBe("");
    });

    it("handles a single character string", () => {
        expect(capitalise("a")).toBe("A");
    });

    it("does not alter strings that start with a number", () => {
        expect(capitalise("1lecture")).toBe("1lecture");
    });

    it("does not alter strings that start with a special character", () => {
        expect(capitalise("_lecture")).toBe("_lecture");
    });
});