import {useLocation} from "react-router-dom";
import LogoutButton from "../../components/logoutButton.jsx";
import "./SideBar.css"

function SideBar() {
    const location = useLocation();

    return(
        <div className="sidebar">
            <ul className={"sidebar-links"}>
                <li className={location.pathname === "/dashboard" ? "active" : ""}>Dashboard</li>
                <li>Calender</li>
            </ul>
            <div className="sidebar-bottom">
                <LogoutButton />
            </div>
        </div>
    )
}

export default SideBar;