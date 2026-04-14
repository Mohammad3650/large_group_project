import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Features from '../Features';

function renderFeatures() {
    return render(<Features />);
}

describe('Tests for Features', () => {
    it('renders the header and description', () => {
        renderFeatures();

        expect(screen.getByText('Why StudySync?')).toBeInTheDocument();
        expect(
            screen.getByText(
                /StudySync is an all-in-one academic planner built for university students/i
            )
        ).toBeInTheDocument();
    });

    it('renders all feature cards with titles', () => {
        renderFeatures();

        expect(screen.getByText('Constraint-Aware Weekly Calendar')).toBeInTheDocument();
        expect(screen.getByText('Export Your Schedule')).toBeInTheDocument();
        expect(screen.getByText('Balanced Study Allocation')).toBeInTheDocument();
        expect(screen.getByText('Smart Replanning')).toBeInTheDocument();
        expect(screen.getByText('Import Your University Timetable')).toBeInTheDocument();
    });

    it('renders all feature descriptions', () => {
        renderFeatures();

        expect(screen.getByText(/Generates a realistic weekly timetable/i)).toBeInTheDocument();
        expect(
            screen.getByText(
                /Download your generated schedule as a CSV file for use in spreadsheets, or as an ICS file/i
            )
        ).toBeInTheDocument();
        expect(screen.getByText(/Distributes study sessions across the week/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Updated your timetable or added a new commitment/i)
        ).toBeInTheDocument();
        expect(
            screen.getByText(
                /Subscribe to your university's ICS or webcal feed to automatically pull your lectures and classes into StudySync/i
            )
        ).toBeInTheDocument();
    });

    it('renders all feature images with alt text', () => {
        renderFeatures();

        expect(screen.getByAltText('Weekly calendar illustration')).toBeInTheDocument();
        expect(screen.getByAltText('Export schedule')).toBeInTheDocument();
        expect(screen.getByAltText('Balanced Study illustration')).toBeInTheDocument();
        expect(screen.getByAltText('Checklist replanning illustration')).toBeInTheDocument();
        expect(screen.getByAltText('Import a timetable')).toBeInTheDocument();
    });

    it('renders all five feature cards', () => {
        const { container } = renderFeatures();
        expect(container.querySelectorAll('.features-card')).toHaveLength(5);
    });

    it('applies main container classes', () => {
        const { container } = renderFeatures();

        expect(container.querySelector('.features')).toBeInTheDocument();
        expect(container.querySelector('.features-container')).toBeInTheDocument();
        expect(container.querySelector('.features-header')).toBeInTheDocument();
        expect(container.querySelector('.features-grid')).toBeInTheDocument();
    });
});
