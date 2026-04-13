import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Landing from '../Landing';

vi.mock('../stylesheets/Landing.css', () => ({}));
vi.mock('../Hero/Hero.jsx', () => ({
    default: () => <div>Mock Hero</div>
}));
vi.mock('../Features', () => ({
    default: () => <div>Mock Features</div>
}));
vi.mock('../Card', () => ({
    default: ({ avatar, name, stars, review }) => (
        <div data-testid="mock-card">
            <span>{avatar}</span>
            <span>{name}</span>
            <span>{stars}</span>
            <span>{review}</span>
        </div>
    )
}));
vi.mock('../utils/Helpers/getTestimonials.js', () => ({
    default: vi.fn(),
}));

import * as getTestimonialsModule from '../utils/Helpers/getTestimonials.js';

const mockTestimonials = [
    { avatar: 'OK', name: 'Omar Kassam', stars: '⭐⭐⭐⭐⭐', review: 'Review 1' },
    { avatar: 'IA', name: 'Ijaj Ahmed', stars: '⭐⭐⭐⭐⭐', review: 'Review 2' },
    { avatar: 'HK', name: 'Hamza Khan', stars: '⭐⭐⭐⭐⭐', review: 'Review 3' },
    { avatar: 'MI', name: 'Mohammed Islam', stars: '⭐⭐⭐⭐⭐', review: 'Review 4' },
    { avatar: 'AS', name: 'Abdulrahman Sharif', stars: '⭐⭐⭐⭐', review: 'Review 5' },
    { avatar: 'NA', name: 'Nabil Ahmed', stars: '⭐⭐⭐⭐⭐', review: 'Review 6' },
];

describe('Landing component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        getTestimonialsModule.default.mockReturnValue(mockTestimonials);
    });

    it('renders the hero and features components', () => {
        render(<Landing theme="light" />);
        expect(screen.getByText('Mock Hero')).toBeInTheDocument();
        expect(screen.getByText('Mock Features')).toBeInTheDocument();
    });

    it('renders the testimonials section heading', () => {
        render(<Landing theme="light" />);
        expect(screen.getByText('Student Testimonials')).toBeInTheDocument();
    });

    it('renders a card for each testimonial', () => {
        render(<Landing theme="light" />);
        expect(screen.getAllByTestId('mock-card')).toHaveLength(6);
    });

    it('passes the correct props to each card', () => {
        render(<Landing theme="light" />);
        expect(screen.getByText('Omar Kassam')).toBeInTheDocument();
        expect(screen.getByText('OK')).toBeInTheDocument();
        expect(screen.getByText('Review 1')).toBeInTheDocument();
        expect(screen.getByText('Nabil Ahmed')).toBeInTheDocument();
        expect(screen.getByText('NA')).toBeInTheDocument();
        expect(screen.getByText('Review 6')).toBeInTheDocument();
    });

    it('renders the correct layout structure', () => {
        const { container } = render(<Landing theme="light" />);
        expect(container.querySelector('.landing')).toBeInTheDocument();
        expect(container.querySelector('.landing-testimonials-wrapper')).toBeInTheDocument();
        expect(container.querySelector('.landing-testimonials')).toBeInTheDocument();
        expect(container.querySelector('.testimonials-grid')).toBeInTheDocument();
    });

    it('calls getTestimonials once', () => {
        render(<Landing theme="light" />);
        expect(getTestimonialsModule.default).toHaveBeenCalledTimes(1);
    });
});