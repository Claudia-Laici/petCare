const StatusBadge = ({ status }) => (
  <span
    className={`badge text-nowrap bg-${status.variant} bg-opacity-10 text-${status.variant} rounded-pill px-3 py-2 fw-normal small`}
  >
    {status.label}
  </span>
);

export default StatusBadge;