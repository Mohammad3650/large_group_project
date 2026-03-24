import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./functionality/Authentication/Login";
import Signup from "./functionality/Authentication/Signup"
import EditProfile from "./functionality/UserProfile/EditProfile.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./functionality/Dashboard/Dashboard.jsx";
import Landing from "./functionality/LandingPage/Landing.jsx";
import Calendar from "./functionality/Calendar/Calendar.jsx";
import PreviewCalendar from "./functionality/Calendar/PreviewCalendar.jsx";
import ChangePassword from "./functionality/UserProfile/ChangePassword.jsx";
import CreateSchedule from "./functionality/Authentication/CreateSchedule";
import { setAuthToken } from "./api";
import SuccessfulTimeBlock from "./components/SuccessfulTimeBlock.jsx";
import EditTimeBlock from "./components/EditTimeBlock";
import "./styles/variables.css"




function App() {

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) setAuthToken(token);
}, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => ! prev);
  }
  
  return (
    <div className={darkMode ? "app-light" : "app-dark"}>

      <NavBar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />


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
        } />

        <Route path="/timeblocks/:id/edit" element={
          <ProtectedRoute>
            <EditTimeBlock />
          </ProtectedRoute>
      }
      />


      <Route path="/calendar" element={
          <ProtectedRoute>
            <Calendar/>
          </ProtectedRoute>
      }
      />

<<<<<<< HEAD
    </div>

=======
      <Route path="/preview-calendar" element={
          <ProtectedRoute>
            <PreviewCalendar/>
          </ProtectedRoute>
      }
      />
      <Route path="/profile" element={
        <ProtectedRoute>
          <EditProfile />
        </ProtectedRoute>
      } 
      />
      <Route path="/change-password" element={
      <ProtectedRoute>
        <ChangePassword/>
      </ProtectedRoute>
      }/>
    </Routes>
    
>>>>>>> origin/main
  )
}

export default App;