import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useEditProfileForm from '../../../utils/Hooks/useEditProfileForm.js';
import {
    createEmptyProfileFormData,
    fetchProfileFormData,
    saveProfileFormData,
    deleteProfileAccount
} from '../../../utils/profileService.js';
import { mapProfileFieldErrors } from '../../../utils/profileErrorState.js';
import {
    createInitialErrors,
    buildGlobalError
} from '../../../utils/errors.js';
import { EDIT_PROFILE_MESSAGES } from '../../../constants/editProfileConstants.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../utils/profileService.js', () => ({
    createEmptyProfileFormData: vi.fn(),
    fetchProfileFormData: vi.fn(),
    saveProfileFormData: vi.fn(),
    deleteProfileAccount: vi.fn()
}));

vi.mock('../../../utils/profileErrorState.js', () => ({
    mapProfileFieldErrors: vi.fn()
}));

vi.mock('../../../utils/errors.js', () => ({
    createInitialErrors: vi.fn(),
    buildGlobalError: vi.fn()
}));

function createSubmitEvent() {
    return {
        preventDefault: vi.fn()
    };
}

function createEmptyFormData() {
    return {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        phone_number: ''
    };
}

function createLoadedFormData() {
    return {
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '07123456789'
    };
}

function createEmptyErrors() {
    return {
        fieldErrors: {},
        global: []
    };
}

