import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { api, setAuthToken } from "../../api"

function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false)

    async function handleLogin() {
        if (loading) return;

        setError("");
        setLoading(true);

        try {
            const res = await api.post("/api/token/", { email, password });

            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            setAuthToken(res.data.access)

            nav("/dashboard");
        } catch (err) {
            setError("Login failed")
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Login Page</h1>

            {(error) && <p>{error}</p>}

            <form onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
            }}
            >

                <input placeholder="Email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}/>

                <input placeholder="Password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            <p>
                No account?{" "}
                <button type="button" onClick={() => nav("/signup")} disabled={loading}>
                Sign up
                </button>
            </p>

            <p>
                Forgot your password?
            </p>
        </div>
    )
}

export default Login;