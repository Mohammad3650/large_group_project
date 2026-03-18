import { describe, it, expect, vi, beforeEach } from "vitest";
import mapTimeBlocks from "../mapTimeBlocks";

// Mock Intl.DateTimeFormat to return a predictable timezone
beforeEach(() => {
    vi.spyOn(Intl, "DateTimeFormat").mockReturnValue({
        resolvedOptions: () => ({ timeZone: "Europe/London" }),
    });
});

// Mock the Temporal API
const mockZonedDateTime = { from: vi.fn((str) => str) };
global.Temporal = { ZonedDateTime: mockZonedDateTime };

const baseBlock = {
    id: 1,
    name: "Lecture",
    date: "2024-03-18",
    start_time: "09:00:00",
    end_time: "10:00:00",
    location: "Room 101",
    block_type: "lecture",
    description: "Introduction to testing",
};

describe("mapTimeBlocks", () => {
    it("maps a block with all fields correctly", () => {
        const result = mapTimeBlocks([baseBlock]);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
            id: 1,
            name: "Lecture",
            title: "Lecture",
            date: "2024-03-18",
            startTime: "09:00",
            endTime: "10:00",
            location: "Room 101",
            blockType: "Lecture",
            description: "Introduction to testing",
            _options: { additionalClasses: ["sx-type-lecture"] },
        });
    });

    it("slices start_time and end_time to HH:MM format", () => {
        const result = mapTimeBlocks([baseBlock]);
        expect(result[0].startTime).toBe("09:00");
        expect(result[0].endTime).toBe("10:00");
    });

    it("constructs the correct Temporal.ZonedDateTime strings", () => {
        mapTimeBlocks([baseBlock]);
        expect(mockZonedDateTime.from).toHaveBeenCalledWith("2024-03-18T09:00[Europe/London]");
        expect(mockZonedDateTime.from).toHaveBeenCalledWith("2024-03-18T10:00[Europe/London]");
    });

    it("uses the array index as the ID when block.id is null", () => {
        const block = { ...baseBlock, id: null };
        const result = mapTimeBlocks([block]);
        expect(result[0].id).toBe(0);
    });

    it("uses the array index as the ID when block.id is undefined", () => {
        const block = { ...baseBlock, id: undefined };
        const result = mapTimeBlocks([block]);
        expect(result[0].id).toBe(0);
    });

    it("capitalises the block_type correctly", () => {
        const result = mapTimeBlocks([{ ...baseBlock, block_type: "seminar" }]);
        expect(result[0].blockType).toBe("Seminar");
    });

    it("sets blockType to 'N/A' when block_type is null", () => {
        const result = mapTimeBlocks([{ ...baseBlock, block_type: null }]);
        expect(result[0].blockType).toBe("N/A");
    });

    it("sets blockType to 'N/A' when block_type is undefined", () => {
        const result = mapTimeBlocks([{ ...baseBlock, block_type: undefined }]);
        expect(result[0].blockType).toBe("N/A");
    });

    it("sets description to 'N/A' when description is an empty string", () => {
        const result = mapTimeBlocks([{ ...baseBlock, description: "" }]);
        expect(result[0].description).toBe("N/A");
    });

    it("sets description to 'N/A' when description is null", () => {
        const result = mapTimeBlocks([{ ...baseBlock, description: null }]);
        expect(result[0].description).toBe("N/A");
    });

    it("maps multiple blocks correctly", () => {
        const blocks = [
            baseBlock,
            { ...baseBlock, id: 2, name: "Seminar", block_type: "seminar" },
        ];
        const result = mapTimeBlocks(blocks);
        expect(result).toHaveLength(2);
        expect(result[1].name).toBe("Seminar");
        expect(result[1].blockType).toBe("Seminar");
    });

    it("returns an empty array when given an empty array", () => {
        const result = mapTimeBlocks([]);
        expect(result).toEqual([]);
    });
});