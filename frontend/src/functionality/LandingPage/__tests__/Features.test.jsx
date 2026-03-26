import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Features from '../Features';

describe('Features', () => {
    it('renders the header and description', () => {
        render(<Features />);

        expect(screen.getByText('Why StudySync?')).toBeInTheDocument();

        expect(
            screen.getByText(
                /StudySync is designed to help university students manage their time/i
            )
        ).toBeInTheDocument();
    });

    it('renders all feature cards with titles', () => {
        render(<Features />);

        expect(
            screen.getByText('Constraint-Aware Weekly Calendar')
        ).toBeInTheDocument();
        expect(screen.getByText('Set-Up Preferences')).toBeInTheDocument();
        expect(
            screen.getByText('Balanced Study Allocation')
        ).toBeInTheDocument();
        expect(screen.getByText('One-Click Replanning')).toBeInTheDocument();
        expect(screen.getByText('Plan History by Week')).toBeInTheDocument();
    });

    it('renders all feature descriptions', () => {
        render(<Features />);

        expect(
            screen.getByText(/Generates a realistic weekly timetable/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Add your sleep window, commute time, and max study hours/i
            )
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Distributes study sessions across the week/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(/Changed your timetable or added a shift/i)
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                /Keep track of how your week-to-week schedule evolves/i
            )
        ).toBeInTheDocument();
    });

    it('renders all feature images with alt text', () => {
        render(<Features />);

        expect(
            screen.getByAltText('Weekly calendar illustration')
        ).toBeInTheDocument();
        expect(
            screen.getByAltText('Preferences settings illustration')
        ).toBeInTheDocument();
        expect(
            screen.getByAltText('Balanced Study illustration')
        ).toBeInTheDocument();
        expect(
            screen.getByAltText('Checklist replanning illustration')
        ).toBeInTheDocument();
        expect(
            screen.getByAltText('Timeline history illustration')
        ).toBeInTheDocument();
    });

    it('applies main container classes', () => {
        const { container } = render(<Features />);

        expect(container.querySelector('.features')).toBeInTheDocument();
        expect(
            container.querySelector('.features-container')
        ).toBeInTheDocument();
        expect(container.querySelector('.features-header')).toBeInTheDocument();
        expect(container.querySelector('.features-grid')).toBeInTheDocument();
    });
});
