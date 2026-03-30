import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToggleDarkMode from '../ToggleDarkMode';

describe('Tests for ToggleDarkMode', () => {
    test('renders Dark label when current theme is light', () => {
        render(<ToggleDarkMode theme="light" toggleTheme={vi.fn()} />);
        expect(
            screen.getByRole('button', { name: /dark/i })
        ).toBeInTheDocument();
    });

    test('renders Light label when current theme is dark', () => {
        render(<ToggleDarkMode theme="dark" toggleTheme={vi.fn()} />);
        expect(
            screen.getByRole('button', { name: /light/i })
        ).toBeInTheDocument();
    });

    test('calls toggleTheme when clicked', async () => {
        const user = userEvent.setup();
        const toggleTheme = vi.fn();

        render(<ToggleDarkMode theme="light" toggleTheme={toggleTheme} />);

        await user.click(screen.getByRole('button'));

        expect(toggleTheme).toHaveBeenCalledTimes(1);
    });
});
