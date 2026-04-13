import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import useCloseOnAuthChange from '../../../utils/Hooks/useCloseOnAuthChange.js';

function TestComponent({ isLoggedIn, setDropdownOpen }) {
    useCloseOnAuthChange(isLoggedIn, setDropdownOpen);
    return null;
}

describe('useCloseOnAuthChange hook', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls setDropdownOpen with false on initial mount', () => {
        const setDropdownOpen = vi.fn();
        render(<TestComponent isLoggedIn={true} setDropdownOpen={setDropdownOpen} />);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('calls setDropdownOpen with false when isLoggedIn changes to false', () => {
        const setDropdownOpen = vi.fn();
        const { rerender } = render(
            <TestComponent isLoggedIn={true} setDropdownOpen={setDropdownOpen} />
        );
        vi.clearAllMocks();
        rerender(<TestComponent isLoggedIn={false} setDropdownOpen={setDropdownOpen} />);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('calls setDropdownOpen with false when isLoggedIn changes to true', () => {
        const setDropdownOpen = vi.fn();
        const { rerender } = render(
            <TestComponent isLoggedIn={false} setDropdownOpen={setDropdownOpen} />
        );
        vi.clearAllMocks();
        rerender(<TestComponent isLoggedIn={true} setDropdownOpen={setDropdownOpen} />);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });
});