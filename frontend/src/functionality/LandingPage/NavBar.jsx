import "./NavBar.css"
import { Link } from "react-router-dom";
import {useEffect, useState} from "react";
import LogoutButton from "../../components/logoutButton.jsx";
import useUser from "../helpers/useUser.js";
import {isTokenValid} from "../../utils/authToken.js";
import darkIcon from "./photos/darkmode.png";
import lightIcon from "./photos/lightmode.png";

function NavBar({ darkMode, toggleDarkMode }) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const username = useUser(isLoggedIn);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        async function checkAuth() {
            const valid = await isTokenValid();
            setIsLoggedIn(valid);
        }
        checkAuth();
    }, []);
  

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
                    <button
                        onClick={toggleDarkMode}
                        className="theme-toggle"
                        title={darkMode ? "Light Mode" : "Dark Mode"}
                    >
                        <img
                            src={darkMode ? lightIcon : darkIcon}
                            alt="Theme toggle"
                            className="theme-icon"
                        />
                    </button>
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