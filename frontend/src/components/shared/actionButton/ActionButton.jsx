import "./ActionButton.css";

const CardActionButton = ({
  onClick,
  href,
  children,
  className = "",
  disabled = false,
}) => {
  const classes = `btn btn-success btn-sm button-cards rounded-pill px-3 py-1 d-flex align-items-center gap-2 small fw-medium ${className}`;

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

export default CardActionButton;