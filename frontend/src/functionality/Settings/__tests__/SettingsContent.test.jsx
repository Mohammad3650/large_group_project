import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SettingsContent from '../SettingsContent';

vi.mock('../ProfileSection.jsx', () => ({
    default: () => <div data-testid="profile-section" />,
}));

vi.mock('../SubscriptionSection.jsx', () => ({
    default: () => <div data-testid="subscription-section" />,
}));

vi.mock('../ExportSection.jsx', () => ({
    default: () => <div data-testid="export-section" />,
}));

const defaultProps = {
    subscriptions: [],
    error: '',
    setError: vi.fn(),
    onImport: vi.fn(),
    onRefresh: vi.fn(),
    onDelete: vi.fn(),
};

const renderContent = (activeSection) =>
    render(
        <MemoryRouter>
            <SettingsContent activeSection={activeSection} {...defaultProps} />
        </MemoryRouter>
    );

describe('SettingsContent', () => {
    it('renders ProfileSection when activeSection is profile', () => {
        renderContent('profile');
        expect(screen.getByTestId('profile-section')).toBeInTheDocument();
    });

    it('renders SubscriptionSection when activeSection is subscriptions', () => {
        renderContent('subscriptions');
        expect(screen.getByTestId('subscription-section')).toBeInTheDocument();
    });

    it('renders ExportSection when activeSection is export', () => {
        renderContent('export');
        expect(screen.getByTestId('export-section')).toBeInTheDocument();
    });

    it('renders nothing when activeSection is unknown', () => {
        const { container } = renderContent('unknown');
        expect(container.firstChild).toBeNull();
    });

    it('does not render other sections when profile is active', () => {
        renderContent('profile');
        expect(screen.queryByTestId('subscription-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('export-section')).not.toBeInTheDocument();
    });

    it('does not render other sections when subscriptions is active', () => {
        renderContent('subscriptions');
        expect(screen.queryByTestId('profile-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('export-section')).not.toBeInTheDocument();
    });

    it('does not render other sections when export is active', () => {
        renderContent('export');
        expect(screen.queryByTestId('profile-section')).not.toBeInTheDocument();
        expect(screen.queryByTestId('subscription-section')).not.toBeInTheDocument();
    });
});