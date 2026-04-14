import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Settings from '../Settings.jsx';
import useBodyClass from '../../../utils/Hooks/useBodyClass.js';
import useSubscriptions from '../utils/Hooks/useSubscriptions.js';
import useSubscriptionActions from '../utils/Hooks/useSubscriptionActions.js';

let capturedRefetchBlocks;

vi.mock('../utils/Hooks/useSubscriptions.js', () => ({
    default: vi.fn()
}));

vi.mock('../utils/Hooks/useSubscriptionActions.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../utils/Hooks/useBodyClass.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../utils/Hooks/useAutoResetError.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../components/LogoutButton.jsx', () => ({
    default: () => <button type="button">Logout</button>
}));

function renderSettings() {
    return render(
        <MemoryRouter>
            <Settings />
        </MemoryRouter>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        capturedRefetchBlocks = undefined;

        vi.mocked(useSubscriptions).mockReturnValue({
            subscriptions: [],
            setSubscriptions: vi.fn()
        });

        vi.mocked(useSubscriptionActions).mockImplementation((context) => {
            capturedRefetchBlocks = context.refetchBlocks;

            return {
                onImport: vi.fn(),
                onRefresh: vi.fn(),
                onDelete: vi.fn()
            };
        });
    });

    it('renders the profile content by default', () => {
        renderSettings();

        expect(
            screen.getByRole('heading', { name: 'Profile' })
        ).toBeInTheDocument();
    });

    it('renders the subscriptions content when subscriptions is selected', () => {
        renderSettings();

        fireEvent.click(
            screen.getByRole('button', { name: /subscriptions/i })
        );

        expect(
            screen.getByRole('heading', { name: /subscribe to timetable/i })
        ).toBeInTheDocument();
    });

    it('renders the export content when export is selected', () => {
        renderSettings();

        fireEvent.click(
            screen.getByRole('button', { name: /export/i })
        );

        expect(
            screen.getByRole('heading', { name: 'Export' })
        ).toBeInTheDocument();
    });

    it('renders the profile content when profile is selected after switching', () => {
        renderSettings();

        fireEvent.click(
            screen.getByRole('button', { name: /subscriptions/i })
        );
        fireEvent.click(
            screen.getByRole('button', { name: /profile/i })
        );

        expect(
            screen.getByRole('heading', { name: 'Profile' })
        ).toBeInTheDocument();
    });

    it('applies the settings-page body class', () => {
        renderSettings();

        expect(useBodyClass).toHaveBeenCalledWith('settings-page');
    });

    it('provides a no-op refetchBlocks to useSubscriptionActions', () => {
        renderSettings();

        expect(capturedRefetchBlocks).toBeDefined();
        expect(() => capturedRefetchBlocks()).not.toThrow();
    });
});