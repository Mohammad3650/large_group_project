import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WelcomeMessage from '../WelcomeMessage.jsx';

vi.mock('../stylesheets/WelcomeMessage.css', () => ({}));

describe('WelcomeMessage component', () => {
    it('renders the welcome message with the correct page and username', () => {
        render(<WelcomeMessage page="Dashboard" username="testuser" />);
        expect(screen.getByText('Welcome to your Dashboard, testuser!')).toBeInTheDocument();
    });

    it('applies the welcome-message class', () => {
        render(<WelcomeMessage page="Dashboard" username="testuser" />);
        expect(screen.getByRole('heading')).toHaveClass('welcome-message');
    });

    it('renders correctly with a different page and username', () => {
        render(<WelcomeMessage page="Calendar" username="johndoe" />);
        expect(screen.getByText('Welcome to your Calendar, johndoe!')).toBeInTheDocument();
    });
});