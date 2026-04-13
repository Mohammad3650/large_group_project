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

const REQUIRED_FIELDS = [
    { formKey: 'email', errorKey: 'email', message: 'Email is required.' },
    { formKey: 'username', errorKey: 'username', message: 'Username is required.' },
    { formKey: 'firstName', errorKey: 'first_name', message: 'First name is required.' },
    { formKey: 'lastName', errorKey: 'last_name', message: 'Last name is required.' },
    { formKey: 'phoneNumber', errorKey: 'phone_number', message: 'Phone number is required.' },
    { formKey: 'password', errorKey: 'password', message: 'Password is required.' },
    { formKey: 'confirmPassword', errorKey: 'confirmPassword', message: 'Please confirm your password.' }
];

/**
 * Checks if a value is blank.
 * 
 * @param {unknown} value 
 * @returns {boolean}
 */
function isBlank(value) {
    return typeof value === 'string' ? !value.trim() : !value;
}

/**
 * Applies required field validation
 * 
 * @param {Object} form 
 * @returns {Object} errors
 */
function applyRequiredFieldValidation(form, errors) {
    for (const field of REQUIRED_FIELDS) {
        if (isBlank(form[field.formKey])) {
            errors[field.errorKey] = field.message;
        }
    }
}

/**
 * Applies password-specific validation rules
 * 
 * @param {Object} form 
 * @returns {Object} errors
 */
function applyPasswordValidation(form, errors) {
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
    }
}

/**
 * Main validation function
 * 
 * @param {Object} form 
 * @returns {Object<string, string>} errors
 */
export function validateSignupForm(form) {
    const errors = {};

    applyRequiredFieldValidation(form, errors);
    applyPasswordValidation(form, errors);

    return errors;
}
