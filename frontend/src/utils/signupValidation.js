export function validateSignupForm(form) {
  const errors = {};

  if (!form.email.trim()) errors.email = "Email is required.";
  if (!form.username.trim()) errors.username = "Username is required.";
  if (!form.firstName.trim()) errors.first_name = "First name is required.";
  if (!form.lastName.trim()) errors.last_name = "Last name is required.";
  if (!form.phoneNumber.trim()) errors.phone_number = "Phone number is required.";
  if (!form.password) errors.password = "Password is required.";
  if (!form.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  }

  if (
    form.password &&
    form.confirmPassword &&
    form.password !== form.confirmPassword
  ) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}