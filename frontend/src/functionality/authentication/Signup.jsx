import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { saveTokens } from "../../utils/handleLocalStorage";
import { api } from "../../api";
import { formatApiError } from "../../utils/errors";

function Signup() {
    const nav = useNavigate();

    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    async function handleSignup(e) {
        e.preventDefault();

        if (loading) return;

        setError("");
        setLoading(true);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }
        
        try {

            await api.post("/auth/signup/", {
                email,
                username,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                password,
            });

            const res = await api.post("/api/token/", {
                email,
                password,
            });
            saveTokens(res.data.access, res.data.refresh);

            nav("/dashboard");

        } catch (err) {
            setError(formatApiError(err));
        } finally {
            setLoading(false);
        }
    } 


    return (
        <div>
            <h2>Sign up</h2>


            {error.length > 0 && (
            <ul className="error">
                {error.map((err, index) => (
                <li key={index}>{err}</li>
                ))}
            </ul>
            )}



            <form onSubmit={handleSignup}>
                <input 
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input 
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <input 
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />

                <input 
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />

                <input
                    placeholder="Phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button disabled={loading}>
                    {loading ? "Signing up" : "Sign up"}
                </button>
            </form>

            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </div>
    );
}

export default Signup;