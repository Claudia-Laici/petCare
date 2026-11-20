import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/auth/login/Login";
import Home from "./pages/home/homePage";
import Register from "./pages/auth/register/Register";
import PublicOnlyRoute from "./components/routing/PublicOnlyRoute";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import PublicPetPage from "./pages/publicPetPage/PublicPetPage";
import QrPage from "./pages/qrPage/QrPage";
import UpdateHealthCardPage from "./pages/updateHealthCardPage/UpdateHealthCardPage";
import MainLayout from "./components/shared/layout/MainLayout";
import NotFound from "./pages/errors/notFound/NotFound";
import Maintenance from "./pages/errors/maintenance/Maintenance";
import AppointmentsPage from "./pages/appointments/AppointmentsPage";
import PublicAppointmentPage from "./pages/publicAppointmentPage/PublicAppointmentPage";
import AnimalsPage from "./pages/animals/AnimalsPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import SharesPage from "./pages/sharingPage/SharesPage";
import TherapiesPage from "./pages/therapies/TherapiesPage";
import VaccinationsPage from "./pages/vaccinations/VaccinationsPage";

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
            <Route path="/animals" element={<AnimalsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/therapies" element={<TherapiesPage />} />
            <Route path="/vaccinations" element={<VaccinationsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/shares" element={<SharesPage />} />
            <Route path="/pets/:petId/shares" element={<SharesPage />} />
            <Route path="/pets/:petId/qr-settings" element={<QrPage />} />
            <Route
              path="/pets/:petId/health"
              element={<UpdateHealthCardPage />}
            />
          </Route>
        </Route>

        <Route path="/p/:qrToken" element={<PublicPetPage />} />

        <Route path="/a/:token" element={<PublicAppointmentPage />} />

        <Route path="/maintenance" element={<Maintenance />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
