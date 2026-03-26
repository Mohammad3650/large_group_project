import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './functionality/Authentication/Login';
import Signup from './functionality/Authentication/Signup';
import EditProfile from './functionality/Authentication/UserProfile/EditProfile.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './functionality/Dashboard/Dashboard.jsx';
import Landing from './functionality/LandingPage/Landing.jsx';
import Calendar from './functionality/Calendar/Calendar.jsx';
import PreviewCalendar from './functionality/Calendar/PreviewCalendar.jsx';
import ChangePassword from './functionality/Authentication/UserProfile/ChangePassword.jsx';
import CreateSchedule from './functionality/Authentication/CreateSchedule';
import { setAuthToken } from './api';
import SuccessfulTimeBlock from './components/SuccessfulTimeBlock.jsx';
import EditTimeBlock from './components/EditTimeBlock';
import Navbar from './components/Navbar';
import './styles/variables.css';

function App() {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('theme') || 'light';
    });

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (token) setAuthToken(token);
    }, []);

    useEffect(() => {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
        localStorage.setItem('theme', theme);
    }, [theme]);

    function toggleTheme() {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    }

    return (
        <>
            <Navbar theme={theme} toggleTheme={toggleTheme} />

            <Routes>
                <Route path="/" element={<Landing />} />
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
                    path="/successful-timeblock"
                    element={
                        <ProtectedRoute>
                            <SuccessfulTimeBlock />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/timeblocks/:id/edit"
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
                            <Calendar />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/preview-calendar"
                    element={
                        <ProtectedRoute>
                            <PreviewCalendar />
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
            </Routes>
        </>
    );
}

export default App;
