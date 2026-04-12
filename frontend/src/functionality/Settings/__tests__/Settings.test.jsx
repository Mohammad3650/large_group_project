import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as useBodyClassModule from '../../../utils/Hooks/useBodyClass.js';
import Settings from '../Settings';

let capturedRefetchBlocks;

vi.mock('../SettingsSidebar.jsx', () => ({
    default: ({ activeSection, setActiveSection }) => (
        <div>
            <button onClick={() => setActiveSection('profile')}>Profile</button>
            <button onClick={() => setActiveSection('subscriptions')}>Subscriptions</button>
            <button onClick={() => setActiveSection('export')}>Export</button>
            <span data-testid="active-section">{activeSection}</span>
        </div>
    ),
}));

vi.mock('../SettingsContent.jsx', () => ({
    default: ({ activeSection }) => <div data-testid={`content-${activeSection}`} />,
}));

vi.mock('../../../utils/Hooks/useSubscriptions.js', () => ({
    default: vi.fn(() => ({ subscriptions: [], setSubscriptions: vi.fn() })),
}));

vi.mock('../../../utils/Hooks/useSubscriptionActions.js', () => ({
    default: vi.fn((args) => {
        capturedRefetchBlocks = args.refetchBlocks;
        return { onImport: vi.fn(), onRefresh: vi.fn(), onDelete: vi.fn() };
    }),
}));

vi.mock('../../../utils/Hooks/useAutoResetError.js', () => ({
    default: vi.fn(),
}));

vi.mock('../../../utils/Hooks/useBodyClass.js', () => ({
    default: vi.fn(),
}));

vi.mock('../stylesheets/Settings.css', () => ({}));

const renderSettings = () =>
    render(
        <MemoryRouter>
            <Settings />
        </MemoryRouter>
    );

describe('Settings', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the profile content by default', () => {
        renderSettings();
        expect(screen.getByTestId('content-profile')).toBeInTheDocument();
    });

    it('renders the subscriptions content when subscriptions is selected', () => {
        renderSettings();
        fireEvent.click(screen.getByText('Subscriptions'));
        expect(screen.getByTestId('content-subscriptions')).toBeInTheDocument();
    });

    it('renders the export content when export is selected', () => {
        renderSettings();
        fireEvent.click(screen.getByText('Export'));
        expect(screen.getByTestId('content-export')).toBeInTheDocument();
    });

    it('renders the profile content when profile is selected after switching', () => {
        renderSettings();
        fireEvent.click(screen.getByText('Export'));
        fireEvent.click(screen.getByText('Profile'));
        expect(screen.getByTestId('content-profile')).toBeInTheDocument();
    });

    it('applies the settings-page body class', () => {
        renderSettings();
        expect(useBodyClassModule.default).toHaveBeenCalledWith('settings-page');
    });

    it('provides a no-op refetchBlocks to useSubscriptionActions', () => {
        renderSettings();
        expect(capturedRefetchBlocks).toBeDefined();
        expect(() => capturedRefetchBlocks()).not.toThrow();
    });
});