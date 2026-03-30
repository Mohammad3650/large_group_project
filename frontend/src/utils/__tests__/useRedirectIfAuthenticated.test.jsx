import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import useRedirectIfAuthenticated from '../Hooks/useRedirectIfAuthenticated.js';
import { isTokenValid } from '../Auth/authToken.js';

const mockNavigate = vi.fn();

vi.mock('../Auth/authToken.js', () => ({
    isTokenValid: vi.fn()
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

function TestComponent({ path }) {
    useRedirectIfAuthenticated(path);
    return <div>Test Component</div>;
}

describe('Tests for useRedirectIfAuthenticated', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate.mockClear();
    });

    it('navigates to the default dashboard path when the token is valid', async () => {
        isTokenValid.mockResolvedValue(true);

        render(<TestComponent />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('navigates to a custom path when the token is valid', async () => {
        isTokenValid.mockResolvedValue(true);

        render(<TestComponent path="/calendar" />);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/calendar');
        });
    });

    it('does not navigate when the token is invalid', async () => {
        isTokenValid.mockResolvedValue(false);

        render(<TestComponent />);

        await waitFor(() => {
            expect(isTokenValid).toHaveBeenCalledTimes(1);
        });

        expect(mockNavigate).not.toHaveBeenCalled();
    });
});