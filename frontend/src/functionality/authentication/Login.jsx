import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { api, setAuthToken } from "../../api"

function Login() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin() {
        setError("");

        try {
            const res = await api.post("/api/token/", { email, password });

            localStorage.setItem("access", res.data.access);
            localStorage.setItem("refresh", res.data.refresh);

            setAuthToken(res.data.access)

            nav("/dashboard");
        } catch (err) {
            setError("Login failed")
        }
    }

    return (
        <div>
            <h1>Login Page</h1>

            {(error) && <p>{error}</p>}

            <input placeholder="Email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}/>

            <input placeholder="Password" 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}/>

            <button onClick={handleLogin}>Login</button>

            <p>
                No account?
                <button onClick={() => nav("/signup")}>
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