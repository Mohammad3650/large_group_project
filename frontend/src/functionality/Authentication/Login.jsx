import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { publicApi } from "../../api";
import { formatApiError } from "../../utils/errors";
import { saveTokens } from "../../utils/handleLocalStorage";
import useRedirectIfAuthenticated from "../../utils/useRedirectIfAuthenticated";
import AuthCard from "../../components/AuthCard";
import AuthField from "../../components/AuthField";

const initialErrors = {
  fieldErrors: {},
  global: [],
};

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState(initialErrors);
  const [loading, setLoading] = useState(false);

  useRedirectIfAuthenticated(nav);

  function validateLoginForm() {
    const fieldErrors = {};

    if (!email.trim()) fieldErrors.email = "Email is required.";
    if (!password) fieldErrors.password = "Password is required.";

    return fieldErrors;
  }

  async function submitLogin() {
    const res = await publicApi.post("/api/token/", { email, password });
    saveTokens(res.data.access, res.data.refresh);
    nav("/dashboard");
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (loading) return;

    const fieldErrors = validateLoginForm();
    if (Object.keys(fieldErrors).length) {
      setErrors({ fieldErrors, global: [] });
      return;
    }

    setErrors(initialErrors);
    setLoading(true);

    try {
      await submitLogin();
    } catch (err) {
      setErrors(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Log in to continue to StudySync"
      footerText="No account?"
      footerLinkText="Sign up"
      footerLinkTo="/signup"
    >
      {errors.global.length > 0 && (
        <div className="alert alert-danger text-center" role="alert">
          {errors.global.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>
      )}

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
  );
}

export default Login;