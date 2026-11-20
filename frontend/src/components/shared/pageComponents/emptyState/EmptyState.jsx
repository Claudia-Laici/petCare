import "./EmptyState.css";

const EmptyState = ({
  icon,
  title,
  message,
  action,
  className = "",
}) => {
  return (
    <div className={`page-empty-state ${className}`}>
      {icon && (
        <div className="page-empty-state-icon">
          {icon}
        </div>
      )}

      {title && <h3>{title}</h3>}

      {message && <p>{message}</p>}

      {action && (
        <div className="page-empty-state-action">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;