import { BrowserRouter, Routes, Route } from "react-router-dom";
import TestPage from "./testpage";
import Login from "./Login";
import Signup from "./Signup"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestPage />} />

        {/* <Route path="/auth/*" element={<AuthLayout />}>         */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </BrowserRouter>

  )
}

export default App;