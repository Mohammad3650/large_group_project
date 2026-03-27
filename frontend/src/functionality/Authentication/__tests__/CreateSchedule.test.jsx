import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CreateSchedule from '../CreateSchedule.jsx';
import { api } from '../../../api.js';
import generateSchedule from '../../../utils/generateSchedule.js';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

vi.mock('../../../api.js', () => ({
    api: {
        post: vi.fn()
    }
}));

vi.mock('../../../utils/generateSchedule.js', () => ({
    default: vi.fn()
}));

vi.mock('../../../components/TimeBlockForm.jsx', () => ({
    default: ({ onSubmit, loading, clearErrors }) => (
        <div>
            <p>Mock TimeBlockForm</p>
            <button
                type="button"
                onClick={() =>
                    onSubmit([
                        {
                            date: '2026-04-10',
                            name: 'Study Session',
                            location: 'Library',
                            description: 'Revision',
                            block_type: 'study',
                            start_time: '09:00',
                            end_time: '10:00'
                        }
                    ])
                }
            >
                Submit TimeBlockForm
            </button>
            <button type="button" onClick={clearErrors}>
                Clear TimeBlock Errors
            </button>
            {loading && <span>TimeBlock Loading</span>}
        </div>
    )
}));

vi.mock('../../../components/GeneratorForm.jsx', () => ({
    default: ({ onSubmit, loading, clearErrors, serverErrors }) => (
        <div>
            <p>Mock GeneratorForm</p>
            <button
                type="button"
                onClick={() =>
                    onSubmit({
                        week_start: '2026-04-10',
                        week_end: '2026-04-16',
                        even_spread: true,
                        include_scheduled: false,
                        windows: [
                            {
                                start_min: '08:00',
                                end_min: '22:00',
                                daily: true
                            }
                        ],
                        unscheduled: []
                    })
                }
            >
                Submit GeneratorForm
            </button>
            <button type="button" onClick={clearErrors}>
                Clear Generator Errors
            </button>
            {loading && <span>Generator Loading</span>}
            {serverErrors?.general?.[0] && <p>{serverErrors.general[0]}</p>}
        </div>
    )
}));

describe('CreateSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
    });

    function renderComponent() {
        return render(
            <MemoryRouter>
                <CreateSchedule />
            </MemoryRouter>
        );
    }

    it('renders the page heading and default time block tab', () => {
        renderComponent();

        expect(
            screen.getByRole('heading', { name: /create schedule/i })
        ).toBeInTheDocument();
        expect(screen.getByText('Mock TimeBlockForm')).toBeInTheDocument();
        expect(screen.queryByText('Mock GeneratorForm')).not.toBeInTheDocument();
    });

    it('switches to the generate tab when clicked', async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));

        expect(screen.getByText('Mock GeneratorForm')).toBeInTheDocument();
        expect(screen.queryByText('Mock TimeBlockForm')).not.toBeInTheDocument();
    });

    it('creates a time block and navigates on success', async () => {
        const user = userEvent.setup();

        api.post.mockResolvedValue({
            data: {
                id: 123
            }
        });

        renderComponent();

        await user.click(
            screen.getByRole('button', { name: /submit timeblockform/i })
        );

        expect(api.post).toHaveBeenCalledWith('/api/time-blocks/', {
            date: '2026-04-10',
            name: 'Study Session',
            location: 'Library',
            description: 'Revision',
            block_type: 'study',
            start_time: '09:00',
            end_time: '10:00'
        });

        expect(mockNavigate).toHaveBeenCalledWith('/successful-timeblock', {
            state: { id: 123 }
        });
    });

    it('stores server errors when time block creation fails', async () => {
        const user = userEvent.setup();

        api.post.mockRejectedValue({
            response: {
                data: {
                    name: ['This field is required.']
                }
            }
        });

        renderComponent();

        await user.click(
            screen.getByRole('button', { name: /submit timeblockform/i })
        );

        expect(api.post).toHaveBeenCalledTimes(1);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('generates a schedule, stores it in sessionStorage, and navigates to preview', async () => {
        const user = userEvent.setup();

        generateSchedule.mockResolvedValue({
            data: {
                events: [
                    {
                        id: 1,
                        title: 'Generated Event'
                    }
                ]
            }
        });

        renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));
        await user.click(
            screen.getByRole('button', { name: /submit generatorform/i })
        );

        expect(generateSchedule).toHaveBeenCalledWith({
            week_start: '2026-04-10',
            week_end: '2026-04-16',
            even_spread: true,
            include_scheduled: false,
            windows: [
                {
                    start_min: '08:00',
                    end_min: '22:00',
                    daily: true
                }
            ],
            unscheduled: []
        });

        expect(
            JSON.parse(sessionStorage.getItem('generatedSchedule'))
        ).toEqual({
            events: [
                {
                    id: 1,
                    title: 'Generated Event'
                }
            ]
        });

        expect(mockNavigate).toHaveBeenCalledWith('/preview-calendar');
    });

    it('shows an error when no feasible generated schedule is returned', async () => {
        const user = userEvent.setup();

        generateSchedule.mockResolvedValue({
            data: {
                events: []
            }
        });

        renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));
        await user.click(
            screen.getByRole('button', { name: /submit generatorform/i })
        );

        expect(
            await screen.findByText(
                /no feasible schedule could be generated with the given constraints/i
            )
        ).toBeInTheDocument();

        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('shows backend errors when schedule generation fails', async () => {
        const user = userEvent.setup();

        generateSchedule.mockRejectedValue({
            response: {
                data: {
                    general: ['Generation failed.']
                }
            }
        });

        renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));
        await user.click(
            screen.getByRole('button', { name: /submit generatorform/i })
        );

        expect(await screen.findByText('Generation failed.')).toBeInTheDocument();
    });

    it('does not submit create requests again while loading', async () => {
        const user = userEvent.setup();

        let resolveRequest;
        api.post.mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveRequest = resolve;
                })
        );

        renderComponent();

        await user.click(
            screen.getByRole('button', { name: /submit timeblockform/i })
        );
        await user.click(
            screen.getByRole('button', { name: /submit timeblockform/i })
        );

        expect(api.post).toHaveBeenCalledTimes(1);

        resolveRequest({ data: { id: 1 } });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalled();
        });
    });
});