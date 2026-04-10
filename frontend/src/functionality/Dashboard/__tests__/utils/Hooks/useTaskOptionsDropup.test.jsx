import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useTaskOptionsDropup from '../../../utils/Hooks/useTaskOptionsDropup.js';

const wrapper = ({ children }) => <MemoryRouter>{children}</MemoryRouter>;

describe('useTaskOptionsDropup', () => {
    const setDropdownOpen = vi.fn();
    const onDelete = vi.fn();
    const onUndoComplete = vi.fn();
    const onViewDetails = vi.fn();
    const props = { id: 42, setDropdownOpen, onDelete, onUndoComplete, onViewDetails };
    const makeEvent = () => ({ stopPropagation: vi.fn() });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('exposes all four handler functions', () => {
        const { result } = renderHook(() => useTaskOptionsDropup(props), { wrapper });
        expect(typeof result.current.handleViewDetailsClick).toBe('function');
        expect(typeof result.current.handleEditClick).toBe('function');
        expect(typeof result.current.handleUndoCompleteClick).toBe('function');
        expect(typeof result.current.handleDeleteClick).toBe('function');
    });

    it('stops propagation, closes menu, and calls onViewDetails on handleViewDetailsClick', () => {
        const { result } = renderHook(() => useTaskOptionsDropup(props), { wrapper });
        const event = makeEvent();
        result.current.handleViewDetailsClick(event);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
        expect(onViewDetails).toHaveBeenCalledTimes(1);
    });

    it('stops propagation and closes menu on handleEditClick', () => {
        const { result } = renderHook(() => useTaskOptionsDropup(props), { wrapper });
        const event = makeEvent();
        result.current.handleEditClick(event);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
    });

    it('stops propagation, closes menu, and calls onUndoComplete on handleUndoCompleteClick', () => {
        const { result } = renderHook(() => useTaskOptionsDropup(props), { wrapper });
        const event = makeEvent();
        result.current.handleUndoCompleteClick(event);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
        expect(onUndoComplete).toHaveBeenCalledTimes(1);
    });

    it('calls onDelete and closes menu when handleDeleteClick is called and user confirms', () => {
        vi.stubGlobal('confirm', vi.fn(() => true));
        const { result } = renderHook(() => useTaskOptionsDropup(props), { wrapper });
        const event = makeEvent();
        result.current.handleDeleteClick(event);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
        expect(setDropdownOpen).toHaveBeenCalledWith(false);
        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('does not call onDelete or close menu when handleDeleteClick is called and user cancels', () => {
        vi.stubGlobal('confirm', vi.fn(() => false));
        const { result } = renderHook(() => useTaskOptionsDropup(props), { wrapper });
        const event = makeEvent();
        result.current.handleDeleteClick(event);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
        expect(setDropdownOpen).not.toHaveBeenCalled();
        expect(onDelete).not.toHaveBeenCalled();
    });
});
