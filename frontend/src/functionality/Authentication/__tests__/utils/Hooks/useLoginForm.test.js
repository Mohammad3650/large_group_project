import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useLoginForm from '../../../utils/Hooks/useLoginForm.js';
import { loginUser } from '../../../utils/authService.js';
import useAuthForm from '../../../utils/Hooks/useAuthForm.js';
import validateLoginForm from '../../../utils/Validation/validateLoginForm.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../utils/authService.js', () => ({
    loginUser: vi.fn()
}));

vi.mock('../../../utils/Hooks/useAuthForm.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../utils/Validation/validateLoginForm.js', () => ({
    default: vi.fn()
}));

describe('useLoginForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        useAuthForm.mockImplementation((validateForm, submitForm) => ({
            errors: { fieldErrors: {}, global: [] },
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

    it('returns the initial login form values', () => {
        const { result } = renderHook(() => useLoginForm());

        expect(result.current.email).toBe('');
        expect(result.current.password).toBe('');
    });

    it('updates email with setEmail', () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.setEmail('user@example.com');
        });

        expect(result.current.email).toBe('user@example.com');
        expect(result.current.password).toBe('');
    });

    it('updates password with setPassword', () => {
        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.setPassword('Password123!');
        });

        expect(result.current.email).toBe('');
        expect(result.current.password).toBe('Password123!');
    });

    it('passes validateForm and submitLogin into useAuthForm', () => {
        renderHook(() => useLoginForm());

        expect(useAuthForm).toHaveBeenCalledTimes(1);
        expect(useAuthForm).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function)
        );
    });

    it('validateForm uses validateLoginForm with the current email and password', async () => {
        validateLoginForm.mockReturnValue({
            email: 'Email is required.'
        });

        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.setEmail('');
            result.current.setPassword('Password123!');
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(validateLoginForm).toHaveBeenCalledTimes(1);
        expect(validateLoginForm).toHaveBeenCalledWith({
            email: '',
            password: 'Password123!'
        });
    });

    it('submits the form with loginUser and navigates to dashboard when validation passes', async () => {
        validateLoginForm.mockReturnValue({});
        loginUser.mockResolvedValue({});

        const { result } = renderHook(() => useLoginForm());

        act(() => {
            result.current.setEmail('user@example.com');
            result.current.setPassword('Password123!');
        });

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(loginUser).toHaveBeenCalledTimes(1);
        expect(loginUser).toHaveBeenCalledWith(
            'user@example.com',
            'Password123!'
        );
        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    it('does not submit or navigate when validation fails', async () => {
        validateLoginForm.mockReturnValue({
            email: 'Email is required.'
        });

        const { result } = renderHook(() => useLoginForm());

        await act(async () => {
            await result.current.handleSubmit({
                preventDefault: vi.fn()
            });
        });

        expect(loginUser).not.toHaveBeenCalled();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('returns the values provided by useAuthForm', () => {
        useAuthForm.mockImplementation(() => ({
            errors: { fieldErrors: { email: 'Email is required.' }, global: [] },
            loading: true,
            handleSubmit: vi.fn()
        }));

        const { result } = renderHook(() => useLoginForm());

        expect(result.current.errors).toEqual({
            fieldErrors: { email: 'Email is required.' },
            global: []
        });
        expect(result.current.loading).toBe(true);
        expect(result.current.handleSubmit).toEqual(expect.any(Function));
    });
});