import { Link } from "react-router-dom";
import "./ActionButton.css";

const ActionButton = ({
  onClick,
  href,
  to,
  children,
  className = "",
  disabled = false,
}) => {
  const classes = `btn btn-success btn-sm button-cards rounded-pill px-3 py-1 d-flex align-items-center gap-2 small fw-medium ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        aria-disabled={disabled}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      className={classes}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActionButton;