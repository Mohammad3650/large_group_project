import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import SubscriptionList from '../SubscriptionList.jsx';

describe('Tests for SubscriptionList', () => {
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
                subscriptions={[
                    {
                        id: 1,
                        name: 'KCL Timetable',
                        source_url: 'https://example.com/calendar.ics',
                        last_synced_at: null,
                        last_error: ''
                    }
                ]}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByRole('heading', { name: /kcl timetable/i })
        ).toBeInTheDocument();
        expect(
            screen.getByText('https://example.com/calendar.ics')
        ).toBeInTheDocument();
        expect(screen.getByText(/last synced:/i)).toBeInTheDocument();
        expect(screen.getByText(/never/i)).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /refresh/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /delete/i })
        ).toBeInTheDocument();
    });

    it('renders the last error when one exists', () => {
        render(
            <SubscriptionList
                subscriptions={[
                    {
                        id: 1,
                        name: 'KCL Timetable',
                        source_url: 'https://example.com/calendar.ics',
                        last_synced_at: null,
                        last_error: 'Failed to fetch feed'
                    }
                ]}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(screen.getByText(/failed to fetch feed/i)).toBeInTheDocument();
    });

    it('calls onRefresh with the subscription id when refresh is clicked', async () => {
        const user = userEvent.setup();
        const mockOnRefresh = vi.fn();

        render(
            <SubscriptionList
                subscriptions={[
                    {
                        id: 42,
                        name: 'KCL Timetable',
                        source_url: 'https://example.com/calendar.ics',
                        last_synced_at: null,
                        last_error: ''
                    }
                ]}
                onRefresh={mockOnRefresh}
                onDelete={vi.fn()}
            />
        );

        await user.click(screen.getByRole('button', { name: /refresh/i }));

        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
        expect(mockOnRefresh).toHaveBeenCalledWith(42);
    });

    it('calls onDelete with the subscription id when delete is clicked', async () => {
        const user = userEvent.setup();
        const mockOnDelete = vi.fn();

        render(
            <SubscriptionList
                subscriptions={[
                    {
                        id: 99,
                        name: 'KCL Timetable',
                        source_url: 'https://example.com/calendar.ics',
                        last_synced_at: null,
                        last_error: ''
                    }
                ]}
                onRefresh={vi.fn()}
                onDelete={mockOnDelete}
            />
        );

        await user.click(screen.getByRole('button', { name: /delete/i }));

        expect(mockOnDelete).toHaveBeenCalledTimes(1);
        expect(mockOnDelete).toHaveBeenCalledWith(99);
    });

    it('renders multiple subscriptions', () => {
        render(
            <SubscriptionList
                subscriptions={[
                    {
                        id: 1,
                        name: 'Calendar One',
                        source_url: 'https://example.com/one.ics',
                        last_synced_at: null,
                        last_error: ''
                    },
                    {
                        id: 2,
                        name: 'Calendar Two',
                        source_url: 'https://example.com/two.ics',
                        last_synced_at: null,
                        last_error: ''
                    }
                ]}
                onRefresh={vi.fn()}
                onDelete={vi.fn()}
            />
        );

        expect(
            screen.getByRole('heading', { name: /calendar one/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('heading', { name: /calendar two/i })
        ).toBeInTheDocument();
        expect(screen.getAllByRole('button', { name: /refresh/i })).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: /delete/i })).toHaveLength(2);
    });
});