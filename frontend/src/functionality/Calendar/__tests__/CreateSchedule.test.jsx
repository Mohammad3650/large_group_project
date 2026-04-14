import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CreateSchedule from '../CreateSchedule.jsx';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('../../../utils/Hooks/useCreateTimeBlock.js', () => ({
    useCreateTimeBlock: () => ({
        handleCreate: vi.fn(),
        loading: false,
        serverErrors: [],
        setServerErrors: vi.fn()
    })
}));

vi.mock('../../../utils/Hooks/useGenerateSchedule.js', () => ({
    useGenerateSchedule: () => ({
        handleGenerate: vi.fn(),
        loading: false,
        serverErrors: {},
        setServerErrors: vi.fn()
    })
}));

vi.mock('../../../components/TimeBlockForm.jsx', () => ({
    default: () => <p>Mock TimeBlockForm</p>
}));

vi.mock('../../../components/GeneratorForm.jsx', () => ({
    default: () => <p>Mock GeneratorForm</p>
}));

describe('Tests for CreateSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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

    it('switches back to the task tab when clicked', async () => {
        const user = userEvent.setup();
        renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));
        await user.click(screen.getByRole('button', { name: /task/i }));

        expect(screen.getByText('Mock TimeBlockForm')).toBeInTheDocument();
        expect(screen.queryByText('Mock GeneratorForm')).not.toBeInTheDocument();
    });
});