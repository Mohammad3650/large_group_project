import { describe, it, expect } from 'vitest';
import isClickOutside from '../Helpers/isClickOutside.js';

describe('isClickOutside', () => {
    it('returns false when ref.current is null', () => {
        const ref = { current: null };
        const event = { target: document.createElement('div') };
        expect(isClickOutside(ref, event)).toBe(false);
    });

    it('returns false when the event target is the referenced element itself', () => {
        const element = document.createElement('div');
        const ref = { current: element };
        const event = { target: element };
        expect(isClickOutside(ref, event)).toBe(false);
    });

    it('returns false when the event target is a child of the referenced element', () => {
        const parent = document.createElement('div');
        const child = document.createElement('span');
        parent.appendChild(child);
        const ref = { current: parent };
        const event = { target: child };
        expect(isClickOutside(ref, event)).toBe(false);
    });

    it('returns true when the event target is outside the referenced element', () => {
        const element = document.createElement('div');
        const outside = document.createElement('div');
        const ref = { current: element };
        const event = { target: outside };
        expect(isClickOutside(ref, event)).toBe(true);
    });
});
