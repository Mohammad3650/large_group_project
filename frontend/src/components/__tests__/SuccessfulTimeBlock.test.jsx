import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock api.js to prevent it from executing its top-level localStorage.getItem call on module load
vi.mock('../../api.js', () => ({
    default: {}
}));

import SuccessfulTimeBlock from '../SuccessfulTimeBlock.jsx';

function renderSuccessfulTimeBlock({
    initialEntries = ['/success'],
    extraRoutes = []
} = {}) {
    render(
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/success" element={<SuccessfulTimeBlock />} />
                <Route
                    path="/successful-time-block"
                    element={<SuccessfulTimeBlock />}
                />
                {extraRoutes}
            </Routes>
        </MemoryRouter>
    );
}

function getButton(name) {
    return screen.getByRole('button', { name });
}

function clickButton(name) {
    fireEvent.click(getButton(name));
}

describe('Tests for SuccessfulTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the text to show a time block has been created successfully', () => {
        renderSuccessfulTimeBlock({
            initialEntries: ['/success']
        });

        expect(
            screen.getByText('Time Block Created Successfully')
        ).toBeInTheDocument();

        expect(
            screen.getByText(/your time block was created successfully\./i)
        ).toBeInTheDocument();
    });

    it('renders the buttons for when a time block has been created successfully', () => {
        renderSuccessfulTimeBlock({
            initialEntries: [{ pathname: '/success', state: { id: 123 } }]
        });

        expect(getButton(/new task/i)).toBeInTheDocument();
        expect(getButton(/edit task/i)).toBeInTheDocument();
        expect(getButton(/return to dashboard/i)).toBeInTheDocument();
        expect(getButton(/view in calendar/i)).toBeInTheDocument();
    });

    it('tick image loads up on the screen', () => {
        renderSuccessfulTimeBlock({
            initialEntries: ['/success']
        });

        expect(
            screen.getByRole('img', { name: /success tick icon/i })
        ).toBeInTheDocument();
    });

    it('New Task button takes the user to the create time block page', () => {
        renderSuccessfulTimeBlock({
            initialEntries: ['/successful-time-block'],
            extraRoutes: [
                <Route
                    key="create-schedule"
                    path="/create-schedule"
                    element={<h2>Create Task</h2>}
                />
            ]
        });

        clickButton(/new task/i);

        expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    it('return to dashboard navigates to /dashboard', () => {
        renderSuccessfulTimeBlock({
            initialEntries: ['/success'],
            extraRoutes: [
                <Route
                    key="dashboard"
                    path="/dashboard"
                    element={
                        <p>
                            🎉 Congrats, you have no tasks for the next
                            week!
                        </p>
                    }
                />
            ]
        });

        clickButton(/return to dashboard/i);

        expect(
            screen.getByText(
                '🎉 Congrats, you have no tasks for the next week!'
            )
        ).toBeInTheDocument();
    });

    it('does not render the Edit Task button when blockId is missing', () => {
        renderSuccessfulTimeBlock({
            initialEntries: ['/success']
        });

        expect(
            screen.queryByRole('button', { name: /edit task/i })
        ).not.toBeInTheDocument();
    });

    it('Edit Task button navigates to the edit page when blockId exists', () => {
        renderSuccessfulTimeBlock({
            initialEntries: [{ pathname: '/success', state: { id: 123 } }],
            extraRoutes: [
                <Route
                    key="edit-time-block"
                    path="/time-blocks/123/edit"
                    element={<h2>Edit Time Block Page</h2>}
                />
            ]
        });

        clickButton(/edit task/i);

        expect(screen.getByText('Edit Time Block Page')).toBeInTheDocument();
    });

    it('view in Calendar button navigates to the calendar page', () => {
        renderSuccessfulTimeBlock({
            initialEntries: ['/success'],
            extraRoutes: [
                <Route
                    key="calendar"
                    path="/calendar"
                    element={<h2>Calendar Page</h2>}
                />
            ]
        });

        clickButton(/view in calendar/i);

        expect(screen.getByText('Calendar Page')).toBeInTheDocument();
    });

    it('renders updated text when action is edited', () => {
        renderSuccessfulTimeBlock({
            initialEntries: [
                { pathname: '/success', state: { id: 123, action: 'edited' } }
            ]
        });

        expect(
            screen.getByText('Time Block Updated Successfully')
        ).toBeInTheDocument();

        expect(
            screen.getByText(/your time block was updated successfully\./i)
        ).toBeInTheDocument();
    });
});