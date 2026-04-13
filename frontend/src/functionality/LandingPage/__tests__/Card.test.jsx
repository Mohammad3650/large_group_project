import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from '../Card';

function renderCard(overrides = {}) {
    const defaultProps = {
        avatar: 'A',
        stars: '★★★★★',
        review: 'This made planning much easier.',
        name: 'Mohammad',
    };

    return render(<Card {...defaultProps} {...overrides} />);
}

describe('Tests for Card', () => {
    it('renders the avatar, stars, review and name', () => {
        renderCard();

        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('★★★★★')).toBeInTheDocument();
        expect(screen.getByText('This made planning much easier.')).toBeInTheDocument();
        expect(screen.getByText('Mohammad')).toBeInTheDocument();
    });

    it('applies the correct class names to the main elements', () => {
        const { container } = renderCard({
            avatar: 'B',
            stars: '★★★★☆',
            review: 'Very clean and easy to use.',
            name: 'Aisha',
        });

        expect(container.querySelector('.testimonial-card')).toBeInTheDocument();
        expect(container.querySelector('.card-container')).toBeInTheDocument();
        expect(container.querySelector('.card-avatar')).toBeInTheDocument();
        expect(container.querySelector('.card-content')).toBeInTheDocument();
        expect(container.querySelector('.card-stars')).toBeInTheDocument();
        expect(container.querySelector('.card-text')).toBeInTheDocument();
        expect(container.querySelector('.card-title')).toBeInTheDocument();
    });

    it('renders the name inside italic text', () => {
        renderCard({
            avatar: 'C',
            stars: '★★★☆☆',
            review: 'Helpful overall.',
            name: 'Zaynab',
        });

        const nameText = screen.getByText('Zaynab');
        expect(nameText.tagName).toBe('I');
    });

    it('renders default empty values when no props are provided', () => {
        const { container } = render(<Card />);

        expect(container.querySelector('.card-avatar')).toHaveTextContent('');
        expect(container.querySelector('.card-stars')).toHaveTextContent('');
        expect(container.querySelector('.card-text')).toHaveTextContent('');
        expect(container.querySelector('.card-title')).toHaveTextContent('');
    });
});