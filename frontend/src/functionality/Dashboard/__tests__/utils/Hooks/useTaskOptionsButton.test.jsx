import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useTaskOptionsButton from '../../../utils/Hooks/useTaskOptionsButton.js';

vi.mock('../../../../../utils/Hooks/useDropdown.js', () => ({ default: vi.fn() }));

import * as useDropdownModule from '../../../../../utils/Hooks/useDropdown.js';

describe('useTaskOptionsButton', () => {
    const mockSetDropdownOpen = vi.fn();
    const mockDropdownRef = { current: null };

    beforeEach(() => {
        vi.clearAllMocks();
        useDropdownModule.default.mockReturnValue({
            dropdownOpen: false,
            setDropdownOpen: mockSetDropdownOpen,
            dropdownRef: mockDropdownRef,
        });
    });

    it('returns dropdownOpen from useDropdown', () => {
        useDropdownModule.default.mockReturnValue({ dropdownOpen: true, setDropdownOpen: mockSetDropdownOpen, dropdownRef: mockDropdownRef });
        const { result } = renderHook(() => useTaskOptionsButton());
        expect(result.current.dropdownOpen).toBe(true);
    });

    it('returns setDropdownOpen from useDropdown', () => {
        const { result } = renderHook(() => useTaskOptionsButton());
        expect(result.current.setDropdownOpen).toBe(mockSetDropdownOpen);
    });

    it('returns dropdownRef from useDropdown', () => {
        const { result } = renderHook(() => useTaskOptionsButton());
        expect(result.current.dropdownRef).toBe(mockDropdownRef);
    });

    it('exposes handleOptionsClick as a function', () => {
        const { result } = renderHook(() => useTaskOptionsButton());
        expect(typeof result.current.handleOptionsClick).toBe('function');
    });

    it('calls event.stopPropagation when handleOptionsClick is called', () => {
        const { result } = renderHook(() => useTaskOptionsButton());
        const event = { stopPropagation: vi.fn() };
        act(() => result.current.handleOptionsClick(event));
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    it('toggles dropdownOpen via setDropdownOpen when handleOptionsClick is called', () => {
        const { result } = renderHook(() => useTaskOptionsButton());
        const event = { stopPropagation: vi.fn() };
        act(() => result.current.handleOptionsClick(event));
        expect(mockSetDropdownOpen).toHaveBeenCalledWith(expect.any(Function));
        const toggleFn = mockSetDropdownOpen.mock.calls[0][0];
        expect(toggleFn(false)).toBe(true);
        expect(toggleFn(true)).toBe(false);
    });
});
