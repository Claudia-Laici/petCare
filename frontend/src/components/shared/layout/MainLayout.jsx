import PetCareNavbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
     <PetCareNavbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default MainLayout;