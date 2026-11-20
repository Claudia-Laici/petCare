import { Button, Col, Row } from "react-bootstrap";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import LoadingIndicator from "../../../components/shared/loadingIndicator/LoadingIndicator";
import AuthLayout from "../AuthLayout";

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();


  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: searchParams.get("email") || "",
    dataDiNascita: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/users", {
        method: "POST",
        body: formData,
      });

      navigate("/login");
    } catch (e) {
      setError(e.message || "Errore durante la registrazione");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingIndicator message="Registrazione in corso..." />;
  }

  return (
    <AuthLayout
      title="Crea il tuo account"
      description="Registrati per iniziare a prenderti cura della salute dei tuoi animali."
      footer={
        <>
          Hai già un account?{" "}
          <Link to="/login" className="auth-link">
            Accedi
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <Row>
          <Col sm={6}>
            <div className="mb-3">
              <label htmlFor="nome" className="form-label">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                type="text"
                className="form-control"
                placeholder="Il tuo nome"
                autoComplete="given-name"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
          </Col>

          <Col sm={6}>
            <div className="mb-3">
              <label htmlFor="cognome" className="form-label">
                Cognome
              </label>
              <input
                id="cognome"
                name="cognome"
                type="text"
                className="form-control"
                placeholder="Il tuo cognome"
                autoComplete="family-name"
                value={formData.cognome}
                onChange={handleChange}
                required
              />
            </div>
          </Col>
        </Row>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control"
            placeholder="nome@esempio.it"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="dataDiNascita" className="form-label">
            Data di nascita
          </label>
          <input
            id="dataDiNascita"
            name="dataDiNascita"
            type="date"
            className="form-control"
            autoComplete="bday"
            value={formData.dataDiNascita}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control"
            placeholder="Crea una password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <Button type="submit" className="auth-button rounded-pill w-100 mt-2">
          Crea account
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Register;
