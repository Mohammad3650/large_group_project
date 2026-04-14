import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './functionality/Authentication/Login/Login.jsx';
import Signup from './functionality/Authentication/Signup/Signup.jsx';
import EditProfile from './functionality/Authentication/EditProfile/EditProfile.jsx';
import ProtectedRoute from './functionality/Authentication/AuthComponents/ProtectedRoute.jsx';
import Dashboard from './functionality/Dashboard/Dashboard.jsx';
import Landing from './functionality/LandingPage/Landing.jsx';
import Calendar from './functionality/Calendar/Calendar.jsx';
import PreviewCalendar from './functionality/Calendar/PreviewCalendar.jsx';
import ChangePassword from './functionality/Authentication/ChangePassword/ChangePassword.jsx';
import CreateSchedule from './functionality/CreateSchedule/CreateSchedule.jsx';
import Settings from './functionality/Settings/Settings.jsx';
import { setAuthToken } from './api';
import SuccessfulTimeBlock from './components/SuccessfulTimeBlock.jsx';
import EditTimeBlock from './components/EditTimeBlock';
import Navbar from './components/Navbar/Navbar.jsx';
import { ACCESS_KEY } from './constants/authKeys.js';
import './styles/variables.css';

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_KEY);
        if (token) setAuthToken(token);
    }, []);

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        document.documentElement.classList.remove('light-theme', 'dark-theme');
        document.documentElement.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }

    return (
        <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <Routes>
                <Route path="/" element={<Landing theme={theme} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/create-schedule"
                    element={
                        <ProtectedRoute>
                            <CreateSchedule />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/successful-time-block"
                    element={
                        <ProtectedRoute>
                            <SuccessfulTimeBlock />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/time-blocks/:id/edit"
                    element={
                        <ProtectedRoute>
                            <EditTimeBlock />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute>
                            <Calendar theme={theme} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/preview-calendar"
                    element={
                        <ProtectedRoute>
                            <PreviewCalendar theme={theme} />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <EditProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;
