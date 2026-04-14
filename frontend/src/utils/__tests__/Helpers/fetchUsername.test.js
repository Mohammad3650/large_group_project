import { describe, it, expect, vi, beforeEach } from 'vitest';
import fetchUsername from '../../Helpers/fetchUsername.js';

vi.mock('../../Api/getUsername.js', () => ({ default: vi.fn() }));

import * as getUsernameModule from '../../Api/getUsername.js';

describe('fetchUsername', () => {
    const setUsername = vi.fn();
    const setError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('calls setUsername with the returned username on success', async () => {
        getUsernameModule.default.mockResolvedValue('testuser');
        await fetchUsername({ setUsername, setError });
        expect(setUsername).toHaveBeenCalledWith('testuser');
        expect(setError).not.toHaveBeenCalled();
    });

    it('calls setError when the API returns no username', async () => {
        getUsernameModule.default.mockResolvedValue(undefined);
        await fetchUsername({ setUsername, setError });
        expect(setError).toHaveBeenCalledWith('Invalid response from server');
        expect(setUsername).not.toHaveBeenCalled();
    });

    it('calls setError when the API call fails', async () => {
        getUsernameModule.default.mockRejectedValue(new Error('Network error'));
        await fetchUsername({ setUsername, setError });
        expect(setError).toHaveBeenCalledWith('Failed to load user');
        expect(setUsername).not.toHaveBeenCalled();
    });

    it('does nothing when the error is a CanceledError', async () => {
        const cancelledError = new Error('Request cancelled');
        cancelledError.name = 'CanceledError';
        getUsernameModule.default.mockRejectedValue(cancelledError);
        await fetchUsername({ setUsername, setError });
        expect(setError).not.toHaveBeenCalled();
        expect(setUsername).not.toHaveBeenCalled();
    });
});
