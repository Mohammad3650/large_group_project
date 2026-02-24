import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveTokens } from "../../utils/handleLocalStorage";
import { publicApi } from "../../api";
import { formatApiError } from "../../utils/errors";
import { isTokenValid } from "../../utils/authToken";

function Signup() {
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({ fieldErrors: {}, global: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await isTokenValid();
      if (ok) nav("/dashboard");
    })();
  }, [nav]);

  async function handleSignup(e) {
    e.preventDefault();
    if (loading) return;

    setErrors({ fieldErrors: {}, global: [] });
    setLoading(true);

    const fieldErrors = {};

    if (!email.trim()) fieldErrors.email = ["Email is required."];
    if (!username.trim()) fieldErrors.username = ["Username is required."];
    if (!firstName.trim()) fieldErrors.first_name = ["First name is required."];
    if (!lastName.trim()) fieldErrors.last_name = ["Last name is required."];
    if (!phoneNumber.trim()) fieldErrors.phone_number = ["Phone number is required."];
    if (!password) fieldErrors.password = ["Password is required."];
    if (!confirmPassword) fieldErrors.confirmPassword = ["Please confirm your password."];

    if (password && confirmPassword && password !== confirmPassword) {
      fieldErrors.confirmPassword = ["Passwords do not match."];
    }

    if (Object.keys(fieldErrors).length) {
      setErrors({ fieldErrors, global: [] });
      setLoading(false);
      return;
    }

    try {
      const res = await publicApi.post("/auth/signup/", {
        email,
        username,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        password,
      });

      saveTokens(res.data.access, res.data.refresh);
      nav("/dashboard");
    } catch (err) {
      setErrors(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="col-11 col-sm-10 col-md-8 col-lg-6 col-xl-5">
        <div className="card shadow-lg border-0 rounded-4">
          <div className="card-body py-4 px-5">
            <h3 className="text-center mb-4 mt-4 fw-bold">Create your account</h3>

            {errors.global.length > 0 && (
              <div className="alert alert-danger text-center">
                {errors.global.map((m, i) => <div key={i}>{m}</div>)}
              </div>
            )}

            <form noValidate onSubmit={handleSignup}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className={`form-control ${errors.fieldErrors.email ? "is-invalid" : ""}`}
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {errors.fieldErrors.email && (
                    <div className="invalid-feedback">{errors.fieldErrors.email[0]}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Username</label>
                  <input
                    className={`form-control ${errors.fieldErrors.username ? "is-invalid" : ""}`}
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  {errors.fieldErrors.username && (
                    <div className="invalid-feedback">{errors.fieldErrors.username[0]}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">First name</label>
                  <input
                    className={`form-control ${errors.fieldErrors.first_name ? "is-invalid" : ""}`}
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  {errors.fieldErrors.first_name && (
                    <div className="invalid-feedback">{errors.fieldErrors.first_name[0]}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Last name</label>
                  <input
                    className={`form-control ${errors.fieldErrors.last_name ? "is-invalid" : ""}`}
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                  {errors.fieldErrors.last_name && (
                    <div className="invalid-feedback">{errors.fieldErrors.last_name[0]}</div>
                  )}
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Phone number</label>
                  <input
                    className={`form-control ${errors.fieldErrors.phone_number ? "is-invalid" : ""}`}
                    placeholder="e.g. 07123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  {errors.fieldErrors.phone_number && (
                    <div className="invalid-feedback">{errors.fieldErrors.phone_number[0]}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.fieldErrors.password ? "is-invalid" : ""}`}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {errors.fieldErrors.password && (
                    <div className="invalid-feedback">{errors.fieldErrors.password[0]}</div>
                  )}
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Confirm password</label>
                  <input
                    type="password"
                    className={`form-control ${errors.fieldErrors.confirmPassword ? "is-invalid" : ""}`}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  {errors.fieldErrors.confirmPassword && (
                    <div className="invalid-feedback">{errors.fieldErrors.confirmPassword[0]}</div>
                  )}
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
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Signing up...
                    </>
                  ) : (
                    "Sign up"
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="card-footer text-center bg-white border-0 rounded-4 pb-4">
            <small className="text-muted">Already have an account?</small>
            <Link to="/login" className="btn btn-link btn-sm pl-2">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;