import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/vitest';
import AuthCard from '../AuthCard';

const renderAuthCard = (props, children) => {
    return render(
        <MemoryRouter>
            <AuthCard {...props}>
                {children}
            </AuthCard>
        </MemoryRouter>
    );
};

describe('Tests for AuthCard', () => {
    it('renders the title, subtitle, children, and footer link', () => {
        renderAuthCard(
            {
                title: "Welcome Back",
                subtitle: "Log in to continue",
                footerText: "No account?",
                footerLinkText: "Sign up",
                footerLinkTo: "/signup",
            },
            <form>Login form content</form>
        );

        expect(screen.getByText('Welcome Back')).toBeInTheDocument();
        expect(screen.getByText('Log in to continue')).toBeInTheDocument();
        expect(screen.getByText('Login form content')).toBeInTheDocument();
        expect(screen.getByText('No account?')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: 'Sign up' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('href', '/signup');
    });

    it('does not render the subtitle when it is not provided', () => {
        renderAuthCard(
            {
                title: "Create your account",
                footerText: "Already have an account?",
                footerLinkText: "Log in",
                footerLinkTo: "/login",
            },
            <div>Signup content</div>
        );

        expect(screen.getByText('Create your account')).toBeInTheDocument();
        expect(screen.getByText('Signup content')).toBeInTheDocument();
        expect(
            screen.queryByText('Log in to continue')
        ).not.toBeInTheDocument();
    });
});
