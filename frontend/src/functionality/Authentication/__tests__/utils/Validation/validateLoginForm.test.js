import { describe, it, expect } from 'vitest';
import validateLoginForm from '../../../utils/Validation/validateLoginForm.js';

describe('validateLoginForm', () => {
    it('returns no errors when email and password are valid', () => {
        const result = validateLoginForm({
            email: 'user@example.com',
            password: 'Password123!'
        });

        expect(result).toEqual({});
    });

    it('returns an email error when email is empty', () => {
        const result = validateLoginForm({
            email: '',
            password: 'Password123!'
        });

        expect(result).toEqual({
            email: 'Email is required.'
        });
    });

    it('returns an email error when email contains only whitespace', () => {
        const result = validateLoginForm({
            email: '   ',
            password: 'Password123!'
        });

        expect(result).toEqual({
            email: 'Email is required.'
        });
    });

    it('returns a password error when password is empty', () => {
        const result = validateLoginForm({
            email: 'user@example.com',
            password: ''
        });

        expect(result).toEqual({
            password: 'Password is required.'
        });
    });

    it('returns both errors when email is blank and password is empty', () => {
        const result = validateLoginForm({
            email: '   ',
            password: ''
        });

        expect(result).toEqual({
            email: 'Email is required.',
            password: 'Password is required.'
        });
    });
});