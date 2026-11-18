import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { PersonCircle } from "react-bootstrap-icons";
import Logo from "../../../assets/logo/LogoPetCare.png";
import { useFetch } from "../../../hooks/useFetch";
import { useRef, useState } from "react";
import { updateUserAvatar } from "../../../services/users/userService";
import MobileBottomNav from "./MobileBottomNav";
import "./Navbar.css";

const PetCareNavbar = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const { data: currentUser } = useFetch("/auth/me");
  const [updatedAvatar, setUpdatedAvatar] = useState(null);

  const avatar = updatedAvatar ?? currentUser?.avatar;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setAvatarError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setAvatarError("Formato non supportato. Usa JPG, PNG o WebP.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("L'immagine non può superare i 5 MB.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setUploadingAvatar(true);

      const result = await updateUserAvatar(formData);

      setUpdatedAvatar(result.avatar);
    } catch (error) {
      setAvatarError(error.message || "Errore durante il caricamento.");
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  return (
    <>
      <Navbar expand="lg" className="home-header border-bottom">
        <Container fluid className="px-4 d-flex align-items-center">
          <Navbar.Brand as={Link} to="/" className="mb-0">
            <img src={Logo} alt="PetCare" className="logo-img" />
          </Navbar.Brand>

          <Navbar.Collapse className="d-none d-lg-flex flex-grow-1">
            <Nav className="mx-auto align-items-center">
              <Nav.Link as={Link} to="/" className="nav-text">
                Home
              </Nav.Link>

              <Nav.Link as={Link} to="/" className="nav-text">
                I miei animali
              </Nav.Link>

              <Nav.Link as={Link} to="/appointments" className="nav-text">
                Appuntamenti
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
          </Navbar.Collapse>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="d-none"
              onChange={handleAvatarChange}
            />

            <button
              type="button"
              className="navbar-avatar-toggle p-0 border-0 bg-transparent"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              aria-label="Cambia immagine profilo"
              title="Cambia immagine profilo"
            >
              {uploadingAvatar ? (
                <span className="spinner-border spinner-border-sm text-success" />
              ) : avatar ? (
                <img
                  src={avatar}
                  alt="Avatar profilo"
                  className="navbar-avatar"
                />
              ) : (
                <PersonCircle size={38} className="text-secondary" />
              )}
            </button>

            <button
              type="button"
              className="nav-text border-0 bg-transparent p-0"
              onClick={handleLogout}
            >
              Esci
            </button>
          </div>
        </Container>

        {avatarError && <small className="text-danger">{avatarError}</small>}
      </Navbar>

      <MobileBottomNav />
    </>
  );
};

export default PetCareNavbar;
