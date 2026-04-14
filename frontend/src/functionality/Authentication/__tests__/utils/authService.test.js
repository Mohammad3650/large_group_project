import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, signupUser } from '../../utils/authService.js';
import { publicApi } from '../../../../api.js';
import { saveTokens } from '../../utils/authStorage.js';

vi.mock('../../../../api.js', () => ({
    publicApi: {
        post: vi.fn()
    }
}));

vi.mock('../../utils/authStorage.js', () => ({
    saveTokens: vi.fn()
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loginUser', () => {
        it('posts login credentials to the token endpoint, saves tokens, and returns auth data', async () => {
            const response = {
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: {
                        id: 1,
                        email: 'user@example.com'
                    }
                }
            };

            publicApi.post.mockResolvedValue(response);

            const result = await loginUser('user@example.com', 'Password123!');

            expect(publicApi.post).toHaveBeenCalledTimes(1);
            expect(publicApi.post).toHaveBeenCalledWith('/api/token/', {
                email: 'user@example.com',
                password: 'Password123!'
            });

            expect(saveTokens).toHaveBeenCalledTimes(1);
            expect(saveTokens).toHaveBeenCalledWith('access-token', 'refresh-token');

            expect(result).toEqual({
                access: 'access-token',
                refresh: 'refresh-token',
                user: {
                    id: 1,
                    email: 'user@example.com'
                }
            });
        });

        it('returns auth data with an undefined user when the response has no user object', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token'
                }
            });

            const result = await loginUser('user@example.com', 'Password123!');

            expect(publicApi.post).toHaveBeenCalledWith('/api/token/', {
                email: 'user@example.com',
                password: 'Password123!'
            });
            expect(saveTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
            expect(result).toEqual({
                access: 'access-token',
                refresh: 'refresh-token',
                user: undefined
            });
        });

        it('propagates API errors when login fails', async () => {
            const error = new Error('Login failed');
            publicApi.post.mockRejectedValue(error);

            await expect(
                loginUser('user@example.com', 'Password123!')
            ).rejects.toThrow('Login failed');

            expect(saveTokens).not.toHaveBeenCalled();
        });
    });

    describe('signupUser', () => {
        it('maps signup form data to the API payload, saves tokens, and returns auth data', async () => {
            const formData = {
                email: 'newuser@example.com',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
                phoneNumber: '07123456789',
                password: 'Password123!'
            };

            const response = {
                data: {
                    access: 'signup-access-token',
                    refresh: 'signup-refresh-token',
                    user: {
                        id: 2,
                        email: 'newuser@example.com',
                        username: 'newuser'
                    }
                }
            };

            publicApi.post.mockResolvedValue(response);

            const result = await signupUser(formData);

            expect(publicApi.post).toHaveBeenCalledTimes(1);
            expect(publicApi.post).toHaveBeenCalledWith('/auth/signup/', {
                email: 'newuser@example.com',
                username: 'newuser',
                first_name: 'New',
                last_name: 'User',
                phone_number: '07123456789',
                password: 'Password123!'
            });

            expect(saveTokens).toHaveBeenCalledTimes(1);
            expect(saveTokens).toHaveBeenCalledWith(
                'signup-access-token',
                'signup-refresh-token'
            );

            expect(result).toEqual({
                access: 'signup-access-token',
                refresh: 'signup-refresh-token',
                user: {
                    id: 2,
                    email: 'newuser@example.com',
                    username: 'newuser'
                }
            });
        });

        it('passes undefined optional values through the mapped signup payload', async () => {
            const formData = {
                email: 'newuser@example.com',
                username: 'newuser',
                firstName: undefined,
                lastName: undefined,
                phoneNumber: undefined,
                password: 'Password123!'
            };

            publicApi.post.mockResolvedValue({
                data: {
                    access: 'signup-access-token',
                    refresh: 'signup-refresh-token',
                    user: undefined
                }
            });

            const result = await signupUser(formData);

            expect(publicApi.post).toHaveBeenCalledWith('/auth/signup/', {
                email: 'newuser@example.com',
                username: 'newuser',
                first_name: undefined,
                last_name: undefined,
                phone_number: undefined,
                password: 'Password123!'
            });

            expect(saveTokens).toHaveBeenCalledWith(
                'signup-access-token',
                'signup-refresh-token'
            );

            expect(result).toEqual({
                access: 'signup-access-token',
                refresh: 'signup-refresh-token',
                user: undefined
            });
        });

        it('propagates API errors when signup fails', async () => {
            const formData = {
                email: 'newuser@example.com',
                username: 'newuser',
                firstName: 'New',
                lastName: 'User',
                phoneNumber: '07123456789',
                password: 'Password123!'
            };

            const error = new Error('Signup failed');
            publicApi.post.mockRejectedValue(error);

            await expect(signupUser(formData)).rejects.toThrow('Signup failed');

            expect(saveTokens).not.toHaveBeenCalled();
        });
    });
});