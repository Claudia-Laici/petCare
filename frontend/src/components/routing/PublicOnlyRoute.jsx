import { Navigate, Outlet } from "react-router-dom";

const PublicOnlyRoute = () => {
  const token = localStorage.getItem("token");

  return token ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicOnlyRoute;