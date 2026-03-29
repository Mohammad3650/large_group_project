import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CalendarPlaceholder from '../CalendarPlaceholder';

function renderCalendarPlaceholder() {
    return render(<CalendarPlaceholder />);
}

describe('Tests for CalendarPlaceholder', () => {
    it('renders the placeholder layout', () => {
        const { container } = renderCalendarPlaceholder();

        expect(container.querySelector('.calendardiv')).toBeInTheDocument();
        expect(container.querySelector('.title')).toBeInTheDocument();
    });

    it('renders the calendar title', () => {
        renderCalendarPlaceholder();

        expect(screen.getByText('Calendar')).toBeInTheDocument();
    });
});
