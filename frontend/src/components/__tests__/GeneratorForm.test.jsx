import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import GeneratorForm from '../GeneratorForm.jsx';

const renderGeneratorForm = (overrides = {}) => {
    const props = {
        onSubmit: vi.fn(),
        loading: false,
        serverErrors: {},
        clearErrors: vi.fn(),
        ...overrides
    };

    return render(<GeneratorForm {...props} />);
};

vi.mock('../../utils/Helpers/getUserTimezone', () => ({
        default: () => 'UTC'
    }));

describe('Tests for GeneratorForm', () => {
    it('renders all main forms', () => {
        renderGeneratorForm();

        // Date and time input labels
        expect(screen.getByLabelText(/start/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/end/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/wake up/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/sleep/i)).toBeInTheDocument();

        // Global checkbox option labels
        expect(screen.getByLabelText(/even spread/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/include scheduled/i)).toBeInTheDocument();

        // Inputs
        expect(screen.getByPlaceholderText(/name/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/duration \(minutes\)/i)
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/frequency \(times per week\)/i)
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/location/i)).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText(/description \(optional\)/i)
        ).toBeInTheDocument();

        // Dropdown options
        expect(screen.getByDisplayValue('None')).toBeInTheDocument();

        // Buttons
        expect(
            screen.getByRole('button', { name: /add another event/i })
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /Create Task/i })
        ).toBeInTheDocument();
    });

    it('include scheduled is disabled initially and becomes enabled when even spread is checked', () => {
        renderGeneratorForm();

        const evenSpreadCheckbox = screen.getByLabelText(/even spread/i);
        const includeScheduledCheckbox =
            screen.getByLabelText(/include scheduled/i);

        expect(includeScheduledCheckbox).toBeDisabled();

        fireEvent.click(evenSpreadCheckbox);
        expect(includeScheduledCheckbox).not.toBeDisabled();

        fireEvent.click(includeScheduledCheckbox);
        expect(includeScheduledCheckbox).toBeChecked();

        fireEvent.click(evenSpreadCheckbox);
        expect(includeScheduledCheckbox).toBeDisabled();
        expect(includeScheduledCheckbox).not.toBeChecked();
    });

    it('daily checkbox disables frequency and sets it to 1', () => {
        renderGeneratorForm();

        const dailyCheckbox = screen.getByLabelText(/daily/i);
        const frequencyInput = screen.getByPlaceholderText(
            /frequency \(times per week\)/i
        );

        expect(frequencyInput).not.toBeDisabled();
        expect(frequencyInput).toHaveValue(null);

        fireEvent.click(dailyCheckbox);

        expect(frequencyInput).toBeDisabled();
        expect(frequencyInput).toHaveValue(1);

        fireEvent.click(dailyCheckbox);
        expect(frequencyInput).not.toBeDisabled();
        expect(frequencyInput).toHaveValue(null);
    });

    it('add another event and delete event works', () => {
        renderGeneratorForm();

        fireEvent.click(
            screen.getByRole('button', { name: /add another event/i })
        );
        expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(2);

        const deleteButtons = screen.getAllByRole('button', {
            name: /delete event/i
        });
        expect(deleteButtons).toHaveLength(2);

        fireEvent.click(deleteButtons[0]);

        expect(screen.getAllByPlaceholderText(/name/i)).toHaveLength(1);
        expect(
            screen.queryByRole('button', { name: /delete event/i })
        ).not.toBeInTheDocument();
    });

    it('calls clearErrors via useEffect', () => {
        const mockClearErrors = vi.fn();

        renderGeneratorForm({ clearErrors: mockClearErrors });
        expect(mockClearErrors).toHaveBeenCalledTimes(1);
    });

    it('updates text, number, select, textarea, and time/date inputs', () => {
        renderGeneratorForm();

        fireEvent.change(screen.getByPlaceholderText(/^name$/i), {
            target: { value: 'Math Revision' }
        });
        fireEvent.change(screen.getByPlaceholderText(/duration \(minutes\)/i), {
            target: { value: '90' }
        });
        fireEvent.change(
            screen.getByPlaceholderText(/frequency \(times per week\)/i),
            {
                target: { value: '3' }
            }
        );
        fireEvent.change(screen.getByPlaceholderText(/location/i), {
            target: { value: 'Library' }
        });
        fireEvent.change(
            screen.getByPlaceholderText(/description \(optional\)/i),
            {
                target: { value: 'practice' }
            }
        );

        fireEvent.change(screen.getByLabelText(/start/i), {
            target: { value: '2026-03-23' }
        });
        fireEvent.change(screen.getByLabelText(/end/i), {
            target: { value: '2026-03-29' }
        });
        fireEvent.change(screen.getByLabelText(/wake up/i), {
            target: { value: '07:30' }
        });
        fireEvent.change(screen.getByLabelText(/sleep/i), {
            target: { value: '23:00' }
        });

        fireEvent.change(screen.getByDisplayValue('None'), {
            target: { value: 'Late' }
        });
        fireEvent.change(screen.getByDisplayValue('Study'), {
            target: { value: 'work' }
        });

        expect(screen.getByPlaceholderText(/^name$/i)).toHaveValue(
            'Math Revision'
        );
        expect(
            screen.getByPlaceholderText(/duration \(minutes\)/i)
        ).toHaveValue(90);
        expect(
            screen.getByPlaceholderText(/frequency \(times per week\)/i)
        ).toHaveValue(3);
        expect(screen.getByPlaceholderText(/location/i)).toHaveValue('Library');
        expect(
            screen.getByPlaceholderText(/description \(optional\)/i)
        ).toHaveValue('practice');

        expect(screen.getByLabelText(/start/i)).toHaveValue('2026-03-23');
        expect(screen.getByLabelText(/end/i)).toHaveValue('2026-03-29');
        expect(screen.getByLabelText(/wake up/i)).toHaveValue('07:30');
        expect(screen.getByLabelText(/sleep/i)).toHaveValue('23:00');

        expect(screen.getByDisplayValue('Late')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Work')).toBeInTheDocument();
    });

    it('shows loading state and disables submit button', () => {
        renderGeneratorForm({ loading: true });


        const submitButton = screen.getByRole('button', {
            name: /saving/i
        });
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/saving/i)).toBeInTheDocument();
        expect(
            screen.getByText((_, el) => el?.classList.contains('spinner'))
        ).toBeInTheDocument();
    });


    it('submits the full payload', async () => {
        const user = userEvent.setup();
        const mockOnSubmit = vi.fn();

        renderGeneratorForm({ onSubmit: mockOnSubmit });

        fireEvent.change(screen.getByLabelText(/start/i), {
            target: { value: '2026-03-23' }
        });
        fireEvent.change(screen.getByLabelText(/end/i), {
            target: { value: '2026-03-29' }
        });
        fireEvent.change(screen.getByLabelText(/wake up/i), {
            target: { value: '08:00' }
        });
        fireEvent.change(screen.getByLabelText(/sleep/i), {
            target: { value: '22:30' }
        });

        fireEvent.change(screen.getByPlaceholderText(/^name$/i), {
            target: { value: 'Algorithms' }
        });
        fireEvent.change(screen.getByPlaceholderText(/duration \(minutes\)/i), {
            target: { value: '120' }
        });
        fireEvent.change(screen.getByPlaceholderText(/frequency \(times per week\)/i), {
            target: { value: '4' }
        });
        fireEvent.change(screen.getByPlaceholderText(/location/i), {
            target: { value: 'Campus' }
        });
        fireEvent.change(screen.getByPlaceholderText(/description \(optional\)/i), {
            target: { value: 'Past papers' }
        });

        await user.click(screen.getByLabelText(/even spread/i));
        await user.click(screen.getByLabelText(/include scheduled/i));

        fireEvent.change(screen.getByDisplayValue('None'), {
            target: { value: 'Early' }
        });
        fireEvent.change(screen.getByDisplayValue('Study'), {
            target: { value: 'lecture' }
        });

        await user.click(
            screen.getByRole('button', { name: /Create Task/i })
        );

        expect(mockOnSubmit).toHaveBeenCalledTimes(1);
        expect(mockOnSubmit).toHaveBeenCalledWith({
            week_start: '2026-03-23',
            week_end: '2026-03-29',
            even_spread: true,
            include_scheduled: true,
            windows: [
                {
                    start_min: '08:00',
                    end_min: '22:30',
                    daily: true,
                    timezone: 'UTC',
                }
            ],
            unscheduled: [
                {
                    name: 'Algorithms',
                    duration: '120',
                    frequency: '4',
                    daily: false,
                    start_time_preference: 'Early',
                    location: 'Campus',
                    block_type: 'lecture',
                    description: 'Past papers',
                    timezone: 'UTC',
                }
            ]
        });
    });

    it('renders all unscheduled field errors for a block', async () => {
        const user = userEvent.setup();
        const serverErrors = {
            unscheduled: [
                {
                    name: ['Name error'],
                    duration: ['Duration error'],
                    daily: ['Daily error'],
                    frequency: ['Frequency error'],
                    start_time_preference: ['Preference error'],
                    location: ['Location error'],
                    block_type: ['Type error']
                }
            ]
        };

        renderGeneratorForm({ serverErrors });

        expect(screen.getByText('Name error')).toBeInTheDocument();
        expect(screen.getByText('Duration error')).toBeInTheDocument();
        expect(screen.getByText('Daily error')).toBeInTheDocument();
        expect(screen.getByText('Frequency error')).toBeInTheDocument();
        expect(screen.getByText('Preference error')).toBeInTheDocument();
        expect(screen.getByText('Location error')).toBeInTheDocument();
        expect(screen.getByText('Type error')).toBeInTheDocument();

        await user.click(screen.getByLabelText(/daily/i));
        expect(
            screen.getByPlaceholderText(/frequency \(times per week\)/i)
        ).toBeDisabled();
    });

    it('renders general and date-level server errors', () => {
        {
            const serverErrors = {
                general: ['Something went wrong'],
                week_start: ['Week start is required']
            };

            renderGeneratorForm({ serverErrors });

            expect(
                screen.getByText('Something went wrong')
            ).toBeInTheDocument();
            expect(
                screen.getByText('Week start is required')
            ).toBeInTheDocument();
        }
    });
});
