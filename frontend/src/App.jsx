import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/Login";
import Home from "./pages/home/Homepage";
import Register from "./pages/auth/Register";
import PublicOnlyRoute from "./components/routing/PublicOnlyRoute";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicPetPage from "./pages/publicPetPage/PublicPetPage";
import QrPage from "./pages/qrPage/QrPage";
import UpdateHealthCardPage from "./pages/updateHealthCardPage/UpdateHealthCardPage";
import MainLayout from "../src/components/shared/layout/MainLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pets/:petId/qr-settings" element={<QrPage />} />
            <Route
              path="/pets/:petId/health"
              element={<UpdateHealthCardPage />}
            />
          </Route>
        </Route>

        <Route path="/p/:qrToken" element={<PublicPetPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
