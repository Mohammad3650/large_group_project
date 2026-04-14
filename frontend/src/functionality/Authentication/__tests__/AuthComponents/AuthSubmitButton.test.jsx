import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AuthSubmitButton from '../../AuthComponents/AuthSubmitButton';

function renderAuthSubmitButton(props = {}) {
    const defaultProps = {
        loading: false,
        text: 'Log in',
        loadingText: 'Logging in...'
    };

    return render(<AuthSubmitButton {...defaultProps} {...props} />);
}

describe('AuthSubmitButton', () => {
    it('renders the default button text when not loading', () => {
        renderAuthSubmitButton();

        const button = screen.getByRole('button', { name: 'Log in' });

        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('type', 'submit');
        expect(button).not.toBeDisabled();
    });

    it('renders the loading text and disables the button when loading', () => {
        renderAuthSubmitButton({
            loading: true,
            text: 'Log in',
            loadingText: 'Logging in...'
        });

        const button = screen.getByRole('button', { name: /logging in\.\.\./i });

        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
        expect(screen.getByText('Logging in...')).toBeInTheDocument();
    });

    it('renders a spinner when loading', () => {
        const { container } = renderAuthSubmitButton({
            loading: true,
            loadingText: 'Signing up...'
        });

        const spinner = container.querySelector('.spinner-border');

        expect(spinner).toBeInTheDocument();
        expect(spinner).toHaveClass('spinner-border-sm');
    });

    it('does not render a spinner when not loading', () => {
        const { container } = renderAuthSubmitButton({
            loading: false,
            text: 'Sign up'
        });

        const spinner = container.querySelector('.spinner-border');

        expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
        expect(spinner).not.toBeInTheDocument();
    });
});