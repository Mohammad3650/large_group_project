import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import EditProfileForm from '../../EditProfile/EditProfileForm.jsx';

function createProps(overrides = {}) {
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
        isSaving: false,
        onFieldChange: vi.fn(),
        onSubmit: vi.fn((event) => event.preventDefault()),
        onChangePassword: vi.fn(),
        onDeleteAccount: vi.fn(),
        ...overrides
    };
}

function renderComponent(overrides = {}) {
    const props = createProps(overrides);

    return {
        ...render(<EditProfileForm {...props} />),
        props
    };
}

describe('EditProfileForm', () => {
    it('renders all profile fields with their values', () => {
        renderComponent();

        expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
        expect(screen.getByLabelText(/username/i)).toHaveValue('testuser');
        expect(screen.getByLabelText(/first name/i)).toHaveValue('Test');
        expect(screen.getByLabelText(/last name/i)).toHaveValue('User');
        expect(screen.getByLabelText(/phone number/i)).toHaveValue('07123456789');
    });

    it('renders the action buttons', () => {
        renderComponent();

        expect(
            screen.getByRole('button', { name: /save changes/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /change password/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /delete your account permanently/i })
        ).toBeInTheDocument();
    });

    it('calls onFieldChange with the email field name and new value', () => {
        const onFieldChange = vi.fn();

        renderComponent({ onFieldChange });

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'new@example.com' }
        });

        expect(onFieldChange).toHaveBeenCalledTimes(1);
        expect(onFieldChange).toHaveBeenCalledWith('email', 'new@example.com');
    });

    it('calls onFieldChange with the first name field name and new value', () => {
        const onFieldChange = vi.fn();

        renderComponent({ onFieldChange });

        fireEvent.change(screen.getByLabelText(/first name/i), {
            target: { value: 'Updated' }
        });

        expect(onFieldChange).toHaveBeenCalledTimes(1);
        expect(onFieldChange).toHaveBeenCalledWith('first_name', 'Updated');
    });

    it('calls onSubmit when the form is submitted', () => {
        const onSubmit = vi.fn((event) => event.preventDefault());

        renderComponent({ onSubmit });

        fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onChangePassword when the change password button is clicked', () => {
        const onChangePassword = vi.fn();

        renderComponent({ onChangePassword });

        fireEvent.click(screen.getByRole('button', { name: /change password/i }));

        expect(onChangePassword).toHaveBeenCalledTimes(1);
    });

    it('calls onDeleteAccount when the delete account button is clicked', () => {
        const onDeleteAccount = vi.fn();

        renderComponent({ onDeleteAccount });

        fireEvent.click(
            screen.getByRole('button', {
                name: /delete your account permanently/i
            })
        );

        expect(onDeleteAccount).toHaveBeenCalledTimes(1);
    });

    it('renders field errors on the matching inputs', () => {
        renderComponent({
            errors: {
                fieldErrors: {
                    email: 'Enter a valid email address.',
                    username: 'This username is already taken.',
                    phone_number: 'Enter a valid phone number.'
                },
                global: []
            }
        });

        expect(
            screen.getByText(/enter a valid email address/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/this username is already taken/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/enter a valid phone number/i)
        ).toBeInTheDocument();
    });

    it('shows the saving state on the submit button', () => {
        renderComponent({ isSaving: true });

        expect(
            screen.getByRole('button', { name: /saving/i })
        ).toBeDisabled();
    });

    it('shows the normal submit state when not saving', () => {
        renderComponent({ isSaving: false });

        expect(
            screen.getByRole('button', { name: /save changes/i })
        ).not.toBeDisabled();
    });
});