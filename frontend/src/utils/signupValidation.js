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

export function validateSignupForm(form) {
  const errors = {};

  // Required field checks
  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.username.trim()) errors.username = "Username is required.";
  if (!form.firstName.trim()) errors.first_name = "First name is required.";
  if (!form.lastName.trim()) errors.last_name = "Last name is required.";
  if (!form.phoneNumber.trim()) errors.phone_number = "Phone number is required.";
  if (!form.password) errors.password = "Password is required.";

  // Confirm password must be provided
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  }

  // Confirm password must match password
  if (
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}