describe('useEditProfileForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        createEmptyProfileFormData.mockReturnValue(createEmptyFormData());
        createInitialErrors.mockReturnValue(createEmptyErrors());

        buildGlobalError.mockImplementation((message) => ({
            fieldErrors: {},
            global: [message]
        }));

        fetchProfileFormData.mockResolvedValue(createLoadedFormData());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('loads profile data on mount and clears the loading state', async () => {
        const { result } = renderHook(() => useEditProfileForm());

        expect(result.current.isLoading).toBe(true);
        expect(fetchProfileFormData).toHaveBeenCalledTimes(1);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.formData).toEqual(createLoadedFormData());
        expect(result.current.errors).toEqual(createEmptyErrors());
        expect(result.current.successMessage).toBe('');
    });

    it('redirects to login when loading profile returns 401', async () => {
        fetchProfileFormData.mockRejectedValue({
            response: {
                status: 401
            }
        });

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
        expect(buildGlobalError).not.toHaveBeenCalledWith(
            EDIT_PROFILE_MESSAGES.loadFailed
        );
    });

    it('sets a global error when loading profile fails without 401', async () => {
        fetchProfileFormData.mockRejectedValue({
            response: {
                status: 500
            }
        });

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(buildGlobalError).toHaveBeenCalledWith(
            EDIT_PROFILE_MESSAGES.loadFailed
        );

        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: [EDIT_PROFILE_MESSAGES.loadFailed]
        });
    });

    it('updates a field value with updateField', async () => {
        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.updateField('email', 'new@example.com');
        });

        expect(result.current.formData.email).toBe('new@example.com');
    });

    it('navigates to the change password page', async () => {
        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.goToChangePassword();
        });

        expect(mockNavigate).toHaveBeenCalledWith('/change-password');
    });

    it('submits updated profile data and stores the success message', async () => {
        saveProfileFormData.mockResolvedValue({
            email: 'updated@example.com',
            username: 'updateduser',
            first_name: 'Updated',
            last_name: 'Person',
            phone_number: '07999999999'
        });

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        act(() => {
            result.current.updateField('email', 'updated@example.com');
            result.current.updateField('username', 'updateduser');
            result.current.updateField('first_name', 'Updated');
            result.current.updateField('last_name', 'Person');
            result.current.updateField('phone_number', '07999999999');
        });

        const event = createSubmitEvent();

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(saveProfileFormData).toHaveBeenCalledWith({
            email: 'updated@example.com',
            username: 'updateduser',
            first_name: 'Updated',
            last_name: 'Person',
            phone_number: '07999999999'
        });

        expect(result.current.formData).toEqual({
            email: 'updated@example.com',
            username: 'updateduser',
            first_name: 'Updated',
            last_name: 'Person',
            phone_number: '07999999999'
        });
        expect(result.current.successMessage).toBe(
            EDIT_PROFILE_MESSAGES.saveSuccess
        );
        expect(result.current.isSaving).toBe(false);
    });

    it('maps backend field errors when saving fails with response data', async () => {
        const mappedErrors = {
            fieldErrors: {
                email: 'Enter a valid email address.'
            },
            global: []
        };

        saveProfileFormData.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    email: ['Enter a valid email address.']
                }
            }
        });

        mapProfileFieldErrors.mockReturnValue(mappedErrors);

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const event = createSubmitEvent();

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(mapProfileFieldErrors).toHaveBeenCalledWith({
            email: ['Enter a valid email address.']
        });
        expect(result.current.errors).toEqual(mappedErrors);
        expect(result.current.successMessage).toBe('');
        expect(result.current.isSaving).toBe(false);
    });

    it('redirects to login when saving fails with 401', async () => {
        saveProfileFormData.mockRejectedValue({
            response: {
                status: 401
            }
        });

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const event = createSubmitEvent();

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('sets a global save error when saving fails without field errors', async () => {
        saveProfileFormData.mockRejectedValue({
            response: {
                status: 500,
                data: null
            }
        });

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const event = createSubmitEvent();

        await act(async () => {
            await result.current.handleSubmit(event);
        });

        expect(buildGlobalError).toHaveBeenCalledWith(
            EDIT_PROFILE_MESSAGES.saveFailed
        );
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: [EDIT_PROFILE_MESSAGES.saveFailed]
        });
    });

    it('returns early when submit is triggered while already saving', async () => {
        let resolveSave;
        saveProfileFormData.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveSave = resolve;
                })
        );

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        const firstEvent = createSubmitEvent();
        const secondEvent = createSubmitEvent();

        act(() => {
            void result.current.handleSubmit(firstEvent);
        });

        await waitFor(() => {
            expect(result.current.isSaving).toBe(true);
        });

        act(() => {
            void result.current.handleSubmit(secondEvent);
        });

        expect(saveProfileFormData).toHaveBeenCalledTimes(1);

        await act(async () => {
            resolveSave(createLoadedFormData());
        });
    });

    it('does nothing when account deletion is cancelled', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const clearSpy = vi.spyOn(Storage.prototype, 'clear');

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(confirmSpy).toHaveBeenCalledWith(
            EDIT_PROFILE_MESSAGES.deleteConfirmation
        );
        expect(deleteProfileAccount).not.toHaveBeenCalled();
        expect(clearSpy).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
        clearSpy.mockRestore();
    });

    it('deletes the account, clears local storage, and redirects on success', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const clearSpy = vi.spyOn(Storage.prototype, 'clear');
        deleteProfileAccount.mockResolvedValue();

        const originalLocation = window.location;

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: { href: '' }
        });

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(deleteProfileAccount).toHaveBeenCalledTimes(1);
        expect(clearSpy).toHaveBeenCalledTimes(1);
        expect(window.location.href).toBe('/');

        confirmSpy.mockRestore();
        clearSpy.mockRestore();

        Object.defineProperty(window, 'location', {
            configurable: true,
            value: originalLocation
        });
    });

    it('sets a global delete error when account deletion fails', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        deleteProfileAccount.mockRejectedValue(new Error('Delete failed'));

        const { result } = renderHook(() => useEditProfileForm());

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        await act(async () => {
            await result.current.handleDeleteAccount();
        });

        expect(buildGlobalError).toHaveBeenCalledWith(
            EDIT_PROFILE_MESSAGES.deleteFailed
        );
        expect(result.current.errors).toEqual({
            fieldErrors: {},
            global: [EDIT_PROFILE_MESSAGES.deleteFailed]
        });

        confirmSpy.mockRestore();
    });
});