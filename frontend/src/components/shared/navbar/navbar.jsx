import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { Link } from "react-router-dom";
import Logo from "../../../assets/logo/Logo.webp";
import "./Navbar.css";

const PetCareNavbar = ({ onLogout }) => {
  return (
    <Navbar expand="lg" className="home-header border-bottom">
      <Container fluid className="px-4">

        <Navbar.Brand as={Link} to="/" className="mb-0">
          <img src={Logo} alt="PetCare" className="logo-img" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="petcare-navbar-nav" />
    
        <Navbar.Collapse id="petcare-navbar-nav">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center flex-grow-1">

            {/* Centro: link */}
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
              <Button variant="success" className="rounded-pill px-4" size="sm" onClick={onLogout}>
                + Aggiungi Pet
              </Button>
              <Button variant="outline-success" className="rounded-pill px-4" size="sm" onClick={onLogout}>
                Esci
              </Button>
            </div>

          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PetCareNavbar;
