import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api";
import { saveTokens } from "../../utils/authStorage";
import { formatApiError } from "../../utils/errors";
import { validateSignupForm } from "../../utils/signupValidation";
import useRedirectIfAuthenticated from "../../utils/useRedirectIfAuthenticated";
import AuthCard from "../../components/AuthCard";
import AuthField from "../../components/AuthField";

/**
 * Initial form state used when the component loads.
 * Stores all input values required for user registration.
 * Signup form fields are stored differently to login as there are more 
 * and they are easier to manage and validate.
 */

const initialForm = {
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

/**
 * Initial error state used when the form first loads
 * or when errors need to be reset before a new submission.
 *
 * Structure:
 * - fieldErrors: validation errors linked to specific inputs e.g email or password
 * - global: general errors not tied to one field e.g. "Invalid credentials"
 */

const initialErrors = {
  fieldErrors: {},
  global: [],
};

/**
 * Signup page component.
 *
 * Responsibilities:
 * - manages form input state for user registration
 * - validates form data using a separate validation helper function
 * - sends signup request to backend API
 * - stores authentication tokens on success
 * - redirects users after successful signup or if already authenticated
 *
 * @returns {JSX.Element} Signup form UI
 */

function Signup() {
  const nav = useNavigate();
  // Stores the values of all form inputs in a single state object
  const [form, setForm] = useState(initialForm);
  // Stores validation and API error messages
  const [errors, setErrors] = useState(initialErrors);
  // Indicates whether a signup request is in progress to prevent multiple submissions
  const [loading, setLoading] = useState(false);

  useRedirectIfAuthenticated(nav);
 
  /**
   * Updates a specific field in the form state.
   *
   * Uses a functional update to ensure state is updated safely.
   *
   * @param {string} name - The name of the field to update
   * @param {string} value - The new value for the field
   */  

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /**
   * Runs client-side validation on the form.
   *
   * Uses the validateSignupForm helper function to check:
   * - required fields
   * - password confirmation match
   *
   * If validation errors exist:
   * - updates error state
   * - returns true to indicate failure
   *
   * @returns {boolean} True if validation errors exist, otherwise false
   */

  function showValidationErrors() {
    const fieldErrors = validateSignupForm(form);
    if (!Object.keys(fieldErrors).length) return false;

    setErrors({ fieldErrors, global: [] });
    return true;
  }


  /**
   * Sends the signup request to the backend API.
   *
   * Flow:
   * - maps frontend form fields to backend expected payload format
   * - sends POST request to signup endpoint
   * - stores returned JWT tokens
   * - redirects user to dashboard on success
   *
   * @returns {Promise<void>}
   */

  async function submitSignup() {
    const payload = {
      email: form.email,
      username: form.username,
      first_name: form.firstName,
      last_name: form.lastName,
      phone_number: form.phoneNumber,
      password: form.password,
    };

    const res = await publicApi.post("/auth/signup/", payload);
    saveTokens(res.data.access, res.data.refresh);
    nav("/dashboard");
  }

  async function handleSignup(event) {
    event.preventDefault();
    if (loading) return;

    setErrors(initialErrors);
    if (showValidationErrors()) return;

    setLoading(true);
    try {
      await submitSignup();
    } catch (err) {
      setErrors(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Sign up to get started with StudySync"
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo="/login"
    >
      {errors.global.length > 0 && (
        <div className="alert alert-danger text-center">
          {errors.global.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      )}

      <form noValidate onSubmit={handleSignup}>
        <div className="row g-3">
          <AuthField
            name="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(value) => updateField("email", value)}
            error={errors.fieldErrors.email}
          />

          <AuthField
            name="username"
            label="Username"
            placeholder="Choose a username"
            value={form.username}
            onChange={(value) => updateField("username", value)}
            error={errors.fieldErrors.username}
          />

          <div className="col-12 col-md-6">
            <AuthField
              name="firstName"
              label="First name"
              placeholder="First name"
              value={form.firstName}
              onChange={(value) => updateField("firstName", value)}
              error={errors.fieldErrors.first_name}
            />
          </div>

          <div className="col-12 col-md-6">
            <AuthField
              name="lastName"
              label="Last name"
              placeholder="Last name"
              value={form.lastName}
              onChange={(value) => updateField("lastName", value)}
              error={errors.fieldErrors.last_name}
            />
          </div>

          <AuthField
            name="phoneNumber"
            label="Phone number"
            placeholder="e.g. 07123 456 789"
            value={form.phoneNumber}
            onChange={(value) => updateField("phoneNumber", value)}
            error={errors.fieldErrors.phone_number}
          />

          <div className="col-12 col-md-6">
            <AuthField
              name="password"
              label="Password"
              type="password"
              placeholder="Create a password"
              value={form.password}
              onChange={(value) => updateField("password", value)}
              error={errors.fieldErrors.password}
            />
          </div>

          <div className="col-12 col-md-6">
            <AuthField
              name="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(value) => updateField("confirmPassword", value)}
              error={errors.fieldErrors.confirmPassword}
            />
          </div>
        </div>

        <div className="d-grid mt-4">
          <button
            className="btn btn-dark btn-lg rounded-3"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </div>
      </form>
    </AuthCard>
  );
}

export default Signup;