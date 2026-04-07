import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import useUsername from '../Hooks/useUsername.js';

vi.mock('../Api/getUsername.js', () => ({ default: vi.fn() }));

import * as getUsernameModule from '../Api/getUsername.js';

describe('Tests for useUsername', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('initialises with an empty username and no error', () => {
        const { result } = renderHook(() => useUsername(false));
        expect(result.current.username).toBe('');
        expect(result.current.error).toBe('');
    });

    it('does not fetch the username when the user is not logged in', () => {
        renderHook(() => useUsername(false));
        expect(getUsernameModule.default).not.toHaveBeenCalled();
    });

    it('fetches and returns the username when the user is logged in', async () => {
        getUsernameModule.default.mockResolvedValue('testuser');
        const { result } = renderHook(() => useUsername(true));
        await waitFor(() => expect(result.current.username).toBe('testuser'));
        expect(getUsernameModule.default).toHaveBeenCalledTimes(1);
        expect(result.current.error).toBe('');
    });

    it('sets an error when the API call fails', async () => {
        getUsernameModule.default.mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useUsername(true));
        await waitFor(() => expect(result.current.error).toBe('Failed to load user'));
        expect(result.current.username).toBe('');
    });

    it('does nothing when the API call is cancelled', async () => {
        const cancelledError = new Error('Request cancelled');
        cancelledError.name = 'CanceledError';
        getUsernameModule.default.mockRejectedValue(cancelledError);
        const { result } = renderHook(() => useUsername(true));
        await waitFor(() => expect(getUsernameModule.default).toHaveBeenCalled());
        expect(result.current.error).toBe('');
        expect(result.current.username).toBe('');
    });

    it('sets an error when the response contains no username', async () => {
        getUsernameModule.default.mockResolvedValue(undefined);
        const { result } = renderHook(() => useUsername(true));
        await waitFor(() => expect(result.current.error).toBe('Invalid response from server'));
        expect(result.current.username).toBe('');
    });

    it('fetches the username when isLoggedIn changes from false to true', async () => {
        getUsernameModule.default.mockResolvedValue('testuser');
        const { result, rerender } = renderHook(
            ({ isLoggedIn }) => useUsername(isLoggedIn),
            { initialProps: { isLoggedIn: false } }
        );
        expect(result.current.username).toBe('');
        expect(getUsernameModule.default).not.toHaveBeenCalled();
        rerender({ isLoggedIn: true });
        await waitFor(() => expect(result.current.username).toBe('testuser'));
    });
});