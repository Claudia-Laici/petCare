import { getAppointmentDate } from "../../../utils/appointmentDates";
import AppointmentCard from "../appointmentCard/AppointmentCard";

const AppointmentRow = ({ appointment, isPast, ...cardProps }) => {
  const date = getAppointmentDate(appointment);

  return (
    <div className={`appointments-row ${isPast ? "is-past" : ""}`}>
      <div className="appointments-badge" aria-hidden="true">
        <span>{date.toLocaleDateString("it-IT", { weekday: "short" })}</span>
        <strong>{date.getDate()}</strong>
        <span>{date.toLocaleDateString("it-IT", { month: "short" })}</span>
      </div>

      <AppointmentCard appointment={appointment} {...cardProps} />
    </div>
  );
};

export default AppointmentRow;