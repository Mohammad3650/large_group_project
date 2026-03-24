import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api";
import { formatApiError } from "../../utils/errors";
import { saveTokens } from "../../utils/authStorage";
import useRedirectIfAuthenticated from "../../utils/useRedirectIfAuthenticated";
import AuthCard from "../../components/AuthCard";
import AuthField from "../../components/AuthField";
import Navbar from "../../components/Navbar";
import "./stylesheets/AuthPages.css";

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
 * Login page component.
 *
 * Description:
 * 
 * - collects the user's email and password
 * - validates the required fields before submission
 * - sends the login credentials to the backend
 * - stores returned JWT tokens on success
 * - redirects authenticated users to the dashboard
 *
 * @returns The login page UI
 */

function Login() {
  const nav = useNavigate();
  // Stores the email input value
  const [email, setEmail] = useState("");
  // Stores the password input value
  const [password, setPassword] = useState("");
  // Stores validation and API error messages
  const [errors, setErrors] = useState(initialErrors);
  // Indicates whether a login request is in progress to prevent multiple submissions
  const [loading, setLoading] = useState(false);

  useRedirectIfAuthenticated(nav);

  /**
   * Performs client-side checks to make sure the user has entered values.
   * 
   * - Emails must not be empty 
   * - Passwords must not be empty
   *
   * @returns {Object} An object containing any validation errors.
   */

  function validateLoginForm() {
    const fieldErrors = {};

    if (!email.trim()) fieldErrors.email = "Email is required.";
    if (!password) fieldErrors.password = "Password is required.";

    return fieldErrors;
  }

  /**
   * Sends the login request to the backend API.
   *
   * Description:
   * - posts the email and password to the token endpoint
   * - saves the access and refresh tokens on success
   * - redirects the user to the dashboard
   *
   */

  async function submitLogin() {
    const res = await publicApi.post("/api/token/", { email, password });
    saveTokens(res.data.access, res.data.refresh);
    nav("/dashboard");
  }

  /**
   * Handles login form submission.
   *
   * Description:
   * - prevents default browser form submission
   * - blocks duplicate submissions while loading
   * - runs client-side validation
   * - shows validation errors if present
   * - clears old errors before sending request
   * - submits login request to backend
   * - formats and displays API errors if login fails
   *
   * @param event - Form submit event
   * @returns void
   */

  async function handleLogin(event) {

    event.preventDefault();
    // Prevents the browser from reloading the page on form submission
    if (loading) return;

    // Run client-side validation and show errors if any
    const fieldErrors = validateLoginForm();

    // If there are validation errors, display them and don't proceed with the API call
    if (Object.keys(fieldErrors).length) {
      setErrors({ fieldErrors, global: [] });
      return;
    }

    // Clears the previous errors before making the new requests 
    setErrors(initialErrors);
    setLoading(true);

    try {
      await submitLogin();
    } catch (err) {
      // Convert backend errors to be able to be displayed in the UI accordingly 
      setErrors(formatApiError(err));
    } finally {
      // Re-enable the form whether the request failed or succeedded 
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Navbar />
      <div className="login-card-section">
        <AuthCard
          title="Welcome Back"
          subtitle="Log in to continue to StudySync"
          footerText="No account?"
          footerLinkText="Sign up"
          footerLinkTo="/signup"
        >

          {/* Displays general login errors that are not tied to one specific field */}
          {errors.global.length > 0 && (
            <div className="alert alert-danger text-center" role="alert">
              {errors.global.map((message) => (
                <div key={message}>{message}</div>
              ))}
            </div>
          )}

          {/* Login form with email and password fields, and a submit button */}
          <form onSubmit={handleLogin} noValidate>
            <div className="row g-3">
              <AuthField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                error={errors.fieldErrors.email}
              />

              <AuthField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password..."
                value={password}
                onChange={setPassword}
                error={errors.fieldErrors.password}
              />
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
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </div>
          </form>
        </AuthCard>
      </div>
    </div>
  );
}

export default Login;