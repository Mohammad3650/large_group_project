import { describe, it, expect } from 'vitest';
import getHeroButtons from '../../../utils/Helpers/getHeroButtons.js';

describe('getHeroButtons', () => {
    it('returns dashboard and calendar buttons when logged in', () => {
        const buttons = getHeroButtons(true);
        expect(buttons).toHaveLength(2);
        expect(buttons[0].label).toBe('Dashboard');
        expect(buttons[0].path).toBe('/dashboard');
        expect(buttons[0].style).toBe('black');
        expect(buttons[1].label).toBe('Calendar');
        expect(buttons[1].path).toBe('/calendar');
        expect(buttons[1].style).toBe('white');
    });

    it('returns sign up and login buttons when not logged in', () => {
        const buttons = getHeroButtons(false);
        expect(buttons).toHaveLength(2);
        expect(buttons[0].label).toBe('Sign Up');
        expect(buttons[0].path).toBe('/signup');
        expect(buttons[0].style).toBe('black');
        expect(buttons[1].label).toBe('Login');
        expect(buttons[1].path).toBe('/login');
        expect(buttons[1].style).toBe('white');
    });
});