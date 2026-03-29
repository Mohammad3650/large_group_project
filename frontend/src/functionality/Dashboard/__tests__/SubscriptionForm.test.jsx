import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import SubscriptionForm from '../SubscriptionForm.jsx';

describe('SubscriptionForm', () => {
    it('renders the subscription form fields and submit button', () => {
        render(<SubscriptionForm onImport={vi.fn()} />);

        expect(
            screen.getByRole('heading', { name: /subscribe to timetable/i })
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/subscription name/i)
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/ics or webcal url/i)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /import timetable/i })
        ).toBeInTheDocument();
    });

    it('updates both inputs when the user types', async () => {
        const user = userEvent.setup();
        render(<SubscriptionForm onImport={vi.fn()} />);

        const nameInput = screen.getByPlaceholderText(/subscription name/i);
        const urlInput = screen.getByPlaceholderText(/ics or webcal url/i);

        await user.type(nameInput, 'KCL Timetable');
        await user.type(urlInput, 'https://example.com/calendar.ics');

        expect(nameInput).toHaveValue('KCL Timetable');
        expect(urlInput).toHaveValue('https://example.com/calendar.ics');
    });

    it('calls onImport with the entered values on submit', async () => {
        const user = userEvent.setup();
        const mockOnImport = vi.fn().mockResolvedValue(undefined);

        render(<SubscriptionForm onImport={mockOnImport} />);

        await user.type(
            screen.getByPlaceholderText(/subscription name/i),
            'KCL Timetable'
        );
        await user.type(
            screen.getByPlaceholderText(/ics or webcal url/i),
            'https://example.com/calendar.ics'
        );

        await user.click(
            screen.getByRole('button', { name: /import timetable/i })
        );

        expect(mockOnImport).toHaveBeenCalledTimes(1);
        expect(mockOnImport).toHaveBeenCalledWith({
            name: 'KCL Timetable',
            sourceUrl: 'https://example.com/calendar.ics'
        });
    });

    it('clears both inputs and shows a success message after a successful submit', async () => {
        const user = userEvent.setup();
        const mockOnImport = vi.fn().mockResolvedValue(undefined);

        render(<SubscriptionForm onImport={mockOnImport} />);

        const nameInput = screen.getByPlaceholderText(/subscription name/i);
        const urlInput = screen.getByPlaceholderText(/ics or webcal url/i);

        await user.type(nameInput, 'KCL Timetable');
        await user.type(urlInput, 'https://example.com/calendar.ics');

        await user.click(
            screen.getByRole('button', { name: /import timetable/i })
        );

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(urlInput).toHaveValue('');
        });

        expect(
            screen.getByText(/timetable imported successfully/i)
        ).toBeInTheDocument();
    });

    it('shows an error message and does not clear inputs if onImport rejects', async () => {
        const user = userEvent.setup();
        const mockOnImport = vi
            .fn()
            .mockRejectedValue(new Error('Import failed'));

        render(<SubscriptionForm onImport={mockOnImport} />);

        const nameInput = screen.getByPlaceholderText(/subscription name/i);
        const urlInput = screen.getByPlaceholderText(/ics or webcal url/i);

        await user.type(nameInput, 'KCL Timetable');
        await user.type(urlInput, 'https://example.com/calendar.ics');

        await user.click(
            screen.getByRole('button', { name: /import timetable/i })
        );

        expect(
            await screen.findByText(/failed to import timetable/i)
        ).toBeInTheDocument();

        expect(nameInput).toHaveValue('KCL Timetable');
        expect(urlInput).toHaveValue('https://example.com/calendar.ics');
    });

    it('shows loading text and disables the submit button while importing', async () => {
        const user = userEvent.setup();

        let resolveImport;
        const mockOnImport = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveImport = resolve;
                })
        );

        render(<SubscriptionForm onImport={mockOnImport} />);

        await user.type(
            screen.getByPlaceholderText(/subscription name/i),
            'KCL Timetable'
        );
        await user.type(
            screen.getByPlaceholderText(/ics or webcal url/i),
            'https://example.com/calendar.ics'
        );

        const submitButton = screen.getByRole('button', {
            name: /import timetable/i
        });

        await user.click(submitButton);

        expect(
            screen.getByRole('button', { name: /importing/i })
        ).toBeDisabled();

        resolveImport(undefined);

        await waitFor(() => {
            expect(
                screen.getByRole('button', { name: /import timetable/i })
            ).toBeInTheDocument();
        });
    });

    it('does not submit twice while loading', async () => {
        const user = userEvent.setup();

        let resolveImport;
        const mockOnImport = vi.fn(
            () =>
                new Promise((resolve) => {
                    resolveImport = resolve;
                })
        );

        render(<SubscriptionForm onImport={mockOnImport} />);

        await user.type(
            screen.getByPlaceholderText(/subscription name/i),
            'KCL Timetable'
        );
        await user.type(
            screen.getByPlaceholderText(/ics or webcal url/i),
            'https://example.com/calendar.ics'
        );

        const submitButton = screen.getByRole('button', {
            name: /import timetable/i
        });

        await user.click(submitButton);
        await user.click(submitButton);

        expect(mockOnImport).toHaveBeenCalledTimes(1);

        resolveImport(undefined);
    });
});