import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HeroImage from '../../Hero/HeroImage.jsx';

vi.mock('../../stylesheets/Hero/HeroImage.css', () => ({}));
vi.mock('../../../../assets/LandingPage/hero.png', () => ({ default: 'test-image.png' }));

describe('HeroImage', () => {
    it('renders the hero image with the correct src', () => {
        render(<HeroImage />);
        expect(screen.getByAltText('StudySync hero')).toHaveAttribute('src', 'test-image.png');
    });

    it('renders the hero image with the correct alt text', () => {
        render(<HeroImage />);
        expect(screen.getByAltText('StudySync hero')).toBeInTheDocument();
    });
});