import { NavLink } from "react-router-dom";
import {
  House,
   Heart,
  Calendar2Check,
  Grid,
} from "react-bootstrap-icons";
import "./MobileBottomNav.css";

const MobileBottomNav = () => {
  return (
    <nav className="mobile-bottom-nav d-lg-none position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-sm d-flex align-items-center justify-content-around">
      <NavLink to="/" className="mobile-nav-link">
        <House />
        <span>Home</span>
      </NavLink>

      <NavLink to="/" className="mobile-nav-link">
        <Heart />
        <span>Animali</span>
      </NavLink>

      <NavLink to="/appointments" className="mobile-nav-link">
        <Calendar2Check />
        <span>Appuntamenti</span>
      </NavLink>

      <button type="button" className="mobile-nav-link">
        <Grid />
        <span>Altro</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;
