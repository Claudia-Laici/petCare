import { Container, Col, Row } from "react-bootstrap";
import pawDivider from "../../assets/decoration/pawDivider.png";
import Logo from "../../assets/logo/Logo.webp";
import "./Auth.css";

const AuthLayout = ({ title, description, footer, children }) => {
  return (
    <Container
      fluid
      className="auth-page min-vh-100 d-flex align-items-center justify-content-center py-4"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} md={8} lg={6} xl={4}>
          <div className="card auth-card shadow-sm border p-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <img src={Logo} alt="PetCare" className="auth-logo" />
                <p className="text-secondary auth-subtitle">
                  La salute dei tuoi animali, sempre con te.
                </p>
              </div>

              <div className="auth-paw-divider" aria-hidden="true">
                <span className="auth-paw-line"></span>
                <img src={pawDivider} alt="" className="auth-paw-image" />
                <span className="auth-paw-line"></span>
              </div>

              <h2
                className={`h5 fw-semibold mt-4 auth-title ${
                  description ? "mb-2" : "mb-4"
                }`}
              >
                {title}
              </h2>

              {description && (
                <p className="text-secondary small mb-4">{description}</p>
              )}

              {children}

              <p className="text-center text-secondary small mt-4 mb-0 auth-footer">
                {footer}
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AuthLayout;