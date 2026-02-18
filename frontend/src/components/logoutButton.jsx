import { useNavigate } from "react-router-dom";
import { logout } from "../utils/handleLocalStorage";

function LogoutButton() {
  const nav = useNavigate();

  function handleLogout() {
    logout();
    nav("/login");
  }

  return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;
