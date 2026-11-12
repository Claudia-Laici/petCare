import Spinner from "react-bootstrap/Spinner";
import "./LoadingIndicator.css";

const LoadingIndicator = () => {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <h1 className="loading-brand">PetCare</h1>

      <div className="loading-spinner">
        {[0, 1, 2].map((i) => (
          <Spinner
            key={i}
            animation="grow"
            size="sm"
            aria-hidden="true"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      <p className="loading-message">
        Stiamo preparando tutto per te
      </p>
    </div>
  );
};

export default LoadingIndicator;