import { useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Navbar from "../functionality/LandingPage/Navbar";

function ChangePassword() {
    const navigate = useNavigate();

    const [currentPassword,setCurrentPassword] = useState("");
    const [newPassword,setNewPassword] = useState("");
    const [message,setMessage] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            const res = await api.post("/api/user/change-password/", {
                current_password: currentPassword,
                new_password: newPassword
            });

            setMessage(res.data.message);

            setTimeout(() => {
                navigate("/profile");
            }, 1200);
        } catch (err) {
            setMessage("Password change failed");
        }
    }

    return (
        <>
        <Navbar/>
        <div className="page-center">
            <div className="time-block-form-card">

                <h2>Change Password</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="password"
                        placeholder="Current Password"
                        value={currentPassword}
                        onChange={(e)=>setCurrentPassword(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e)=>setNewPassword(e.target.value)}
                        required
                    />

                    <button type="submit">Update Password</button>

                </form>

                {message && <p>{message}</p>}

            </div>
        </div>
        </>
    );
}

export default ChangePassword;