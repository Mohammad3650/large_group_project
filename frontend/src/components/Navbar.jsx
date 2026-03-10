import "./stylesheets/Navbar.css"
import { Link } from "react-router-dom";
import {useEffect, useState} from "react";
import LogoutButton from "./LogoutButton.jsx";
import useUser from "../utils/useUser.js";
import {isTokenValid} from "../utils/authToken.js";

import userIcon from  "../assets/Navbar/user.png"
import taskList from "../assets/Navbar/task_list.png";
import calendarIcon from  "../assets/calendar_icon.png"

function Navbar() {
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
                                <img src={taskList} alt="Dashboard" className="navbar-icon" />
                                <span>Dashboard</span>
                            </Link>
                            <Link to="/calendar" className="navbar-link">
                                <img src={calendarIcon} alt="Calendar" className="navbar-icon" />
                                <span>Calendar</span>
                            </Link>
                        </>
                    )}
                </div>
                <div className="navbar-right">
                    {isLoggedIn ? (
                        <div className="navbar-user">
                            <img
                                src={userIcon}
                                alt="User"
                                className="navbar-icon user-icon"
                                onClick={() => setDropdownOpen(prev => !prev)}
                            />
                            {dropdownOpen && (
                                <div className="user-dropdown">
                                    <span className="dropdown-username">{username}</span>
                                    <Link to="/profile" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                                        Profile
                                    </Link>
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

export default Navbar;