import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api";
import { saveTokens } from "../../utils/handleLocalStorage";
import { formatApiError } from "../../utils/errors";
import { validateSignupForm } from "../../utils/signupValidation";
import useRedirectIfAuthenticated from "../../utils/useRedirectIfAuthenticated";
import AuthCard from "../../components/AuthCard";
import AuthField from "../../components/AuthField";

const initialForm = {
  email: "",
  username: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

const initialErrors = {
  fieldErrors: {},
  global: [],
};

function Signup() {
  const nav = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);

  useRedirectIfAuthenticated(nav);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function showValidationErrors() {
    const fieldErrors = validateSignupForm(form);
    if (!Object.keys(fieldErrors).length) return false;

    setErrors({ fieldErrors, global: [] });
    return true;
  }

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