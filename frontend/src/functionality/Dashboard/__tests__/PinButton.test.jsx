import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PinButton from '../PinButton';

vi.mock('../stylesheets/PinButton.css', () => ({}));
vi.mock('react-icons/lu', () => ({
    LuPin: () => <svg data-testid="pin-icon" />
}));

describe('PinButton component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the pin icon', () => {
        render(<PinButton pinned={false} />);
        expect(screen.getByTestId('pin-icon')).toBeInTheDocument();
    });

    it('does not apply the pinned class when pinned is false', () => {
        render(<PinButton pinned={false} />);
        expect(screen.getByRole('button')).not.toHaveClass('pinned');
    });

    it('applies the pinned class when pinned is true', () => {
        render(<PinButton pinned={true} />);
        expect(screen.getByRole('button')).toHaveClass('pinned');
    });

    it('calls onPin when clicked and pinned is false', () => {
        const onPin = vi.fn();
        render(<PinButton pinned={false} onPin={onPin} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onPin).toHaveBeenCalledTimes(1);
    });

    it('calls onUnpin when clicked and pinned is true', () => {
        const onUnpin = vi.fn();
        render(<PinButton pinned={true} onUnpin={onUnpin} />);
        fireEvent.click(screen.getByRole('button'));
        expect(onUnpin).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onPin is not provided and pinned is false', () => {
        render(<PinButton pinned={false} />);
        expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

    it('does not throw when onUnpin is not provided and pinned is true', () => {
        render(<PinButton pinned={true} />);
        expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow();
    });

    it('stops event propagation when clicked', () => {
        const parentHandler = vi.fn();
        render(
            <div onClick={parentHandler}>
                <PinButton pinned={false} onPin={vi.fn()} />
            </div>
        );
        fireEvent.click(screen.getByRole('button'));
        expect(parentHandler).not.toHaveBeenCalled();
    });
});