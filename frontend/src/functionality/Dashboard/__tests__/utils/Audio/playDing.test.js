import { describe, it, expect, vi, beforeEach } from "vitest";
import playDing from "../../../utils/Audio/playDing.js";

vi.mock("../../../assets/Dashboard/ding.mp3", () => ({ default: "ding.mp3" }));

const mockPlay = vi.fn().mockResolvedValue(undefined);
const instances = [];

class MockAudio {
    constructor() {
        this.play = mockPlay;
        this.currentTime = 0;
        this.volume = 0;
        instances.push(this);
    }
}

vi.stubGlobal("Audio", MockAudio);

describe("playDing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPlay.mockResolvedValue(undefined);
        instances.length = 0;
    });

    it("plays the ding sound", () => {
        playDing();
        expect(mockPlay).toHaveBeenCalled();
    });

    it("sets the volume to 0.3", () => {
        playDing();
        expect(instances[0].volume).toBe(0.3);
    });

    it("resets currentTime to 0 before playing", () => {
        playDing();
        expect(instances[0].currentTime).toBe(0);
    });

    it("does not throw when audio fails to play", async () => {
        mockPlay.mockRejectedValue(new Error("Audio error"));
        playDing();
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(mockPlay).toHaveBeenCalled();
    });
});