import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProfileSection from '../ProfileSection';

vi.mock('react-icons/fa', () => ({
    FaUser: () => <span data-testid="fa-user" />,
    FaKey: () => <span data-testid="fa-key" />,
}));

const renderProfileSection = () =>
    render(
        <MemoryRouter>
            <ProfileSection />
        </MemoryRouter>
    );

describe('ProfileSection', () => {
    it('renders the Profile heading', () => {
        renderProfileSection();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders the Edit Profile link pointing to /profile', () => {
        renderProfileSection();
        const link = screen.getByText('Edit Profile').closest('a');
        expect(link).toHaveAttribute('href', '/profile');
    });

    it('renders the Change Password link pointing to /change-password', () => {
        renderProfileSection();
        const link = screen.getByText('Change Password').closest('a');
        expect(link).toHaveAttribute('href', '/change-password');
    });

    it('renders the user icon', () => {
        renderProfileSection();
        expect(screen.getByTestId('fa-user')).toBeInTheDocument();
    });

    it('renders the key icon', () => {
        renderProfileSection();
        expect(screen.getByTestId('fa-key')).toBeInTheDocument();
    });
});