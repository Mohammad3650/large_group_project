import { describe, it, expect } from "vitest";
import filterTasksForSearch from "../../../utils/Helpers/filterTasksForSearch.js";

const tasks = [
    { name: "Lecture" },
    { name: "Lab Session" },
    { name: "Study Group" },
];

describe("filterTasksForSearch", () => {
    it("returns all tasks when search term is empty", () => {
        expect(filterTasksForSearch(tasks, "")).toEqual(tasks);
    });

    it("returns all tasks when search term is only whitespace", () => {
        expect(filterTasksForSearch(tasks, "   ")).toEqual(tasks);
    });

    it("filters tasks case-insensitively", () => {
        expect(filterTasksForSearch(tasks, "LECTURE")).toEqual([{ name: "Lecture" }]);
    });

    it("filters tasks by partial match", () => {
        expect(filterTasksForSearch(tasks, "lab")).toEqual([{ name: "Lab Session" }]);
    });

    it("trims leading and trailing whitespace from search term", () => {
        expect(filterTasksForSearch(tasks, "  study  ")).toEqual([{ name: "Study Group" }]);
    });

    it("returns an empty array when no tasks match the search term", () => {
        expect(filterTasksForSearch(tasks, "xyz")).toEqual([]);
    });

    it("returns an empty array when the task list is empty", () => {
        expect(filterTasksForSearch([], "lecture")).toEqual([]);
    });
});