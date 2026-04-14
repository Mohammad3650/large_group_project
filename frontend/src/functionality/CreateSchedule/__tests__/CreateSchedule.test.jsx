import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import CreateSchedule from '../CreateSchedule.jsx';

const mockHandleCreate = vi.fn();
const mockSetCreateErrors = vi.fn();
const mockHandleGenerate = vi.fn();
const mockSetGenerateErrors = vi.fn();

const mockTimeBlockForm = vi.fn();
const mockGeneratorForm = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn()
    };
});

vi.mock('../../../utils/Hooks/useCreateTimeBlock.js', () => ({
    useCreateTimeBlock: () => ({
        handleCreate: mockHandleCreate,
        loading: false,
        serverErrors: [],
        setServerErrors: mockSetCreateErrors
    })
}));

vi.mock('../../../utils/Hooks/useGenerateSchedule.js', () => ({
    useGenerateSchedule: () => ({
        handleGenerate: mockHandleGenerate,
        loading: false,
        serverErrors: {},
        setServerErrors: mockSetGenerateErrors
    })
}));

vi.mock('../../../components/TimeBlockForm.jsx', () => ({
    default: (props) => {
        mockTimeBlockForm(props);
        return (
            <div>
                <p>Mock TimeBlockForm</p>
                <button onClick={props.clearErrors}>Clear TimeBlock Errors</button>
            </div>
        );
    }
}));

vi.mock('../GeneratorForm.jsx', () => ({
    default: (props) => {
        mockGeneratorForm(props);
        return (
            <div>
                <p>Mock GeneratorForm</p>
                <button onClick={props.clearErrors}>Clear Generator Errors</button>
            </div>
        );
    }
}));

function renderComponent() {
    const user = userEvent.setup();

    render(
        <MemoryRouter>
            <CreateSchedule />
        </MemoryRouter>
    );

    return { user };
}

describe('Tests for CreateSchedule', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the page heading and default time block tab', () => {
        renderComponent();

        expect(
            screen.getByRole('heading', { name: /create schedule/i })
        ).toBeInTheDocument();

        expect(screen.getByText('Mock TimeBlockForm')).toBeInTheDocument();
        expect(screen.queryByText('Mock GeneratorForm')).not.toBeInTheDocument();
    });

    it('passes the correct props to TimeBlockForm', () => {
        renderComponent();

        expect(mockTimeBlockForm).toHaveBeenCalledWith(
            expect.objectContaining({
                onSubmit: mockHandleCreate,
                loading: false,
                serverErrors: []
            })
        );
    });

    it('switches to the generate tab when clicked', async () => {
        const { user } = renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));

        expect(screen.getByText('Mock GeneratorForm')).toBeInTheDocument();
        expect(screen.queryByText('Mock TimeBlockForm')).not.toBeInTheDocument();
    });

    it('passes the correct props to GeneratorForm', async () => {
        const { user } = renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));

        expect(mockGeneratorForm).toHaveBeenCalledWith(
            expect.objectContaining({
                onSubmit: mockHandleGenerate,
                loading: false,
                serverErrors: {}
            })
        );
    });

    it('switches back to the task tab when clicked', async () => {
        const { user } = renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));
        await user.click(screen.getByRole('button', { name: /task/i }));

        expect(screen.getByText('Mock TimeBlockForm')).toBeInTheDocument();
        expect(screen.queryByText('Mock GeneratorForm')).not.toBeInTheDocument();
    });

    it('clears create errors with an empty array', async () => {
        const { user } = renderComponent();

        await user.click(screen.getByRole('button', { name: /clear timeblock errors/i }));

        expect(mockSetCreateErrors).toHaveBeenCalledWith([]);
    });

    it('clears generate errors with an empty object', async () => {
        const { user } = renderComponent();

        await user.click(screen.getByRole('button', { name: /generate/i }));
        await user.click(screen.getByRole('button', { name: /clear generator errors/i }));

        expect(mockSetGenerateErrors).toHaveBeenCalledWith({});
    });

    it('applies the active class to the selected tab', async () => {
        const { user } = renderComponent();

        const taskTab = screen.getByRole('button', { name: /task/i });
        const generateTab = screen.getByRole('button', { name: /generate/i });

        expect(taskTab.className).toMatch(/tab-btn--active/);
        expect(generateTab.className).not.toMatch(/tab-btn--active/);

        await user.click(generateTab);

        expect(generateTab.className).toMatch(/tab-btn--active/);
        expect(taskTab.className).not.toMatch(/tab-btn--active/);
    });
});