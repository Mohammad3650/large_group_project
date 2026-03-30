/**
 * Validates the signup form before sending data to the backend.
 *
 * Checks:
 * - all required fields are present
 * - password confirmation has been entered
 * - password and confirm password match
 *
 * Returned structure:
 * - object where each key is the field name
 * - each value is the corresponding validation message
 *
 * @param {{
 *   email: string,
 *   username: string,
 *   firstName: string,
 *   lastName: string,
 *   phoneNumber: string,
 *   password: string,
 *   confirmPassword: string
 * }} form - Signup form values
 * @returns {Object<string, string>} Validation errors keyed by field name
 */

const REQUIRED_MESSAGES = {
    email: 'Email is required.',
    username: 'Username is required.',
    first_name: 'First name is required.',
    last_name: 'Last name is required.',
    phone_number: 'Phone number is required.',
    password: 'Password is required.',
    confirmPassword: 'Please confirm your password.',
};

function isBlank(value) {
    return typeof value === 'string' ? !value.trim() : !value;
}

export function validateSignupForm(form) {
    const errors = {};

    if (isBlank(form.email)) {
        errors.email = REQUIRED_MESSAGES.email;
    }

    if (isBlank(form.username)) {
        errors.username = REQUIRED_MESSAGES.username;
    }

    if (isBlank(form.firstName)) {
        errors.first_name = REQUIRED_MESSAGES.first_name;
    }

    if (isBlank(form.lastName)) {
        errors.last_name = REQUIRED_MESSAGES.last_name;
    }

    if (isBlank(form.phoneNumber)) {
        errors.phone_number = REQUIRED_MESSAGES.phone_number;
    }

    if (!form.password) {
        errors.password = REQUIRED_MESSAGES.password;
    }

    if (!form.confirmPassword) {
        errors.confirmPassword = REQUIRED_MESSAGES.confirmPassword;
    }

    if (
        form.password &&
        form.confirmPassword &&
        form.password !== form.confirmPassword
    ) {
        errors.confirmPassword = 'Passwords do not match.';
    }

    return errors;
}
