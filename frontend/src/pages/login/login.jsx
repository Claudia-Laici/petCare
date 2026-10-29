import { Button, Container, Col, Row } from "react-bootstrap";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/apiFetch";
import pawDivider from "../../assets/decoration/pawDivider.png";
import Logo from "../../assets/logo/Logo.webp";
import LoadingIndicator from "../../components/shared/loadingIndicator/loadingIndicator";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      localStorage.setItem("token", data.token);
      navigate("/");
    } catch (e) {
      setError(e.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

   if (loading) {
    return <LoadingIndicator message="Accesso in corso..." />;
  }

  return (
    <Container
      fluid
      className="login-page min-vh-100 d-flex align-items-center justify-content-center py-4"
    >
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={8} lg={4}>
          <div className="card login-card shadow-sm border p-0">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-5">
                <img src={Logo} alt="" className="logo-img" />
                <p className="text-secondary login-subtitle">
                  La salute dei tuoi animali, sempre con te.
                </p>
              </div>

              <div className="paw-divider" aria-hidden="true">
                <span className="paw-line"></span>

                <img src={pawDivider} alt="" className="paw-divider-image" />
                
                <span className="paw-line"></span>
              </div>

              <h2 className="h5 fw-semibold mt-5 mb-4 login-title">
                Accedi al tuo account
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="form-control"
                    placeholder="nome@esempio.it"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="form-control"
                    placeholder="Inserisci la password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="login-button w-100 mt-2"
                  disabled={loading}
                >
                  {loading ? "Accesso in corso..." : "Accedi"}
                </Button>
              </form>

              <p className="text-center text-secondary small mt-4 mb-0 login-footer">
                Non hai ancora un account? La registrazione sarà disponibile
                qui.
              </p>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
