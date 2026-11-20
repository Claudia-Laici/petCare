import { Button } from "react-bootstrap";
import "./GoogleButton.css"

const GoogleButton = ({ label = "Continua con Google" }) => {
  const handleClick = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <Button
       className="w-100 d-flex align-items-center justify-content-center gap-2 py-2 google-button"
      onClick={handleClick}
    >
      <img
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
        alt=""
        width="18"
        height="18"
      />
      <span>{label}</span>
    </Button>
  );
};

export default GoogleButton;
