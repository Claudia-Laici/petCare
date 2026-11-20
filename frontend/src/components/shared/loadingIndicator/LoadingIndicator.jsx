import Spinner from "react-bootstrap/Spinner";
import Logo from "../../../assets/logo/LogoPetCare.png";
import "./LoadingIndicator.css";

const LoadingIndicator = () => {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <img src={Logo} alt="PetCare" className="logo-img" />

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