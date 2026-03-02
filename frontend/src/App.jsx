import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./functionality/authentication/Login";
import Signup from "./functionality/authentication/Signup"
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./functionality/authentication/Dashboard";
import Landing from "./functionality/LandingPage/Landing";

import CreateSchedule from "./functionality/authentication/createSchedule";
import { setAuthToken } from "./api";
import SuccessfulTimeBlock from "./components/successfulTimeBlock";
import EditTimeBlock from "./components/EditTimeBlock";


function App() {

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) setAuthToken(token);
}, []);
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/create-schedule" element={
        <ProtectedRoute>
          <CreateSchedule />
        </ProtectedRoute>
      } />

      <Route path="/successful-timeblock" element={
        <ProtectedRoute>
          <SuccessfulTimeBlock />
        </ProtectedRoute>
      }
      />

      <Route path="/timeblocks/:id/edit" element={
          <ProtectedRoute>
          <EditTimeBlock />
          </ProtectedRoute>
      }
      />

    </Routes>

  )
}

export default App;