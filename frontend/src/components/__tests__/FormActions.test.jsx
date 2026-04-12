import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import FormActions from '../FormActions.jsx';

const buildProps = (overrides = {}) => ({
    initialData: null,
    onCancel: null,
    loading: false,
    addBlock: vi.fn(),
    ...overrides
});

const renderFormActions = (overrides = {}) => {
    const props = buildProps(overrides);
    const utils = render(<FormActions {...props} />);
    return { ...utils, props };
};


const makeInitialData = (overrides = {}) => ({
    id: 1,
    date: '2026-03-24',
    name: 'Meeting',
    location: 'Room 2',
    block_type: 'work',
    description: 'Code Review',
    start_time: '14:00',
    end_time: '15:00',
    ...overrides
});


describe('Tests for FormActions', () => {
    describe('Create mode (no initialData)', () => {
        it('shows the Add Another Event button', () => {
            renderFormActions();

            expect(
                screen.getByRole('button', { name: /add another event/i })
            ).toBeInTheDocument();
        });

        it('shows the Create Time Block submit button', () => {
            renderFormActions();

            expect(
                screen.getByRole('button', { name: /create time block/i })
            ).toBeInTheDocument();
        });

        it('does not show the Cancel button', () => {
            renderFormActions();

            expect(
                screen.queryByRole('button', { name: /cancel/i })
            ).not.toBeInTheDocument();
        });

        it('does not show the Edit Time Block button', () => {
            renderFormActions();

            expect(
                screen.queryByRole('button', { name: /edit time block/i })
            ).not.toBeInTheDocument();
        });

        it('calls addBlock when Add Another Event is clicked', () => {
            const addBlock = vi.fn();
            renderFormActions({ addBlock });

            fireEvent.click(
                screen.getByRole('button', { name: /add another event/i })
            );

            expect(addBlock).toHaveBeenCalledTimes(1);
        });

        it('submit button is enabled when not loading', () => {
            renderFormActions();

            expect(
                screen.getByRole('button', { name: /create time block/i })
            ).not.toBeDisabled();
        });

        it('shows Saving... and disables submit button when loading', () => {
            renderFormActions({ loading: true });

            const submitButton = screen.getByRole('button', { name: /saving/i });
            expect(submitButton).toBeDisabled();
        });

        it('hides Add Another Event button when loading', () => {
            renderFormActions({ loading: true });

            expect(
                screen.getByRole('button', { name: /add another event/i })
            ).toBeInTheDocument();
        });
    });

    describe('Edit mode (with initialData)', () => {
        it('shows the Edit Time Block submit button', () => {
            renderFormActions({ initialData: makeInitialData() });

            expect(
                screen.getByRole('button', { name: /edit time block/i })
            ).toBeInTheDocument();
        });

        it('does not show the Add Another Event button', () => {
            renderFormActions({ initialData: makeInitialData() });

            expect(
                screen.queryByRole('button', { name: /add another event/i })
            ).not.toBeInTheDocument();
        });

        it('does not show the Create Time Block button', () => {
            renderFormActions({ initialData: makeInitialData() });

            expect(
                screen.queryByRole('button', { name: /create time block/i })
            ).not.toBeInTheDocument();
        });

        it('shows the Cancel button when onCancel is provided', () => {
            renderFormActions({ initialData: makeInitialData(), onCancel: vi.fn() });

            expect(
                screen.getByRole('button', { name: /cancel/i })
            ).toBeInTheDocument();
        });

        it('does not show the Cancel button when onCancel is not provided', () => {
            renderFormActions({ initialData: makeInitialData(), onCancel: null });

            expect(
                screen.queryByRole('button', { name: /cancel/i })
            ).not.toBeInTheDocument();
        });

        it('calls onCancel when the Cancel button is clicked', () => {
            const onCancel = vi.fn();
            renderFormActions({ initialData: makeInitialData(), onCancel });

            fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

            expect(onCancel).toHaveBeenCalledTimes(1);
        });

        it('submit button is enabled when not loading', () => {
            renderFormActions({ initialData: makeInitialData() });

            expect(
                screen.getByRole('button', { name: /edit time block/i })
            ).not.toBeDisabled();
        });

        it('shows Saving... and disables submit and cancel buttons when loading', () => {
            renderFormActions({
                initialData: makeInitialData(),
                onCancel: vi.fn(),
                loading: true
            });

            const submitButton = screen.getByRole('button', { name: /saving/i });
            const cancelButton = screen.getByRole('button', { name: /cancel/i });

            expect(submitButton).toBeDisabled();
            expect(cancelButton).toBeDisabled();
        });
    });
});