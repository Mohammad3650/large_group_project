import "./stylesheets/Navbar.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import LogoutButton from "./LogoutButton.jsx";
import useUsername from "../utils/useUsername.js";
import useAuthStatus from "../utils/authStatus";
import ToggleDarkMode from "./ToggleDarkMode.jsx";

import userIcon from "../assets/Navbar/user.png";

import taskListLight from "../assets/Navbar/task_list.png";
import taskListDark from "../assets/Navbar/task_list_black.png";

import calendarIconLight from "../assets/calendar_icon.png";
import calendarIconDark from "../assets/calendar_icon_black.png";

/**
 * Navbar component - site-wide navigation header.
 * Displays the app title, navigation links, theme toggle, and user account controls.
 * Shows dashboard and calendar links when the user is logged in,
 * and a user dropdown (with username, profile link, and logout) on authentication.
 *
 * @param {Object} props
 * @param {string} props.theme - Current theme mode
 * @param {Function} props.toggleTheme - Function to switch theme
 * @returns {JSX.Element} The navigation header
 */

function Navbar({ theme, toggleTheme }) {
    const isLoggedIn = useAuthStatus();
    const { username, error } = useUsername(isLoggedIn);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const taskList = theme === "dark" ? taskListDark : taskListLight;
    const calendarIcon = theme === "dark" ? calendarIconDark : calendarIconLight;

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
          <ToggleDarkMode theme={theme} toggleTheme={toggleTheme} />

          {isLoggedIn ? (
            <div className="navbar-user">
              <img
                src={userIcon}
                alt="User"
                className="navbar-icon user-icon"
                onClick={() => setDropdownOpen((prev) => !prev)}
              />

              {dropdownOpen && (
                <div className="user-dropdown">
                  <span className="dropdown-username">{username}</span>
                  <Link
                    to="/profile"
                    className="dropdown-link"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <LogoutButton />
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