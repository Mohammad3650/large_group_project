import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import EditProfile from '../../EditProfile/EditProfile.jsx';
import useEditProfileForm from '../../utils/Hooks/useEditProfileForm.js';

vi.mock('../../utils/Hooks/useEditProfileForm.js', () => ({
    default: vi.fn()
}));

function createHookState(overrides = {}) {
    return {
        formData: {
            email: 'test@example.com',
            username: 'testuser',
            first_name: 'Test',
            last_name: 'User',
            phone_number: '07123456789'
        },
        errors: {
            fieldErrors: {},
            global: []
        },
        successMessage: '',
        isLoading: false,
        isSaving: false,
        updateField: vi.fn(),
        handleSubmit: vi.fn((event) => event.preventDefault()),
        handleDeleteAccount: vi.fn(),
        goToChangePassword: vi.fn(),
        ...overrides
    };
}

function renderComponent() {
    return render(
        <MemoryRouter>
            <EditProfile />
        </MemoryRouter>
    );
}

describe('EditProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the loading state while profile data is being fetched', () => {
        useEditProfileForm.mockReturnValue(
            createHookState({
                isLoading: true
            })
        );

        renderComponent();

        expect(
            screen.getByRole('heading', { name: /edit profile/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/update your account details/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/loading profile/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /dashboard/i })
        ).toBeInTheDocument();
    });

    it('renders the profile form fields and action buttons when loaded', () => {
        useEditProfileForm.mockReturnValue(createHookState());

        renderComponent();

        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('07123456789');

        expect(
            screen.getByRole('button', { name: /save changes/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /change password/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', {
                name: /delete your account permanently/i
            })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('link', { name: /settings/i })
        ).toBeInTheDocument();
    });

    it('renders a success message from hook state', () => {
        useEditProfileForm.mockReturnValue(
            createHookState({
                successMessage: 'Profile updated successfully.'
            })
        );

        renderComponent();

        expect(
            screen.getByText(/profile updated successfully/i)
        ).toBeInTheDocument();
    });

    it('renders a global error message from hook state', () => {
        useEditProfileForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {},
                    global: ['Failed to update profile.']
                }
            })
        );

        renderComponent();

        expect(
            screen.getByText(/failed to update profile/i)
        ).toBeInTheDocument();
    });

    it('renders field errors on the correct inputs', () => {
        useEditProfileForm.mockReturnValue(
            createHookState({
                errors: {
                    fieldErrors: {
                        email: 'Enter a valid email address.',
                        username: 'This username is already taken.'
                    },
                    global: []
                }
            })
        );

        renderComponent();

        expect(
            screen.getByText(/enter a valid email address/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/this username is already taken/i)
        ).toBeInTheDocument();
    });

    it('passes changed field values to updateField', () => {
        const updateField = vi.fn();

        useEditProfileForm.mockReturnValue(
            createHookState({
                updateField
            })
        );

        renderComponent();

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'new@example.com' }
        });

        expect(updateField).toHaveBeenCalledTimes(1);
        expect(updateField).toHaveBeenCalledWith('email', 'new@example.com');
    });

    it('submits the form through the hook submit handler', () => {
        const handleSubmit = vi.fn((event) => event.preventDefault());

        useEditProfileForm.mockReturnValue(
            createHookState({
                handleSubmit
            })
        );

        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls the change password handler when the button is clicked', () => {
        const goToChangePassword = vi.fn();

        useEditProfileForm.mockReturnValue(
            createHookState({
                goToChangePassword
            })
        );

        renderComponent();

        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        expect(goToChangePassword).toHaveBeenCalledTimes(1);
    });

    it('calls the delete account handler when the button is clicked', () => {
        const handleDeleteAccount = vi.fn();

        useEditProfileForm.mockReturnValue(
            createHookState({
                handleDeleteAccount
            })
        );

        renderComponent();

        fireEvent.click(
            screen.getByRole('button', {
                name: /delete your account permanently/i
            })
        );

        expect(handleDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it('shows the saving state from hook state', () => {
        useEditProfileForm.mockReturnValue(
            createHookState({
                isSaving: true
            })
        );

        renderComponent();

        expect(
            screen.getByRole('button', { name: /saving/i })
        ).toBeDisabled();
    });
});