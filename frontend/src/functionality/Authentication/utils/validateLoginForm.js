/**
 * Validates login form values.
 *
 * @param {Object} values - Login form values
 * @param {string} values.email - User email input
 * @param {string} values.password - User password input
 * @returns {Object} Field validation errors
 */
function validateLoginForm({ email, password }) {
    const fieldErrors = {};

    if (!email.trim()) {
        fieldErrors.email = 'Email is required.';
    }

    if (!password) {
        fieldErrors.password = 'Password is required.';
    }

    return fieldErrors;
}

export default validateLoginForm;