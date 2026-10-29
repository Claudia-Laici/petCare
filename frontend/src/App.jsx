import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/login/login";
import Home from "./pages/home/HomePage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;