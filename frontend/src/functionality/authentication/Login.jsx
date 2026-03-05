import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"
import { publicApi } from "../../api"
import { formatApiError } from "../../utils/errors";
import { saveTokens, getAccessToken } from "../../utils/handleLocalStorage";
import { isTokenValid } from "../../utils/authToken";


function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      (async () => {
        const ok = await isTokenValid();
        if (ok) nav("/dashboard");
      })()
    }, [nav]);

    async function handleLogin() {
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await publicApi.post("/api/token/", { email, password });

            saveTokens(res.data.access, res.data.refresh);

            nav("/dashboard");
        } catch (err) {
            setError(formatApiError(err));
        } finally {
            setLoading(false);
        }
    }

return (
  <div className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
    <div className="col-11 col-sm-9 col-md-7 col-lg-5 col-xl-4">
      <div className="card shadow-lg border-0 rounded-4">

        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1">Welcome Back</h3>
            <p className="text-muted mb-0">
              Log in to continue to StudySync
            </p>
          </div>

          {error && (
            <div className="alert alert-danger text-center">
              {error}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <div className="mb-3">
              <label className="form-label fw-semibold">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="form-label fw-semibold">Password</label>
              <input
                type="password"
                placeholder="Enter your password..."
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="d-grid">
              <button
                className="btn btn-dark btn-lg rounded-3"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Logging in...
                  </>
                ) : (
                  "Log in"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="card-footer bg-white text-center py-3 border-0 rounded-bottom-4">
          <small className="text-muted">
            No account?{" "}
            <Link
              to="/signup"
              className="fw-semibold text-decoration-none ms-1"
            >
              Sign up
            </Link>
          </small>
        </div>

      </div>
    </div>
  </div>
);
}

export default Login;