import "./NavBar.css"
import { Link } from "react-router-dom";

function NavBar() {
    const isLoggedIn = !!localStorage.getItem("access");

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
                <div>
                    <span className="rightspan">Built for Students</span>
                </div>
            </div>
        </header>
    );
}

export default NavBar;