import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../functionality/LandingPage/Navbar.jsx";
import "./EditProfile.css";

function EditProfile() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const res = await api.get("/api/user/");
        setFormData({
          email: res.data.email || "",
          username: res.data.username || "",
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          phone_number: res.data.phone_number || "",
        });
      } catch (err) {
        if (err?.response?.status === 401) {
          navigate("/login");
        } else {
          setErrorMessage("Failed to load profile details.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetails();
  }, [navigate]);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function deleteAccount(){
    const confirmDelete = window.confirm(
        "Are you sure you want to delete your account?"
    );

    if(!confirmDelete) return;

    try{
        await api.delete("/api/user/delete/");
        localStorage.clear();
        window.location.href="/";
    } catch(err) {
      alert("Failed to delete account");
    }
  }


  async function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const res = await api.put("/api/user/", formData);
      setFormData({
        email: res.data.email || "",
        username: res.data.username || "",
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        phone_number: res.data.phone_number || "",
      });
      setSuccessMessage("Profile updated successfully.");
    } catch (err) {
      const data = err?.response?.data;

      if (err?.response?.status === 401) {
        navigate("/login");
      } else if (data && typeof data === "object") {
        const messages = Object.entries(data)
          .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(", ") : errors}`)
          .join(" | ");
        setErrorMessage(messages || "Failed to update profile.");
      } else {
        setErrorMessage("Failed to update profile.");
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="page-center">
          <div className="time-block-form-card edit-profile-card">
            <p>Loading profile...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-center">
        <div className="time-block-form-card edit-profile-card">
          <h2>Edit Profile</h2>

          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

            <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="profile-form-row">
                    <label htmlFor="email">Email</label>
                    <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="profile-form-row">
                    <label htmlFor="username">Username</label>
                    <input
                    id="username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="profile-form-row">
                    <label htmlFor="first_name">First Name</label>
                    <input
                    id="first_name"
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="profile-form-row">
                    <label htmlFor="last_name">Last Name</label>
                    <input
                    id="last_name"
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                    />
                </div>

                <div className="profile-form-row">
                    <label htmlFor="phone_number">Phone Number</label>
                    <input
                    id="phone_number"
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    required
                    />
                </div>
                

                <div className="profile-form-actions">
                    <button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                    </button>

                    <button type="button" onClick={() => navigate("/change-password")}>
                    Change Password
                    </button>

                    <button type="button" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                    </button>
                </div>

                <div className="delete-account-section">
                    <button
                    type="button"
                    className="delete-account-button"
                    onClick={deleteAccount}
                    >
                    Delete Account
                    </button>
                </div>
            </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;