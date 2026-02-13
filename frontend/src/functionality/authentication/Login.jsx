import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { api } from "../../api"
import { formatApiError } from "../../utils/errors";
import { saveTokens } from "../../utils/handleLocalStorage";

function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin() {
        setError("");

        try {
            const res = await api.post("/api/token/", { email, password });

            saveTokens(res.data.access, res.data.refresh);

            nav("/dashboard");
        } catch (err) {
            setError(formatApiError(err));
        }
    }

        return (
    <div className="container vh-100 d-flex align-items-center justify-content-center">
      <div className="row w-100 justify-content-center">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="text-center mb-4">Login</h3>

              {error && (
                <div className="alert alert-danger text-center">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={handleLogin}
                >
                  Login
                </button>

                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => nav("/signup")}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Login;