import { Button } from "react-bootstrap";
import { PencilFill, Trash3, Share } from "react-bootstrap-icons";
import "./IconActionButton.css";

const ICONS = {
  edit: PencilFill,
  delete: Trash3,
  share: Share,
};

const IconActionButton = ({
  action = "edit",
  onClick,
  label,
  className = "",
  disabled = false,
}) => {
  const Icon = ICONS[action];

  if (!Icon) return null;

  return (
    <Button
      variant="light"
      className={`icon-action-button icon-action-button-${action} ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
      disabled={disabled}
    >
      <Icon size={15} />
    </Button>
  );
};

export default IconActionButton;