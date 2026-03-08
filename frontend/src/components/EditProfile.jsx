import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Navbar from "../functionality/LandingPage/Navbar.jsx";

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
          <div className="time-block-form-card">
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
        <div className="time-block-form-card">
          <h2>Edit Profile</h2>

          {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
          {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Phone Number</label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button type="button" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default EditProfile;