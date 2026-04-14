import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    createEmptyProfileFormData,
    fetchProfileFormData,
    saveProfileFormData,
    deleteProfileAccount
} from '../../utils/profileService.js';
import { api } from '../../../../api.js';

vi.mock('../../../../api.js', () => ({
    api: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('profileService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createEmptyProfileFormData', () => {
        it('returns an empty profile form object with default values', () => {
            expect(createEmptyProfileFormData()).toEqual({
                email: '',
                username: '',
                first_name: '',
                last_name: '',
                phone_number: ''
            });
        });

        it('returns a fresh object each time', () => {
            const first = createEmptyProfileFormData();
            const second = createEmptyProfileFormData();

            expect(first).not.toBe(second);
        });
    });

    describe('fetchProfileFormData', () => {
        it('calls the profile endpoint and maps returned data', async () => {
            api.get.mockResolvedValue({
                data: {
                    email: 'user@example.com',
                    username: 'testuser',
                    first_name: 'Test',
                    last_name: 'User',
                    phone_number: '07123456789'
                }
            });

            const result = await fetchProfileFormData();

            expect(api.get).toHaveBeenCalledTimes(1);
            expect(api.get).toHaveBeenCalledWith('/api/user/');
            expect(result).toEqual({
                email: 'user@example.com',
                username: 'testuser',
                first_name: 'Test',
                last_name: 'User',
                phone_number: '07123456789'
            });
        });

        it('maps missing fields to empty strings', async () => {
            api.get.mockResolvedValue({
                data: {
                    email: 'user@example.com',
                    first_name: 'Test'
                }
            });

            const result = await fetchProfileFormData();

            expect(result).toEqual({
                email: 'user@example.com',
                username: '',
                first_name: 'Test',
                last_name: '',
                phone_number: ''
            });
        });

        it('returns empty strings when response data is undefined', async () => {
            api.get.mockResolvedValue({
                data: undefined
            });

            const result = await fetchProfileFormData();

            expect(result).toEqual({
                email: '',
                username: '',
                first_name: '',
                last_name: '',
                phone_number: ''
            });
        });

        it('propagates API errors', async () => {
            const error = new Error('Request failed');
            api.get.mockRejectedValue(error);

            await expect(fetchProfileFormData()).rejects.toThrow('Request failed');
        });
    });

    describe('saveProfileFormData', () => {
        it('sends updated form data to the profile endpoint and maps returned data', async () => {
            const formData = {
                email: 'updated@example.com',
                username: 'updateduser',
                first_name: 'Updated',
                last_name: 'Name',
                phone_number: '07999999999'
            };

            api.put.mockResolvedValue({
                data: formData
            });

            const result = await saveProfileFormData(formData);

            expect(api.put).toHaveBeenCalledTimes(1);
            expect(api.put).toHaveBeenCalledWith('/api/user/', formData);
            expect(result).toEqual({
                email: 'updated@example.com',
                username: 'updateduser',
                first_name: 'Updated',
                last_name: 'Name',
                phone_number: '07999999999'
            });
        });

        it('maps missing returned fields to empty strings after saving', async () => {
            const formData = {
                email: 'updated@example.com',
                username: 'updateduser',
                first_name: 'Updated',
                last_name: 'Name',
                phone_number: '07999999999'
            };

            api.put.mockResolvedValue({
                data: {
                    email: 'updated@example.com'
                }
            });

            const result = await saveProfileFormData(formData);

            expect(result).toEqual({
                email: 'updated@example.com',
                username: '',
                first_name: '',
                last_name: '',
                phone_number: ''
            });
        });

        it('returns empty strings when save response data is undefined', async () => {
            const formData = {
                email: 'updated@example.com',
                username: 'updateduser',
                first_name: 'Updated',
                last_name: 'Name',
                phone_number: '07999999999'
            };

            api.put.mockResolvedValue({
                data: undefined
            });

            const result = await saveProfileFormData(formData);

            expect(result).toEqual({
                email: '',
                username: '',
                first_name: '',
                last_name: '',
                phone_number: ''
            });
        });

        it('propagates API errors when saving fails', async () => {
            const formData = {
                email: 'updated@example.com',
                username: 'updateduser',
                first_name: 'Updated',
                last_name: 'Name',
                phone_number: '07999999999'
            };

            const error = new Error('Save failed');
            api.put.mockRejectedValue(error);

            await expect(saveProfileFormData(formData)).rejects.toThrow('Save failed');
        });
    });

    describe('deleteProfileAccount', () => {
        it('calls the delete profile endpoint', async () => {
            api.delete.mockResolvedValue({});

            await deleteProfileAccount();

            expect(api.delete).toHaveBeenCalledTimes(1);
            expect(api.delete).toHaveBeenCalledWith('/api/user/delete/');
        });

        it('propagates API errors when deletion fails', async () => {
            const error = new Error('Delete failed');
            api.delete.mockRejectedValue(error);

            await expect(deleteProfileAccount()).rejects.toThrow('Delete failed');
        });
    });
});