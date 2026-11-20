
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Offcanvas } from "react-bootstrap";
import {
  House,
  Heart,
  Calendar2Check,
  Grid,
  Capsule,
  ShieldCheck,
  Folder,
  People,
  X,
} from "react-bootstrap-icons";
import "./MobileBottomNav.css";

const moreLinks = [
  { to: "/therapies", label: "Terapie", icon: Capsule },
  { to: "/vaccinations", label: "Vaccinazioni", icon: ShieldCheck },
  { to: "/documents", label: "Documenti", icon: Folder },
  { to: "/shares", label: "Condivisioni", icon: People },
];

const MobileBottomNav = () => {
  const [showMore, setShowMore] = useState(false);

  const closeMore = () => setShowMore(false);

  return (
    <>
      <nav className="mobile-bottom-nav d-lg-none position-fixed bottom-0 start-0 w-100 border-top shadow-sm d-flex align-items-center justify-content-around">
        <NavLink to="/" className="mobile-nav-link">
          <House />
          <span>Home</span>
        </NavLink>

        <NavLink to="/animals" className="mobile-nav-link">
          <Heart />
          <span>Animali</span>
        </NavLink>

        <NavLink to="/appointments" className="mobile-nav-link">
          <Calendar2Check />
          <span>Appuntamenti</span>
        </NavLink>

        <button
          type="button"
          className={`mobile-nav-link mobile-more-trigger ${
            showMore ? "active" : ""
          }`}
          onClick={() => setShowMore(true)}
          aria-expanded={showMore}
          aria-label="Apri altre sezioni"
        >
          <Grid />
          <span>Altro</span>
        </button>
      </nav>

      <Offcanvas
        show={showMore}
        onHide={closeMore}
        placement="bottom"
        className="mobile-more-offcanvas d-lg-none"
      >
        <Offcanvas.Header className="mobile-more-header">
          <Offcanvas.Title>Altre sezioni</Offcanvas.Title>

          <button
            type="button"
            className="mobile-more-close"
            onClick={closeMore}
            aria-label="Chiudi menu"
          >
            <X />
          </button>
        </Offcanvas.Header>

        <Offcanvas.Body className="mobile-more-body">
          <div className="mobile-more-grid">
            {moreLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={closeMore}
                className={({ isActive }) =>
                  `mobile-more-link ${isActive ? "active" : ""}`
                }
              >
                <span className="mobile-more-icon">
                  <Icon />
                </span>

                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MobileBottomNav;
