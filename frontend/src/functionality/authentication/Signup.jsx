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

    const [error, setError] = useState([]);
    const [loading, setLoading] = useState(false);


    async function handleSignup(e) {
        e.preventDefault();

        if (loading) return;

        setError([]);
        setLoading(true);

        if (password !== confirmPassword) {
            setError(["Passwords do not match"]);
            setLoading(false);
            return;
        }
        
        try {

            const res = await api.post("/auth/signup/", {
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
            setError(formatApiError(err));
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


        {error.length > 0 && (
            <div className="alert alert-danger text-center">
            {error.map((msg, index) => (
                <p key={index}>{msg}</p>
            ))}
            </div>
        )}
                

            <form onSubmit={handleSignup}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Username</label>
                  <input
                    className="form-control"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">First name</label>
                  <input
                    className="form-control"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Last name</label>
                  <input
                    className="form-control"
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Phone number</label>
                  <input
                    className="form-control"
                    placeholder="e.g. 07123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label fw-semibold">Confirm password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
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