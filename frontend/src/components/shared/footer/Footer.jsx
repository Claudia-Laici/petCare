import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import Logo from "../../../assets/logo/LogoPetCare.png";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer border-top">
      <Container>
        <Row className="gy-4 align-items-start">
          <Col md={5}>
            <Link to="/dashboard" className="footer-brand">
              <img src={Logo} alt="PetCare" className="footer-logo-img" />
            </Link>

            <p className="footer-description">
              Tutta la salute dei tuoi animali, sempre con te. Una casa digitale
              per prenderti cura di loro.
            </p>
          </Col>

          <Col md={4} className="offset-md-3">
            <h6 className="footer-heading">PetCare</h6>
            <p className="footer-info">
              Organizza documenti, vaccinazioni e terapie del tuo amico a
              quattro zampe.
            </p>
          </Col>
        </Row>

        <div className="footer-bottom d-flex flex-column align-items-center gap-3">
          <span>
            © {new Date().getFullYear()} PetCare. Tutti i diritti riservati.
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
