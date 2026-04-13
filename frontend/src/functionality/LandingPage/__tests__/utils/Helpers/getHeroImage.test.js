import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../../assets/LandingPage/heropicture.png', () => ({ default: 'light-image.png' }));
vi.mock('../../../../../assets/LandingPage/heropicture_dark.png', () => ({ default: 'dark-image.png' }));

import getHeroImage from '../../../utils/Helpers/getHeroImage.js';

describe('getHeroImage', () => {
    it('returns the dark image when theme is dark', () => {
        expect(getHeroImage('dark')).toBe('dark-image.png');
    });

    it('returns the light image when theme is light', () => {
        expect(getHeroImage('light')).toBe('light-image.png');
    });

    it('returns the light image when theme is undefined', () => {
        expect(getHeroImage(undefined)).toBe('light-image.png');
    });
});