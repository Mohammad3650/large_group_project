import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AuthSuccessAlert from '../../AuthComponents/AuthSuccessAlert';

describe('AuthSuccessAlert', () => {
    it('renders nothing when message is undefined', () => {
        const { container } = render(<AuthSuccessAlert />);

        expect(container.firstChild).toBeNull();
    });

    it('renders nothing when message is an empty string', () => {
        const { container } = render(<AuthSuccessAlert message="" />);

        expect(container.firstChild).toBeNull();
    });

    it('renders the success message when provided', () => {
        render(<AuthSuccessAlert message="Profile updated successfully." />);

        const alert = screen.getByRole('alert');

        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent('Profile updated successfully.');
    });
});