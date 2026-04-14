import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TimeBlockItem from '../TimeBlockItem';
import { BLOCK_TYPES } from '../../../constants/blockTypes';

const mockBlock = {
    name: 'Study Session',
    location: 'Library',
    block_type: BLOCK_TYPES[0],
    start_time: '09:00',
    end_time: '11:00',
    description: 'Revise Java'
};

function createProps(overrides = {}) {
    return {
        block: mockBlock,
        index: 0,
        serverErrors: [],
        updateBlock: vi.fn(),
        deleteBlock: vi.fn(),
        blocksLength: 1,
        ...overrides
    };
}

function renderTimeBlockItem(overrides = {}) {
    const props = createProps(overrides);
    render(<TimeBlockItem {...props} />);
    return props;
}

function changeField(element, value) {
    fireEvent.change(element, {
        target: { value }
    });
}

function expectUpdateCalled(updateBlock, field, value) {
    expect(updateBlock).toHaveBeenCalledWith(0, field, value);
}

function getTimeInputs() {
    return screen.getAllByDisplayValue(/^\d{2}:\d{2}$/);
}

describe('TimeBlockItem', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all form fields with block values', () => {
        renderTimeBlockItem();

        expect(screen.getByPlaceholderText('Name')).toHaveValue('Study Session');
        expect(screen.getByPlaceholderText('Location')).toHaveValue('Library');
        expect(
            screen.getByDisplayValue(
                BLOCK_TYPES[0].charAt(0).toUpperCase() + BLOCK_TYPES[0].slice(1)
            )
        ).toBeInTheDocument();
        expect(screen.getByDisplayValue('09:00')).toBeInTheDocument();
        expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Description (optional)')).toHaveValue('Revise Java');
    });

    it('calls updateBlock when name changes', () => {
        const { updateBlock } = renderTimeBlockItem();

        changeField(screen.getByPlaceholderText('Name'), 'New Name');

        expectUpdateCalled(updateBlock, 'name', 'New Name');
    });

    it('calls updateBlock when location changes', () => {
        const { updateBlock } = renderTimeBlockItem();

        changeField(screen.getByPlaceholderText('Location'), 'New Location');

        expectUpdateCalled(updateBlock, 'location', 'New Location');
    });

    it('calls updateBlock when block type changes', () => {
        const { updateBlock } = renderTimeBlockItem();

        changeField(screen.getByRole('combobox'), BLOCK_TYPES[1]);

        expectUpdateCalled(updateBlock, 'block_type', BLOCK_TYPES[1]);
    });

    it('calls updateBlock when start time changes', () => {
        const { updateBlock } = renderTimeBlockItem();
        const timeInputs = getTimeInputs();

        changeField(timeInputs[0], '10:00');

        expectUpdateCalled(updateBlock, 'start_time', '10:00');
    });

    it('calls updateBlock when end time changes', () => {
        const { updateBlock } = renderTimeBlockItem();
        const timeInputs = getTimeInputs();

        changeField(timeInputs[1], '12:00');

        expectUpdateCalled(updateBlock, 'end_time', '12:00');
    });

    it('calls updateBlock when description changes', () => {
        const { updateBlock } = renderTimeBlockItem();

        changeField(
            screen.getByPlaceholderText('Description (optional)'),
            'Updated description'
        );

        expectUpdateCalled(updateBlock, 'description', 'Updated description');
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

        renderTimeBlockItem({ serverErrors });

        expect(screen.getByText('Name is required')).toBeInTheDocument();
        expect(screen.getByText('Location is required')).toBeInTheDocument();
        expect(screen.getByText('Start time is required')).toBeInTheDocument();
        expect(screen.getByText('End time is required')).toBeInTheDocument();
    });

    it('does not render delete button when there is only one block', () => {
        renderTimeBlockItem({ blocksLength: 1 });

        expect(
            screen.queryByRole('button', { name: /delete event/i })
        ).not.toBeInTheDocument();
    });

    it('renders delete button when there is more than one block', () => {
        renderTimeBlockItem({ blocksLength: 2 });

        expect(
            screen.getByRole('button', { name: /delete event/i })
        ).toBeInTheDocument();
    });

    it('calls deleteBlock when delete button is clicked', () => {
        const { deleteBlock } = renderTimeBlockItem({ blocksLength: 2 });

        fireEvent.click(screen.getByRole('button', { name: /delete event/i }));

        expect(deleteBlock).toHaveBeenCalledWith(0);
    });
});