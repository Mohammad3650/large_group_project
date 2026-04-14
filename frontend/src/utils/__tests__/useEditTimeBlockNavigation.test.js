import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useEditTimeBlockNavigation from '../Hooks/useEditTimeBlockNavigation';
import { useNavigate } from 'react-router-dom';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');

    return {
        ...actual,
        useNavigate: vi.fn()
    };
});

describe('useEditTimeBlockNavigation', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
    });

    it('navigates to success page with correct state', () => {
        const { result } = renderHook(() =>
            useEditTimeBlockNavigation('42')
        );

        act(() => {
            result.current.goSuccess();
        });

        expect(mockNavigate).toHaveBeenCalledWith(
            '/successful-time-block',
            {
                state: {
                    id: '42',
                    action: 'edited'
                }
            }
        );
    });

    it('navigates to calendar on cancel', () => {
        const { result } = renderHook(() =>
            useEditTimeBlockNavigation('42')
        );

        act(() => {
            result.current.goCancel();
        });

        expect(mockNavigate).toHaveBeenCalledWith('/calendar');
    });
});