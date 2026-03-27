import { render, screen, fireEvent } from '@testing-library/react';
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
            'My Calendar'
        );
        await user.type(
            screen.getByPlaceholderText(/ics or webcal url/i),
            'https://example.com/my-calendar.ics'
        );

        await user.click(
            screen.getByRole('button', { name: /import timetable/i })
        );

        expect(mockOnImport).toHaveBeenCalledTimes(1);
        expect(mockOnImport).toHaveBeenCalledWith({
            name: 'My Calendar',
            sourceUrl: 'https://example.com/my-calendar.ics'
        });
    });

    it('clears both inputs after a successful submit', async () => {
        const user = userEvent.setup();
        const mockOnImport = vi.fn().mockResolvedValue(undefined);

        render(<SubscriptionForm onImport={mockOnImport} />);

        const nameInput = screen.getByPlaceholderText(/subscription name/i);
        const urlInput = screen.getByPlaceholderText(/ics or webcal url/i);

        await user.type(nameInput, 'KCL Calendar');
        await user.type(urlInput, 'https://example.com/calendar.ics');

        await user.click(
            screen.getByRole('button', { name: /import timetable/i })
        );

        expect(nameInput).toHaveValue('');
        expect(urlInput).toHaveValue('');
    });

    it('calls onImport when the form is submitted', async () => {
        const user = userEvent.setup();
        const mockOnImport = vi.fn().mockResolvedValue(undefined);

        render(<SubscriptionForm onImport={mockOnImport} />);

        await user.type(
            screen.getByPlaceholderText(/subscription name/i),
            'KCL Calendar'
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
            name: 'KCL Calendar',
            sourceUrl: 'https://example.com/calendar.ics'
        });
    });
});