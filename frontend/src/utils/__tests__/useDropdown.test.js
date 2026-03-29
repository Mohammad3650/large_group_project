import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useDropdown from "../useDropdown";

describe("useDropdown", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initialises with the dropdown closed", () => {
        const { result } = renderHook(() => useDropdown());
        expect(result.current.dropdownOpen).toBe(false);
    });

    it("opens the dropdown when setDropdownOpen is called with true", () => {
        const { result } = renderHook(() => useDropdown());
        act(() => result.current.setDropdownOpen(true));
        expect(result.current.dropdownOpen).toBe(true);
    });

    it("closes the dropdown when setDropdownOpen is called with false", () => {
        const { result } = renderHook(() => useDropdown());
        act(() => result.current.setDropdownOpen(true));
        act(() => result.current.setDropdownOpen(false));
        expect(result.current.dropdownOpen).toBe(false);
    });

    it("returns a dropdownRef object", () => {
        const { result } = renderHook(() => useDropdown());
        expect(result.current.dropdownRef).toBeDefined();
        expect(result.current.dropdownRef).toHaveProperty("current");
    });

    it("closes the dropdown when a click occurs outside the dropdown element", () => {
        const { result } = renderHook(() => useDropdown());

        const dropdownElement = document.createElement("div");
        document.body.appendChild(dropdownElement);
        result.current.dropdownRef.current = dropdownElement;

        act(() => result.current.setDropdownOpen(true));
        expect(result.current.dropdownOpen).toBe(true);

        act(() => {
            document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });

        expect(result.current.dropdownOpen).toBe(false);
        document.body.removeChild(dropdownElement);
    });

    it("does not close the dropdown when a click occurs inside the dropdown element", () => {
        const { result } = renderHook(() => useDropdown());

        const dropdownElement = document.createElement("div");
        document.body.appendChild(dropdownElement);
        result.current.dropdownRef.current = dropdownElement;

        act(() => result.current.setDropdownOpen(true));

        act(() => {
            dropdownElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
        });

        expect(result.current.dropdownOpen).toBe(true);
        document.body.removeChild(dropdownElement);
    });

    it("does not throw when a click occurs and the ref is null", () => {
        const { result } = renderHook(() => useDropdown());
        result.current.dropdownRef.current = null;

        act(() => result.current.setDropdownOpen(true));

        expect(() => {
            act(() => {
                document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            });
        }).not.toThrow();

        expect(result.current.dropdownOpen).toBe(true);
    });

    it("removes the event listener when the component is unmounted", () => {
        const removeSpy = vi.spyOn(document, "removeEventListener");
        const { unmount } = renderHook(() => useDropdown());
        unmount();
        expect(removeSpy).toHaveBeenCalledWith("mousedown", expect.any(Function));
    });
});