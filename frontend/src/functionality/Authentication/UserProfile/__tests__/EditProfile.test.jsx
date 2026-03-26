import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import EditProfile from '../EditProfile.jsx';
import { api } from '../../../../api.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../../api.js', () => ({
    api: {
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('EditProfile', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    function renderComponent() {
        return render(
            <MemoryRouter>
                <EditProfile />
            </MemoryRouter>
        );
    }

    const mockUserData = {
        email: 'test@example.com',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User',
        phone_number: '07123456789'
    };

    it('shows loading state before profile data loads', () => {
        api.get.mockImplementation(() => new Promise(() => {}));

        renderComponent();

        expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });

    it('loads and displays existing profile details', async () => {
        api.get.mockResolvedValue({ data: mockUserData });

        renderComponent();

        expect(await screen.findByDisplayValue('test@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test')).toBeInTheDocument();
        expect(screen.getByDisplayValue('User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('07123456789')).toBeInTheDocument();
    });

    it('redirects to login when fetching profile returns 401', async () => {
        api.get.mockRejectedValue({
            response: {
                status: 401
            }
        });

        renderComponent();

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('shows a global error when profile loading fails', async () => {
        api.get.mockRejectedValue({
            response: {
                status: 500
            }
        });

        renderComponent();

        expect(
            await screen.findByText(/failed to load profile details/i)
        ).toBeInTheDocument();
    });

    it('updates field values when the user edits the form', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });

        renderComponent();

        const emailInput = await screen.findByLabelText(/email/i);
        const usernameInput = screen.getByLabelText(/username/i);

        await user.clear(emailInput);
        await user.type(emailInput, 'new@example.com');

        await user.clear(usernameInput);
        await user.type(usernameInput, 'newusername');

        expect(emailInput).toHaveValue('new@example.com');
        expect(usernameInput).toHaveValue('newusername');
    });

    it('submits updated profile data and shows success message', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });
        api.put.mockResolvedValue({
            data: {
                email: 'updated@example.com',
                username: 'updateduser',
                first_name: 'Updated',
                last_name: 'Person',
                phone_number: '07999999999'
            }
        });

        renderComponent();

        const emailInput = await screen.findByLabelText(/email/i);
        const usernameInput = screen.getByLabelText(/username/i);
        const firstNameInput = screen.getByLabelText(/first name/i);
        const lastNameInput = screen.getByLabelText(/last name/i);
        const phoneInput = screen.getByLabelText(/phone number/i);

        await user.clear(emailInput);
        await user.type(emailInput, 'updated@example.com');

        await user.clear(usernameInput);
        await user.type(usernameInput, 'updateduser');

        await user.clear(firstNameInput);
        await user.type(firstNameInput, 'Updated');

        await user.clear(lastNameInput);
        await user.type(lastNameInput, 'Person');

        await user.clear(phoneInput);
        await user.type(phoneInput, '07999999999');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(api.put).toHaveBeenCalledWith('/api/user/', {
            email: 'updated@example.com',
            username: 'updateduser',
            first_name: 'Updated',
            last_name: 'Person',
            phone_number: '07999999999'
        });

        expect(
            await screen.findByText(/profile updated successfully/i)
        ).toBeInTheDocument();

        expect(screen.getByDisplayValue('updated@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('updateduser')).toBeInTheDocument();
    });

    it('shows saving state while the update request is in progress', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });

        let resolveRequest;
        api.put.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();

        resolveRequest({ data: mockUserData });

        await screen.findByText(/profile updated successfully/i);
    });

    it('shows backend field errors on the correct inputs', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });
        api.put.mockRejectedValue({
            response: {
                status: 400,
                data: {
                    email: ['Enter a valid email address.'],
                    username: ['This username is already taken.']
                }
            }
        });

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(
            await screen.findByText(/enter a valid email address/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(/this username is already taken/i)
        ).toBeInTheDocument();
    });

    it('redirects to login when saving profile returns 401', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });
        api.put.mockRejectedValue({
            response: {
                status: 401
            }
        });

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('shows a global error when saving fails without field errors', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });
        api.put.mockRejectedValue({
            response: {
                status: 500,
                data: null
            }
        });

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(screen.getByRole('button', { name: /save changes/i }));

        expect(
            await screen.findByText(/failed to update profile/i)
        ).toBeInTheDocument();
    });

    it('navigates to change password when the button is clicked', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(
            screen.getByRole('button', { name: /change password/i })
        );

        expect(mockNavigate).toHaveBeenCalledWith('/change-password');
    });

    it('does nothing when delete account is cancelled', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        const clearSpy = vi.spyOn(Storage.prototype, 'clear');

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(
            screen.getByRole('button', { name: /delete account/i })
        );

        expect(confirmSpy).toHaveBeenCalled();
        expect(api.delete).not.toHaveBeenCalled();
        expect(clearSpy).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
        clearSpy.mockRestore();
    });

    it('deletes the account, clears localStorage, and redirects on success', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });
        api.delete.mockResolvedValue({});

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
        const clearSpy = vi.spyOn(Storage.prototype, 'clear');

        delete window.location;
        window.location = { href: '' };

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(
            screen.getByRole('button', { name: /delete account/i })
        );

        expect(api.delete).toHaveBeenCalledWith('/api/user/delete/');
        expect(clearSpy).toHaveBeenCalled();
        expect(window.location.href).toBe('/');

        confirmSpy.mockRestore();
        clearSpy.mockRestore();
    });

    it('shows a global error when account deletion fails', async () => {
        const user = userEvent.setup();
        api.get.mockResolvedValue({ data: mockUserData });
        api.delete.mockRejectedValue(new Error('Delete failed'));

        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        renderComponent();

        await screen.findByDisplayValue('test@example.com');

        await user.click(
            screen.getByRole('button', { name: /delete account/i })
        );

        expect(
            await screen.findByText(/failed to delete account/i)
        ).toBeInTheDocument();

        confirmSpy.mockRestore();
    });
});