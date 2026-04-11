import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TimeBlockItem from '../TimeBlockItem';
import { BLOCK_TYPES } from '../../constants/blockTypes';

describe('TimeBlockItem', () => {
    const mockBlock = {
        name: 'Study Session',
        location: 'Library',
        block_type: BLOCK_TYPES[0],
        start_time: '09:00',
        end_time: '11:00',
        description: 'Revise Java'
    };

    const defaultProps = {
        block: mockBlock,
        index: 0,
        serverErrors: [],
        updateBlock: vi.fn(),
        deleteBlock: vi.fn(),
        blocksLength: 1
    };

    it('renders all form fields with block values', () => {
        render(<TimeBlockItem {...defaultProps} />);

        expect(screen.getByPlaceholderText('Name')).toHaveValue('Study Session');
        expect(screen.getByPlaceholderText('Location')).toHaveValue('Library');
        expect(screen.getByDisplayValue(BLOCK_TYPES[0].charAt(0).toUpperCase() + BLOCK_TYPES[0].slice(1))).toBeInTheDocument();
        expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
        expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Description (optional)')).toHaveValue('Revise Java');
    });

    it('calls updateBlock when name changes', () => {
        const updateBlock = vi.fn();
        render(<TimeBlockItem {...defaultProps} updateBlock={updateBlock} />);

        fireEvent.change(screen.getByPlaceholderText('Name'), {
            target: { value: 'New Name' }
        });

        expect(updateBlock).toHaveBeenCalledWith(0, 'name', 'New Name');
    });

    it('calls updateBlock when location changes', () => {
        const updateBlock = vi.fn();
        render(<TimeBlockItem {...defaultProps} updateBlock={updateBlock} />);

        fireEvent.change(screen.getByPlaceholderText('Location'), {
            target: { value: 'New Location' }
        });

        expect(updateBlock).toHaveBeenCalledWith(0, 'location', 'New Location');
    });

    it('calls updateBlock when block type changes', () => {
        const updateBlock = vi.fn();
        render(<TimeBlockItem {...defaultProps} updateBlock={updateBlock} />);

        fireEvent.change(screen.getByRole('combobox'), {
            target: { value: BLOCK_TYPES[1] }
        });

        expect(updateBlock).toHaveBeenCalledWith(0, 'block_type', BLOCK_TYPES[1]);
    });

    it('calls updateBlock when start time changes', () => {
        const updateBlock = vi.fn();
        render(<TimeBlockItem {...defaultProps} updateBlock={updateBlock} />);

        const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
        fireEvent.change(timeInputs[0], {
            target: { value: '10:00' }
        });

        expect(updateBlock).toHaveBeenCalledWith(0, 'start_time', '10:00');
    });

    it('calls updateBlock when end time changes', () => {
        const updateBlock = vi.fn();
        render(<TimeBlockItem {...defaultProps} updateBlock={updateBlock} />);

        const timeInputs = screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
        fireEvent.change(timeInputs[1], {
            target: { value: '12:00' }
        });

        expect(updateBlock).toHaveBeenCalledWith(0, 'end_time', '12:00');
    });

    it('calls updateBlock when description changes', () => {
        const updateBlock = vi.fn();
        render(<TimeBlockItem {...defaultProps} updateBlock={updateBlock} />);

        fireEvent.change(screen.getByPlaceholderText('Description (optional)'), {
            target: { value: 'Updated description' }
        });

        expect(updateBlock).toHaveBeenCalledWith(0, 'description', 'Updated description');
    });

    it('renders validation errors when present', () => {
        const serverErrors = [
            {
                name: ['Name is required'],
                location: ['Location is required'],
                start_time: ['Start time is required'],
                end_time: ['End time is required']
            }
        ];

        render(<TimeBlockItem {...defaultProps} serverErrors={serverErrors} />);

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Location is required')).toBeInTheDocument();
        expect(screen.getByText('Start time is required')).toBeInTheDocument();
        expect(screen.getByText('End time is required')).toBeInTheDocument();
    });

    it('does not render delete button when there is only one block', () => {
        render(<TimeBlockItem {...defaultProps} blocksLength={1} />);

        expect(screen.queryByRole('button', { name: /delete event/i })).not.toBeInTheDocument();
    });

    it('renders delete button when there is more than one block', () => {
        render(<TimeBlockItem {...defaultProps} blocksLength={2} />);

        expect(screen.getByRole('button', { name: /delete event/i })).toBeInTheDocument();
    });

    it('calls deleteBlock when delete button is clicked', () => {
        const deleteBlock = vi.fn();
        render(
            <TimeBlockItem
                {...defaultProps}
                deleteBlock={deleteBlock}
                blocksLength={2}
            />
        );

        fireEvent.click(screen.getByRole('button', { name: /delete event/i }));

        expect(deleteBlock).toHaveBeenCalledWith(0);
    });
});