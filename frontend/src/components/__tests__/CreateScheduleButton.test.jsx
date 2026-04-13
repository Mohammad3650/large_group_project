import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import CreateScheduleButton from '../CreateScheduleButton.jsx';

describe('Tests for CreateScheduleButton', () => {
    it('navigates to /create-schedule when clicked', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<CreateScheduleButton />} />
                    <Route
                        path="/create-schedule"
                        element={<h2>Create Task</h2>}
                    />
                </Routes>
            </MemoryRouter>
        );

        const button = screen.getByRole('button', {
            name: /create schedule/i
        });

        fireEvent.click(button);

        expect(screen.getByText('Create Task')).toBeInTheDocument();
    });

    it('does not navigate before clicking the button', () => {
        render(
            <MemoryRouter initialEntries={['/']}>
                <Routes>
                    <Route path="/" element={<CreateScheduleButton />} />
                    <Route
                        path="/create-schedule"
                        element={<h2>Create Task</h2>}
                    />
                </Routes>
            </MemoryRouter>
        );
        expect(
            screen.queryByText('Create Task')
        ).not.toBeInTheDocument();
    });
});
