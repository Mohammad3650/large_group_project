import { describe, it, expect } from 'vitest';
import { mapProfileFieldErrors } from '../../utils/profileErrorState.js';

describe('mapProfileFieldErrors', () => {
    it('maps array field errors to their first message', () => {
        const data = {
            first_name: ['First name is required.'],
            email: ['Enter a valid email address.']
        };

        const result = mapProfileFieldErrors(data);

        expect(result).toEqual({
            fieldErrors: {
                first_name: 'First name is required.',
                email: 'Enter a valid email address.'
            },
            global: []
        });
    });

    it('converts non-array values to strings', () => {
        const data = {
            phone_number: 'This field is required.',
            age: 18,
            active: false
        };

        const result = mapProfileFieldErrors(data);

        expect(result).toEqual({
            fieldErrors: {
                phone_number: 'This field is required.',
                age: '18',
                active: 'false'
            },
            global: []
        });
    });

    it('returns an empty error state when given an empty object', () => {
        const result = mapProfileFieldErrors({});

        expect(result).toEqual({
            fieldErrors: {},
            global: []
        });
    });

    it('uses only the first message when an array has multiple errors', () => {
        const data = {
            username: ['This field is required.', 'Must be at least 3 characters long.']
        };

        const result = mapProfileFieldErrors(data);

        expect(result).toEqual({
            fieldErrors: {
                username: 'This field is required.'
            },
            global: []
        });
    });

    it('converts object values to strings when the value is not an array', () => {
        const data = {
            profile: { message: 'Invalid profile data.' }
        };

        const result = mapProfileFieldErrors(data);

        expect(result).toEqual({
            fieldErrors: {
                profile: '[object Object]'
            },
            global: []
        });
    });
});