import Container from "react-bootstrap/Container";
import "./loadingIndicator.css";

const LoadingIndicator = ({ message = "Stiamo preparando PetCare..." }) => {
  return (
    <Container
      fluid
      className="loading-page min-vh-100 d-flex flex-column align-items-center justify-content-center"
      role="status"
      aria-live="polite"
    >
      <div className="loading-content text-center">
        <div className="loading-paw" aria-hidden="true">
          🐾
        </div>

        <h1 className="loading-brand fw-bold mt-3 mb-2">
          PetCare
        </h1>

        <p className="loading-message mb-4">
          {message}
        </p>

        <div className="loading-track mx-auto" aria-hidden="true">
          <div className="loading-progress" />
        </div>
      </div>
    </Container>
  );
};

export default LoadingIndicator;
