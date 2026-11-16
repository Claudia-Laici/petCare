
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Dropdown from "react-bootstrap/Dropdown";
import { Link, useNavigate } from "react-router-dom";
import { PersonCircle } from "react-bootstrap-icons";
import Logo from "../../../assets/logo/Logo.webp";
import { useFetch } from "../../../hooks/useFetch";
import "./Navbar.css";

const PetCareNavbar = () => {
  const navigate = useNavigate();

  const { data: currentUser } = useFetch("/auth/me");
  const avatar = currentUser?.avatar;

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

            <div className="d-flex align-items-center justify-content-lg-end mt-3 mt-lg-0">
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  className="navbar-avatar-toggle p-0 border-0"
                  aria-label="Menu profilo"
                >
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="Avatar profilo"
                      className="navbar-avatar"
                    />
                  ) : (
                    <PersonCircle
                      size={38}
                      className="text-secondary"
                    />
                  )}
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-sm border-0 rounded-3 mt-2">
                  <Dropdown.Header>
                    {currentUser
                      ? `${currentUser.nome || ""} ${currentUser.cognome || ""}`.trim()
                      : "Il mio account"}
                  </Dropdown.Header>

                  <Dropdown.Divider />

                  <Dropdown.Item as={Link} to="/profile">
                    Il mio profilo
                  </Dropdown.Item>

                  <Dropdown.Item onClick={handleLogout}>
                    Esci
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default PetCareNavbar;