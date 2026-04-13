import { describe, it, expect } from 'vitest';
import getTestimonials from '../../../utils/Helpers/getTestimonials.js';

describe('getTestimonials', () => {
    it('returns an array of six testimonials', () => {
        expect(getTestimonials()).toHaveLength(6);
    });

    it('returns testimonials with the correct shape', () => {
        const testimonials = getTestimonials();
        testimonials.forEach((testimonial) => {
            expect(testimonial).toHaveProperty('avatar');
            expect(testimonial).toHaveProperty('name');
            expect(testimonial).toHaveProperty('stars');
            expect(testimonial).toHaveProperty('review');
        });
    });

    it('returns the correct names', () => {
        const names = getTestimonials().map((testimonial) => testimonial.name);
        expect(names).toEqual([
            'Omar Kassam',
            'Ijaj Ahmed',
            'Hamza Khan',
            'Mohammed Islam',
            'Abdulrahman Sharif',
            'Nabil Ahmed',
        ]);
    });

    it('returns the correct avatars', () => {
        const avatars = getTestimonials().map((testimonial) => testimonial.avatar);
        expect(avatars).toEqual(['OK', 'IA', 'HK', 'MI', 'AS', 'NA']);
    });

    it('returns five five-star and one four-star rating', () => {
        const ratings = getTestimonials().map((testimonial) => testimonial.stars);
        expect(ratings.filter((rating) => rating === '⭐⭐⭐⭐⭐')).toHaveLength(5);
        expect(ratings.filter((rating) => rating === '⭐⭐⭐⭐')).toHaveLength(1);
    });

    it('returns a new array on each call', () => {
        expect(getTestimonials()).not.toBe(getTestimonials());
    });
});