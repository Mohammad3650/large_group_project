import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import GeneratorFormItem from '../GeneratorFormItem.jsx';

const defaultBlock = {
    name: 'Study Session',
    duration: 90,
    daily: false,
    frequency: 2,
    start_time_preference: 'None',
    location: 'Library',
    block_type: 'study',
    description: 'Review chapters 1-3'
};

const renderGeneratorFormItem = (overrides = {}) => {
    const props = {
        block: defaultBlock,
        index: 0,
        serverErrors: {},
        updateBlock: vi.fn(),
        deleteBlock: vi.fn(),
        blocksLength: 1,
        ...overrides
    };

    return {
        ...render(<GeneratorFormItem {...props} />),
        props
    };
};

describe('GeneratorFormItem', () => {
    it('renders the block fields with default values', () => {
        renderGeneratorFormItem();

        expect(screen.getByPlaceholderText(/name/i)).toHaveValue('Study Session');
        expect(screen.getByPlaceholderText(/duration \(minutes\)/i)).toHaveValue(90);
        expect(screen.getByLabelText(/daily/i)).not.toBeChecked();
        expect(screen.getByPlaceholderText(/frequency \(times per week\)/i)).toHaveValue(2);
        expect(screen.getByDisplayValue('None')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/location/i)).toHaveValue('Library');
        expect(screen.getByRole('option', { name: /study/i }).selected).toBe(true);
        expect(screen.getByPlaceholderText(/description \(optional\)/i)).toHaveValue(
            'Review chapters 1-3'
        );
    });

    it('calls updateBlock when inputs change', () => {
        const mockUpdateBlock = vi.fn();
        renderGeneratorFormItem({ updateBlock: mockUpdateBlock });

        fireEvent.change(screen.getByPlaceholderText(/name/i), {
            target: { value: 'Math Review' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'name', 'Math Review');

        fireEvent.change(screen.getByPlaceholderText(/duration \(minutes\)/i), {
            target: { value: '120' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'duration', '120');

        fireEvent.click(screen.getByLabelText(/daily/i));
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'daily', true);

        fireEvent.change(screen.getByPlaceholderText(/frequency \(times per week\)/i), {
            target: { value: '5' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'frequency', '5');

        fireEvent.change(screen.getByDisplayValue('None'), {
            target: { value: 'Late' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'start_time_preference', 'Late');

        fireEvent.change(screen.getByPlaceholderText(/location/i), {
            target: { value: 'Home' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'location', 'Home');

        const [, blockTypeSelect] = screen.getAllByRole('combobox');
        fireEvent.change(blockTypeSelect, {
            target: { value: 'work' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'block_type', 'work');

        fireEvent.change(screen.getByPlaceholderText(/description \(optional\)/i), {
            target: { value: 'Updated description' }
        });
        expect(mockUpdateBlock).toHaveBeenCalledWith(0, 'description', 'Updated description');
    });

    it('renders the delete button only when there is more than one block', () => {
        const mockDeleteBlock = vi.fn();
        renderGeneratorFormItem({ deleteBlock: mockDeleteBlock, blocksLength: 2 });

        const deleteButton = screen.getByRole('button', { name: /delete event/i });
        expect(deleteButton).toBeInTheDocument();

        fireEvent.click(deleteButton);
        expect(mockDeleteBlock).toHaveBeenCalledWith(0);
    });

    it('does not render the delete button when there is only one block', () => {
        renderGeneratorFormItem({ blocksLength: 1 });
        expect(screen.queryByRole('button', { name: /delete event/i })).not.toBeInTheDocument();
    });

    it('displays server error messages for the block fields', () => {
        const serverErrors = {
            unscheduled: [
                {
                    name: ['Name error'],
                    duration: ['Duration error'],
                    daily: ['Daily error'],
                    frequency: ['Frequency error'],
                    start_time_preference: ['Start time error'],
                    location: ['Location error'],
                    block_type: ['Block type error']
                }
            ]
        };

        renderGeneratorFormItem({ serverErrors });

        expect(screen.getByText('Name error')).toBeInTheDocument();
        expect(screen.getByText('Duration error')).toBeInTheDocument();
        expect(screen.getByText('Daily error')).toBeInTheDocument();
        expect(screen.getByText('Frequency error')).toBeInTheDocument();
        expect(screen.getByText('Start time error')).toBeInTheDocument();
        expect(screen.getByText('Location error')).toBeInTheDocument();
        expect(screen.getByText('Block type error')).toBeInTheDocument();
    });
});
