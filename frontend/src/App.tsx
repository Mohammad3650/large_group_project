import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "./testpage";
import Login from "./functionality/authentication/Login";
import Signup from "./functionality/authentication/Signup"
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./functionality/authentication/Dashboard";
import { setAuthToken } from "./api";


function App() {

  const token = localStorage.getItem("access");
  if (token) {
    setAuthToken(token);
  }
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />

        {/* <Route path="/auth/*" element={<AuthLayout />}>         */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>

  )
}

export default App;