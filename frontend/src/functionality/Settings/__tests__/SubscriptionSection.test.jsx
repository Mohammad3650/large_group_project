import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SubscriptionSection from '../SubscriptionSection.jsx';

const subscriptionFormMock = vi.fn();
const subscriptionListMock = vi.fn();

vi.mock('../SubscriptionForm.jsx', () => ({
    default: (props) => {
        subscriptionFormMock(props);
        return <div data-testid="subscription-form">Subscription form</div>;
    }
}));

vi.mock('../SubscriptionList.jsx', () => ({
    default: (props) => {
        subscriptionListMock(props);
        return <div data-testid="subscription-list">Subscription list</div>;
    }
}));

function renderSubscriptionSection(props = {}) {
    const defaultProps = {
        subscriptions: [],
        error: '',
        onImport: vi.fn(),
        onRefresh: vi.fn(),
        onDelete: vi.fn()
    };

    return render(<SubscriptionSection {...defaultProps} {...props} />);
}

describe('SubscriptionSection', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the subscription form and list', () => {
        renderSubscriptionSection();

        expect(screen.getByTestId('subscription-form')).toBeInTheDocument();
        expect(screen.getByTestId('subscription-list')).toBeInTheDocument();
    });

    it('renders the error message when error is provided', () => {
        renderSubscriptionSection({ error: 'Something went wrong' });

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('does not render an error message when error is empty', () => {
        renderSubscriptionSection({ error: '' });

        expect(
            screen.queryByText('Something went wrong')
        ).not.toBeInTheDocument();
    });

    it('passes onImport to SubscriptionForm', () => {
        const onImport = vi.fn();

        renderSubscriptionSection({ onImport });

        expect(subscriptionFormMock).toHaveBeenCalledWith(
            expect.objectContaining({ onImport })
        );
    });

    it('passes subscriptions, onRefresh, and onDelete to SubscriptionList', () => {
        const subscriptions = [
            { id: 1, name: 'My Timetable', source_url: 'https://example.com' }
        ];
        const onRefresh = vi.fn();
        const onDelete = vi.fn();

        renderSubscriptionSection({
            subscriptions,
            onRefresh,
            onDelete
        });

        expect(subscriptionListMock).toHaveBeenCalledWith(
            expect.objectContaining({
                subscriptions,
                onRefresh,
                onDelete
            })
        );
    });
});