import { useNavigate } from "react-router-dom";
import { logout } from "../utils/handleLocalStorage";
import "./logoutButton.css"

function LogoutButton() {
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return <button className={"logout-button"} onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
