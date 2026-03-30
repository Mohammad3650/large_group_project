import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import SubscriptionList from '../SubscriptionList.jsx';

describe('SubscriptionList', () => {
    const subscriptions = [
        {
            id: 1,
            name: 'KCL Timetable',
            source_url: 'https://example.com/calendar.ics',
            last_synced_at: '2026-03-29T10:00:00Z',
            last_error: ''
        },
        {
            id: 2,
            name: 'Another Calendar',
            source_url: 'https://example.com/another.ics',
            last_synced_at: null,
            last_error: 'Sync failed'
        }
    ];

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the empty state when there are no subscriptions', () => {
        render(
            <SubscriptionList
                subscriptions={[]}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByText(/no calendar subscriptions added yet/i)
        ).toBeInTheDocument();
    });

    it('renders a subscription card with its details', () => {
        render(
            <SubscriptionList
                subscriptions={[subscriptions[0]]}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText('KCL Timetable')).toBeInTheDocument();
        expect(
            screen.getByText('https://example.com/calendar.ics')
        ).toBeInTheDocument();
        expect(screen.getByText(/last synced:/i)).toBeInTheDocument();
    });

    it('renders the last error when one exists', () => {
        render(
            <SubscriptionList
                subscriptions={[subscriptions[1]]}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText('Sync failed')).toBeInTheDocument();
    });

    it('calls onRefresh with the subscription id when refresh is clicked', async () => {
        const user = userEvent.setup();
        const mockOnRefresh = vi.fn();

        render(
            <SubscriptionList
                subscriptions={[subscriptions[0]]}
                onRefresh={mockOnRefresh}
                onDelete={vi.fn()}
            />
        );

        await user.click(screen.getByRole('button', { name: /refresh/i }));

        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
        expect(mockOnRefresh).toHaveBeenCalledWith(1);
    });

    it('calls onDelete with the subscription id when delete is confirmed', async () => {
        const user = userEvent.setup();
        const mockOnDelete = vi.fn();
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(
            <SubscriptionList
                subscriptions={[subscriptions[0]]}
                onRefresh={vi.fn()}
                onDelete={mockOnDelete}
            />
        );

        await user.click(screen.getByRole('button', { name: /delete/i }));

        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(1);
    });

    it('does not call onDelete when delete is cancelled', async () => {
        const user = userEvent.setup();
        const mockOnDelete = vi.fn();
        vi.spyOn(window, 'confirm').mockReturnValue(false);

        render(
            <SubscriptionList
                subscriptions={[subscriptions[0]]}
                onRefresh={vi.fn()}
                onDelete={mockOnDelete}
            />
        );

        await user.click(screen.getByRole('button', { name: /delete/i }));

        expect(window.confirm).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('renders multiple subscriptions', () => {
        render(
            <SubscriptionList
                subscriptions={subscriptions}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText('KCL Timetable')).toBeInTheDocument();
        expect(screen.getByText('Another Calendar')).toBeInTheDocument();
    });
});