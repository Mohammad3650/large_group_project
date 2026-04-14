import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import EditTimeBlock from '../EditTimeBlock.jsx';

const mockUpdate = vi.fn();
const mockClearErrors = vi.fn();
const mockGoSuccess = vi.fn();
const mockGoCancel = vi.fn();
const mockFormProps = vi.fn();

let mockHookState = {};
let submitPayload = [{ id: 42 }];

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useParams: () => ({ id: '42' })
    };
});

vi.mock('../TimeBlockForm.jsx', () => ({
    default: (props) => {
        mockFormProps(props);

        return (
            <div>
                <p>Mock Form</p>
                <p>{props.initialData?.name}</p>

                <button onClick={() => props.onSubmit(submitPayload)}>
                    Submit
                </button>

                <button onClick={props.onCancel}>
                    Cancel
                </button>
            </div>
        );
    }
}));

vi.mock('../../utils/Hooks/useEditTimeBlock', () => ({
    default: () => mockHookState
}));

vi.mock('../../utils/Hooks/useEditTimeBlockNavigation', () => ({
    default: () => ({
        goSuccess: mockGoSuccess,
        goCancel: mockGoCancel
    })
}));

function renderComponent() {
    return render(
        <MemoryRouter>
            <EditTimeBlock />
        </MemoryRouter>
    );
}

describe('EditTimeBlock', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        submitPayload = [{ id: 42 }];

        mockHookState = {
            initialData: {
                id: 42,
                name: 'Lecture Block'
            },
            loading: false,
            serverErrors: [],
            update: mockUpdate,
            clearErrors: mockClearErrors
        };
    });

    it('renders loading state while data is being fetched', () => {
        mockHookState.loading = true;

        renderComponent();

        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('renders fetch error message when initial data is unavailable', () => {
        mockHookState.initialData = null;

        renderComponent();

        expect(
            screen.getByText(/unable to load this time block/i)
        ).toBeInTheDocument();
    });

    it('renders the edit form when initial data exists', () => {
        renderComponent();

        expect(screen.getByText(/edit task/i)).toBeInTheDocument();
        expect(screen.getByText(/lecture block/i)).toBeInTheDocument();
    });

    it('passes the correct props into TimeBlockForm', () => {
        renderComponent();

        expect(mockFormProps).toHaveBeenCalledWith(
            expect.objectContaining({
                initialData: mockHookState.initialData,
                loading: false,
                serverErrors: [],
                clearErrors: mockClearErrors
            })
        );
    });

    it('submits the first time block entry to update', async () => {
        mockUpdate.mockResolvedValue(true);

        renderComponent();

        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith({ id: 42 });
        });
    });

    it('navigates to success page after successful update', async () => {
        mockUpdate.mockResolvedValue(true);

        renderComponent();

        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(mockGoSuccess).toHaveBeenCalledTimes(1);
        });
    });

    it('does not navigate when update returns failure', async () => {
        mockUpdate.mockResolvedValue(false);

        renderComponent();

        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalled();
        });

        expect(mockGoSuccess).not.toHaveBeenCalled();
    });

    it('does not navigate when update throws an error', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockUpdate.mockRejectedValue(new Error('Network error'));

        renderComponent();

        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalled();
        });

        expect(mockGoSuccess).not.toHaveBeenCalled();

        errorSpy.mockRestore();
    });

    it('handles empty submit payload safely', async () => {
        submitPayload = [];
        mockUpdate.mockResolvedValue(false);

        renderComponent();

        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith(undefined);
        });

        expect(mockGoSuccess).not.toHaveBeenCalled();
    });

    it('handles malformed submit payload safely', async () => {
        submitPayload = [{ name: 'Invalid block' }];
        mockUpdate.mockResolvedValue(false);

        renderComponent();

        fireEvent.click(screen.getByText(/submit/i));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith({
                name: 'Invalid block'
            });
        });
    });

    it('clears server errors and cancels navigation', () => {
        renderComponent();

        fireEvent.click(screen.getByText(/cancel/i));

        expect(mockClearErrors).toHaveBeenCalledTimes(1);
        expect(mockGoCancel).toHaveBeenCalledTimes(1);
    });
});