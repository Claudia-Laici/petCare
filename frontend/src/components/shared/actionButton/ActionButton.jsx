import { Link } from "react-router-dom";
import "./ActionButton.css";

const ActionButton = ({
  onClick,
  href,
  to,
  children,
  className = "",
  disabled = false,
  type = "button",
}) => {
  const classes = `
    btn btn-sm button-cards rounded-pill
    px-3 py-1 d-flex align-items-center gap-2
    small fw-medium
    ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  if (to) {
    return (
      <Link
        to={disabled ? "#" : to}
        className={classes}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (event) => event.preventDefault() : onClick}
      >
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        className={classes}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? (event) => event.preventDefault() : onClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default ActionButton;
