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
 * @param {object} form - Signup form values
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

const REQUIRED_FIELDS = [
    { formKey: 'email', errorKey: 'email' },
    { formKey: 'username', errorKey: 'username' },
    { formKey: 'firstName', errorKey: 'first_name' },
    { formKey: 'lastName', errorKey: 'last_name' },
    { formKey: 'phoneNumber', errorKey: 'phone_number' }
];

function isBlank(value) {
    return typeof value === 'string' ? !value.trim() : !value;
}

function validateRequiredFields(form, errors) {
    REQUIRED_FIELDS.forEach(({ formKey, errorKey }) => {
        if (isBlank(form[formKey])) {
            errors[errorKey] = REQUIRED_MESSAGES[errorKey];
        }
    });
}

function hasBothPasswords(form) {
    return Boolean(form.password && form.confirmPassword);
}

function hasMatchingPasswords(form) {
    return form.password === form.confirmPassword;
}

function validatePasswordRequired(form, errors) {
    if (!form.password) {
        errors.password = REQUIRED_MESSAGES.password;
    }
}

function validateConfirmPasswordRequired(form, errors) {
    if (!form.confirmPassword) {
        errors.confirmPassword = REQUIRED_MESSAGES.confirmPassword;
    }
}

function validatePasswordMatch(form, errors) {
    if (hasBothPasswords(form) && !hasMatchingPasswords(form)) {
        errors.confirmPassword = 'Passwords do not match.';
    }
}

function validatePasswords(form, errors) {
    validatePasswordRequired(form, errors);
    validateConfirmPasswordRequired(form, errors);
    validatePasswordMatch(form, errors);
}

export function validateSignupForm(form) {
    const errors = {};

    validateRequiredFields(form, errors);
    validatePasswords(form, errors);

    return errors;
}
