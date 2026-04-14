import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import GlobalOptions from '../GlobalOptions.jsx';

const renderGlobalOptions = (overrides = {}) => {
    const props = {
        evenSpread: false,
        handleEvenSpreadChange: vi.fn(),
        includeScheduled: false,
        setIncludeScheduled: vi.fn(),
        ...overrides
    };

    return {
        ...render(<GlobalOptions {...props} />),
        props
    };
};

describe('GlobalOptions', () => {
    it('renders both checkboxes', () => {
        renderGlobalOptions();

        expect(screen.getByLabelText(/even spread/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/include scheduled/i)).toBeInTheDocument();
    });

    it('disables include scheduled when even spread is false', () => {
        renderGlobalOptions({ evenSpread: false });

        expect(screen.getByLabelText(/include scheduled/i)).toBeDisabled();
    });

    it('enables include scheduled when even spread is true', () => {
        renderGlobalOptions({ evenSpread: true });

        expect(screen.getByLabelText(/include scheduled/i)).not.toBeDisabled();
    });

    it('calls handleEvenSpreadChange when the even spread checkbox is clicked', () => {
        const mockHandleEvenSpreadChange = vi.fn();
        renderGlobalOptions({ handleEvenSpreadChange: mockHandleEvenSpreadChange });

        fireEvent.click(screen.getByLabelText(/even spread/i));
        expect(mockHandleEvenSpreadChange).toHaveBeenCalledWith(true);
    });

    it('calls setIncludeScheduled when include scheduled is clicked and enabled', () => {
        const mockSetIncludeScheduled = vi.fn();
        renderGlobalOptions({ evenSpread: true, setIncludeScheduled: mockSetIncludeScheduled });

        fireEvent.click(screen.getByLabelText(/include scheduled/i));
        expect(mockSetIncludeScheduled).toHaveBeenCalledWith(true);
    });
});
