import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useSignupForm from '../../../utils/Hooks/useSignupForm.js';
import { validateSignupForm } from '../../../utils/Validation/validateSignupForm.js';
import { signupUser } from '../../../utils/authService.js';
import useAuthForm from '../../../utils/Hooks/useAuthForm.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../utils/Validation/validateSignupForm.js', () => ({
    validateSignupForm: vi.fn()
}));

vi.mock('../../../utils/authService.js', () => ({
    signupUser: vi.fn()
}));

vi.mock('../../../utils/Hooks/useAuthForm.js', () => ({
    default: vi.fn()
}));

describe('useSignupForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useAuthForm.mockImplementation((validateForm, submitForm) => ({
            errors: {},
            loading: false,
            handleSubmit: async (event) => {
                if (event?.preventDefault) {
                    event.preventDefault();
                }

                const validationErrors = validateForm();

                if (Object.keys(validationErrors).length > 0) {
                    return validationErrors;
                }

                await submitForm();
                return {};
            }
        }));
    });

    it('returns the initial signup form values', () => {
        const { result } = renderHook(() => useSignupForm());

        expect(result.current.form).toEqual({
            email: '',
            username: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
        });
    });

    it('updates a field with updateField', () => {
        const { result } = renderHook(() => useSignupForm());

        act(() => {
            result.current.updateField('email', 'user@example.com');
        });

        expect(result.current.form.email).toBe('user@example.com');
        expect(result.current.form.username).toBe('');
    });

    it('updates a field with getFieldProps onChange', () => {
        const { result } = renderHook(() => useSignupForm());

        act(() => {
            result.current.getFieldProps('username').onChange('testuser');
        });

        expect(result.current.form.username).toBe('testuser');
    });

    it('returns the current field value from getFieldProps', () => {
        const { result } = renderHook(() => useSignupForm());

        act(() => {
            result.current.updateField('firstName', 'Abdulrahman');
        });

        expect(result.current.getFieldProps('firstName')).toEqual({
            value: 'Abdulrahman',
            onChange: expect.any(Function)
        });
    });

    it('passes validateForm and submitSignup into useAuthForm', () => {
        renderHook(() => useSignupForm());

        expect(useAuthForm).toHaveBeenCalledTimes(1);
        expect(useAuthForm).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('validateForm uses validateSignupForm with the current form data', async () => {
        validateSignupForm.mockReturnValue({
            email: 'Email is required.'
        });

        const { result } = renderHook(() => useSignupForm());

        act(() => {
            result.current.updateField('email', '');
            result.current.updateField('username', 'testuser');
            result.current.updateField('firstName', 'Test');
            result.current.updateField('lastName', 'User');
            result.current.updateField('phoneNumber', '07123456789');
            result.current.updateField('password', 'Password123!');
            result.current.updateField('confirmPassword', 'Password123!');
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(validateSignupForm).toHaveBeenCalledTimes(1);
        expect(validateSignupForm).toHaveBeenCalledWith({
            email: '',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        });
    });

    it('submits the form with signupUser and navigates to dashboard when validation passes', async () => {
        validateSignupForm.mockReturnValue({});
        signupUser.mockResolvedValue({});

        const { result } = renderHook(() => useSignupForm());

        act(() => {
            result.current.updateField('email', 'user@example.com');
            result.current.updateField('username', 'testuser');
            result.current.updateField('firstName', 'Test');
            result.current.updateField('lastName', 'User');
            result.current.updateField('phoneNumber', '07123456789');
            result.current.updateField('password', 'Password123!');
            result.current.updateField('confirmPassword', 'Password123!');
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(signupUser).toHaveBeenCalledTimes(1);
        expect(signupUser).toHaveBeenCalledWith({
            email: 'user@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        });
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('does not submit or navigate when validation fails', async () => {
        validateSignupForm.mockReturnValue({
            email: 'Email is required.'
        });

        const { result } = renderHook(() => useSignupForm());

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(signupUser).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('returns the values provided by useAuthForm', () => {
        useAuthForm.mockImplementation(() => ({
            errors: { email: 'Email is required.' },
            loading: true,
            handleSubmit: vi.fn()
        }));

        const { result } = renderHook(() => useSignupForm());

        expect(result.current.errors).toEqual({
            email: 'Email is required.'
        });
        expect(result.current.loading).toBe(true);
        expect(result.current.handleSubmit).toEqual(expect.any(Function));
    });
});