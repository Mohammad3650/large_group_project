import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import TimeWindowInput from '../TimeWindowInput.jsx';

const renderTimeWindowInput = (overrides = {}) => {
    const props = {
        windows: { start_min: '07:00', end_min: '23:00' },
        updateWindow: vi.fn(),
        serverErrors: {},
        ...overrides
    };

    return {
        ...render(<TimeWindowInput {...props} />),
        props
    };
};

describe('TimeWindowInput', () => {
    it('renders wake up and sleep time inputs with values', () => {
        renderTimeWindowInput();

        expect(screen.getByLabelText(/wake up/i)).toHaveValue('07:00');
        expect(screen.getByLabelText(/sleep/i)).toHaveValue('23:00');
    });

    it('calls updateWindow when wake up time changes', () => {
        const mockUpdateWindow = vi.fn();
        renderTimeWindowInput({ updateWindow: mockUpdateWindow });

        fireEvent.change(screen.getByLabelText(/wake up/i), {
            target: { value: '08:30' }
        });

        expect(mockUpdateWindow).toHaveBeenCalledWith('start_min', '08:30');
    });

    it('calls updateWindow when sleep time changes', () => {
        const mockUpdateWindow = vi.fn();
        renderTimeWindowInput({ updateWindow: mockUpdateWindow });

        fireEvent.change(screen.getByLabelText(/sleep/i), {
            target: { value: '22:30' }
        });

        expect(mockUpdateWindow).toHaveBeenCalledWith('end_min', '22:30');
    });

    it('displays window error message when serverErrors are present', () => {
        const serverErrors = {
            windows: [
                {
                    start_min: ['Wake up must be before sleep']
                }
            ]
        };

        renderTimeWindowInput({ serverErrors });

        expect(
            screen.getByText(/wake up must be before sleep/i)
        ).toBeInTheDocument();
    });
});
