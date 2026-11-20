import { Button } from "react-bootstrap";
import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../../../utils/apiFetch";
import LoadingIndicator from "../shared/loadingIndicator/LoadingIndicator";
import AuthLayout from "../AuthLayout";
import GoogleButton from "../google/GoogleButton";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleError = new URLSearchParams(location.search).has("error")
    ? "Accesso con Google non riuscito. Riprova."
    : "";

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate(from, { replace: true });
    }
  }, [location.search, navigate, from]);

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
      navigate(from, { replace: true });
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
    <AuthLayout
      title="Accedi al tuo account"
      footer={
        <>
          Non hai ancora un account?{" "}
          <Link to="/register" className="auth-link">
            Registrati
          </Link>
        </>
      }
    >
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

        {(error || googleError) && (
          <div className="alert alert-danger" role="alert">
            {error || googleError}
          </div>
        )}

        <Button type="submit" className="auth-button w-100 mt-2">
          Accedi
        </Button>
      </form>
      <div className="d-flex justify-content-center gap-3 my-3">
        <span className="text-muted small">oppure</span>
      </div>
      <GoogleButton label="Accedi con Google" />
    </AuthLayout>
  );
};

export default Login;
