import { describe, it, expect } from 'vitest';
import { validateSignupForm } from '../../../utils/Validation/validateSignupForm.js';

describe('validateSignupForm', () => {
    it('returns no errors when all fields are valid', () => {
        const result = validateSignupForm({
            email: 'user@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        });

        expect(result).toEqual({});
    });

    it('returns required field errors when all fields are missing', () => {
        const result = validateSignupForm({
            email: '',
            username: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
            password: '',
            confirmPassword: ''
        });

        expect(result).toEqual({
            email: 'Email is required.',
            username: 'Username is required.',
            first_name: 'First name is required.',
            last_name: 'Last name is required.',
            phone_number: 'Phone number is required.',
            password: 'Password is required.',
            confirmPassword: 'Please confirm your password.'
        });
    });

    it('treats whitespace-only strings as blank', () => {
        const result = validateSignupForm({
            email: '   ',
            username: '   ',
            firstName: '   ',
            lastName: '   ',
            phoneNumber: '   ',
            password: '   ',
            confirmPassword: '   '
        });

        expect(result).toEqual({
            email: 'Email is required.',
            username: 'Username is required.',
            first_name: 'First name is required.',
            last_name: 'Last name is required.',
            phone_number: 'Phone number is required.',
            password: 'Password is required.',
            confirmPassword: 'Please confirm your password.'
        });
    });

    it('returns required field errors for undefined values', () => {
        const result = validateSignupForm({
            email: undefined,
            username: undefined,
            firstName: undefined,
            lastName: undefined,
            phoneNumber: undefined,
            password: undefined,
            confirmPassword: undefined
        });

        expect(result).toEqual({
            email: 'Email is required.',
            username: 'Username is required.',
            first_name: 'First name is required.',
            last_name: 'Last name is required.',
            phone_number: 'Phone number is required.',
            password: 'Password is required.',
            confirmPassword: 'Please confirm your password.'
        });
    });

    it('returns only the missing required field errors when some fields are blank', () => {
        const result = validateSignupForm({
            email: 'user@example.com',
            username: '',
            firstName: 'Test',
            lastName: '',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: 'Password123!'
        });

        expect(result).toEqual({
            username: 'Username is required.',
            last_name: 'Last name is required.'
        });
    });

    it('returns a confirmPassword error when passwords do not match', () => {
        const result = validateSignupForm({
            email: 'user@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: 'DifferentPassword123!'
        });

        expect(result).toEqual({
            confirmPassword: 'Passwords do not match.'
        });
    });

    it('does not overwrite the required confirmPassword error with mismatch error when confirmPassword is blank', () => {
        const result = validateSignupForm({
            email: 'user@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: 'Password123!',
            confirmPassword: ''
        });

        expect(result).toEqual({
            confirmPassword: 'Please confirm your password.'
        });
    });

    it('does not add a mismatch error when password is blank', () => {
        const result = validateSignupForm({
            email: 'user@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '07123456789',
            password: '',
            confirmPassword: 'Password123!'
        });

        expect(result).toEqual({
            password: 'Password is required.'
        });
    });
});