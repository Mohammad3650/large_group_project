import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loginUser, signupUser } from '../../utils/authService';
import { publicApi } from '../../../../api';
import { saveTokens } from '../../utils/authStorage';

vi.mock('../../../../api', () => ({
    publicApi: {
        post: vi.fn()
    }
}));

vi.mock('../../utils/authStorage', () => ({
    saveTokens: vi.fn()
}));

describe('authService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('loginUser', () => {
        it('posts email and password to the token endpoint', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: { email: 'test@example.com' }
                }
            });

            await loginUser('test@example.com', 'Password123!');

            expect(publicApi.post).toHaveBeenCalledWith('/api/token/', {
                email: 'test@example.com',
                password: 'Password123!'
            });
        });

        it('stores returned tokens after successful login', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: { email: 'test@example.com' }
                }
            });

            await loginUser('test@example.com', 'Password123!');

            expect(saveTokens).toHaveBeenCalledWith(
                'access-token',
                'refresh-token'
            );
        });

        it('returns access, refresh and user data after login', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: { email: 'test@example.com' }
                }
            });

            const result = await loginUser('test@example.com', 'Password123!');

            expect(result).toEqual({
                access: 'access-token',
                refresh: 'refresh-token',
                user: { email: 'test@example.com' }
            });
        });

        it('throws the original error when the login request fails', async () => {
            const error = new Error('Login failed');
            publicApi.post.mockRejectedValue(error);

            await expect(
                loginUser('test@example.com', 'Password123!')
            ).rejects.toThrow('Login failed');

            expect(saveTokens).not.toHaveBeenCalled();
        });
    });

    describe('signupUser', () => {
        const formData = {
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!'
        };

        it('maps form data to the backend payload and posts it', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: { email: 'test@example.com' }
                }
            });

            await signupUser(formData);

            expect(publicApi.post).toHaveBeenCalledWith('/auth/signup/', {
                email: 'test@example.com',
                username: 'testuser',
                first_name: 'Test',
                last_name: 'User',
                phone_number: '07123456789',
                password: 'Password123!'
            });
        });

        it('stores returned tokens after successful signup', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: { email: 'test@example.com' }
                }
            });

            await signupUser(formData);

            expect(saveTokens).toHaveBeenCalledWith('access-token', 'refresh-token');
        });

        it('returns access, refresh and user data after signup', async () => {
            publicApi.post.mockResolvedValue({
                data: {
                    access: 'access-token',
                    refresh: 'refresh-token',
                    user: { email: 'test@example.com' }
                }
            });

            const result = await signupUser(formData);

            expect(result).toEqual({
                access: 'access-token',
                refresh: 'refresh-token',
                user: { email: 'test@example.com' }
            });
        });

        it('throws the error if the signup request fails', async () => {
            const error = new Error('Signup failed');
            publicApi.post.mockRejectedValue(error);

            await expect(signupUser(formData)).rejects.toThrow('Signup failed');

            expect(saveTokens).not.toHaveBeenCalled();
        });
    });
});
