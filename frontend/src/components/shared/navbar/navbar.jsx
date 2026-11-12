import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../../assets/logo/Logo.webp";
import ActionButton from "../../shared/actionButton/ActionButton";
import "./Navbar.css";

const PetCareNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <Navbar expand="lg" className="home-header border-bottom">
      <Container fluid className="px-4">
        <Navbar.Brand as={Link} to="/" className="mb-0">
          <img src={Logo} alt="PetCare" className="logo-img" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="petcare-navbar-nav" />

        <Navbar.Collapse id="petcare-navbar-nav">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center flex-grow-1">
            <Nav className="mx-lg-auto align-items-lg-center">
              <Nav.Link as={Link} to="/" className="nav-text">
                Home
              </Nav.Link>

              <Nav.Link as={Link} to="/" className="nav-text">
                I miei animali
              </Nav.Link>

              <Nav.Link as={Link} to="/" className="nav-text">
                Scadenze
              </Nav.Link>

              <Nav.Link as={Link} to="/" className="nav-text">
                Documenti
              </Nav.Link>

              <Nav.Link as={Link} to="/" className="nav-text">
                Condivisione
              </Nav.Link>
            </Nav>

            <div className="d-flex justify-content-lg-end mt-3 mt-lg-0 gap-2">
              <ActionButton onClick={handleLogout} className="px-4">
                Esci
              </ActionButton>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PetCareNavbar;
