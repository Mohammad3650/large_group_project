import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import StatusAlerts from '../../AuthComponents/StatusAlert';

describe('StatusAlerts', () => {
    it('renders nothing when there is no success message and no global errors', () => {
        const { container } = render(
            <StatusAlerts
                errors={{ fieldErrors: {}, global: [] }}
                successMessage=""
            />
        );

        expect(container.firstChild).toBeNull();
    });

    it('renders only the success alert when a success message is provided', () => {
        render(
            <StatusAlerts
                errors={{ fieldErrors: {}, global: [] }}
                successMessage="Profile updated successfully."
            />
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
            screen.getByText('Profile updated successfully.')
        ).toBeInTheDocument();
        expect(
            screen.queryByText(/failed|required|invalid/i)
        ).not.toBeInTheDocument();
    });

    it('renders only the error alert when global errors are provided', () => {
        render(
            <StatusAlerts
                errors={{
                    fieldErrors: {},
                    global: ['Failed to update profile.']
                }}
                successMessage=""
            />
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
            screen.getByText('Failed to update profile.')
        ).toBeInTheDocument();
        expect(
            screen.queryByText('Profile updated successfully.')
        ).not.toBeInTheDocument();
    });

    it('renders both success and error alerts when both are provided', () => {
        render(
            <StatusAlerts
                errors={{
                    fieldErrors: {},
                    global: ['Failed to save one field.']
                }}
                successMessage="Profile updated successfully."
            />
        );

        const alerts = screen.getAllByRole('alert');

        expect(alerts).toHaveLength(2);
        expect(
            screen.getByText('Profile updated successfully.')
        ).toBeInTheDocument();
        expect(
            screen.getByText('Failed to save one field.')
        ).toBeInTheDocument();
    });
});