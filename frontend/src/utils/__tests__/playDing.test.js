import { describe, it, expect, vi, beforeEach } from "vitest";
import playDing from "../playDing.js";

vi.mock("../assets/Dashboard/ding.mp3", () => ({ default: "ding.mp3" }));

const mockPlay = vi.fn().mockResolvedValue(undefined);

class MockAudio {
    constructor() {
        this.play = mockPlay;
        this.currentTime = 0;
        this.volume = 0;
    }
}
vi.stubGlobal("Audio", MockAudio);

describe("playDing", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPlay.mockResolvedValue(undefined);
    });

    it("plays the ding sound", () => {
        playDing();
        expect(mockPlay).toHaveBeenCalled();
    });

    it("sets the volume to 0.3", () => {
        const instances = [];
        vi.stubGlobal("Audio", class {
            constructor() {
                this.play = mockPlay;
                this.currentTime = 0;
                this.volume = 0;
                instances.push(this);
            }
        });
        playDing();
        expect(instances[0].volume).toBe(0.3);
    });

    it("resets currentTime to 0 before playing", () => {
        const instances = [];
        vi.stubGlobal("Audio", class {
            constructor() {
                this.play = mockPlay;
                this.currentTime = 99;
                this.volume = 0;
                instances.push(this);
            }
        });
        playDing();
        expect(instances[0].currentTime).toBe(0);
    });

    it("logs an error when the audio fails to play", async () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        mockPlay.mockRejectedValue(new Error("Audio error"));
        playDing();
        await new Promise(resolve => setTimeout(resolve, 0));
        expect(consoleSpy).toHaveBeenCalledWith("Audio failed:", expect.any(Error));
        consoleSpy.mockRestore();
    });
});
