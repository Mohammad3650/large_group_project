import "./NavBar.css"
import { Link } from "react-router-dom";
import { useState } from "react";
import LogoutButton from "../../components/logoutButton.jsx";
import getUser from "../helpers/GetUser.js";

function NavBar() {
    const isLoggedIn = !!localStorage.getItem("access");
    const username = getUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header>
            <div className="maindiv">
                <div className="navbar-left">
                    <Link to="/" className="navbar-title">
                        <span className="title">StudySync</span>
                    </Link>
                    {isLoggedIn && (
                        <>
                            <Link to="/dashboard" className="navbar-link">
                                <img src="/task_list.png" alt="Dashboard" className="navbar-icon" />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/calendar" className="navbar-link">
                                <img src="/calendar.png" alt="Calendar" className="navbar-icon" />
                                <span>Calendar</span>
                            </Link>
                        </>
                    )}
                </div>
                <div className="navbar-right">
                    {isLoggedIn ? (
                        <div className="navbar-user">
                            <img
                                src="/user.png"
                                alt="User"
                                className="navbar-icon user-icon"
                                onClick={() => setDropdownOpen(prev => !prev)}
                            />
                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <span className="dropdown-username">{username}</span>
                                    <LogoutButton/>
                                </div>
                            )}
                        </div>
                    ) : (
                        <span className="rightspan">Built for Students</span>
                    )}
                </div>
            </div>
        </header>
    );
}

export default NavBar;