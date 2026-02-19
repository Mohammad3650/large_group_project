import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { api } from "../../api"
import { formatApiError } from "../../utils/errors";
import { saveTokens, getAccessToken } from "../../utils/handleLocalStorage";
import { useEffect } from "react";


function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)

    useEffect(() => {
      if (getAccessToken()) {
        nav("/dashboard");
      }
    }, [nav]);

    async function handleLogin() {
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await api.post("/api/token/", { email, password });

            saveTokens(res.data.access, res.data.refresh);

            nav("/dashboard");
        } catch (err) {
            setError(formatApiError(err));
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

              {error && (<div className="alert alert-danger text-center">{error}</div>)}
            
            <form onSubmit={(e) => {e.preventDefault();handleLogin();}}>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}/>
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>

                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}/>
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