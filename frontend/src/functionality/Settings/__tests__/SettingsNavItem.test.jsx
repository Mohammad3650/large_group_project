import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsNavItem from '../SettingsNavItem';

vi.mock('../stylesheets/SettingsNavItem.css', () => ({}));

const MockIcon = () => <span data-testid="mock-icon" />;
const mockOnClick = vi.fn();

const renderNavItem = (isActive = false) =>
    render(
        <SettingsNavItem
            navKey="profile"
            label="Profile"
            icon={MockIcon}
            isActive={isActive}
            onClick={mockOnClick}
        />
    );

describe('SettingsNavItem', () => {
    it('renders the label', () => {
        renderNavItem();
        expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('renders the icon', () => {
        renderNavItem();
        expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
    });

    it('applies the active class when isActive is true', () => {
        renderNavItem(true);
        expect(screen.getByRole('button')).toHaveClass('active');
    });

    it('does not apply the active class when isActive is false', () => {
        renderNavItem(false);
        expect(screen.getByRole('button')).not.toHaveClass('active');
    });

    it('calls onClick when the button is clicked', () => {
        renderNavItem();
        fireEvent.click(screen.getByRole('button'));
        expect(mockOnClick).toHaveBeenCalled();
    });
});