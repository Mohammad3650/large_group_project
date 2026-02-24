import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"
import { publicApi } from "../../api"
import { formatApiError } from "../../utils/errors";
import { saveTokens, getAccessToken } from "../../utils/handleLocalStorage";
import { isTokenValid } from "../../utils/authToken";


function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ fieldErrors: {}, global: [] });
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      (async () => {
        const ok = await isTokenValid();
        if (ok) nav("/dashboard");
      })()
    }, [nav]);


    async function handleLogin() {
    if (loading) return;

    // reset
    setErrors({ fieldErrors: {}, global: [] });
    setLoading(true);

    // simple client validation
    const fieldErrors = {};
    if (!email.trim()) fieldErrors.email = ["Email is required."];
    if (!password) fieldErrors.password = ["Password is required."];

    if (Object.keys(fieldErrors).length) {
      setErrors({ fieldErrors, global: [] });
      setLoading(false);
      return;
    }

    try {
      const res = await publicApi.post("/api/token/", { email, password });
      saveTokens(res.data.access, res.data.refresh);
      nav("/dashboard");
    } catch (err) {
      setErrors(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }

return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 justify-content-center">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="text-center mb-4">Login</h3>

            {errors.global.length > 0 && (
              <div className="alert alert-danger text-center">
                {errors.global.map((m, i) => <div key={i}>{m}</div>)}
              </div>
            )}
                        
            <form noValidate onSubmit={(e) => {e.preventDefault(); handleLogin();}}>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${errors.fieldErrors.email ? "is-invalid" : ""}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {errors.fieldErrors.email && (
                  <div className="invalid-feedback">
                    {errors.fieldErrors.email[0]}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>

                <input
                  type="password"
                  className={`form-control ${errors.fieldErrors.password ? "is-invalid" : ""}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {errors.fieldErrors.password && (
                  <div className="invalid-feedback">
                    {errors.fieldErrors.password[0]}
                  </div>
                )}
              </div>

              <div className="d-grid gap-2">
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
              </div>

            </form>

              <div className="card-footer text-center">

                No account?{" "}
                <button type="button" onClick={() => nav("/signup")} disabled={loading}>
                Sign up
                </button>

              </div>
            </div>
          </div>
        </div>
      </div>
      );
}

export default Login;