import { parseDate } from "../../../utils/dateUtils";
import VaccinationItemCard from "./vaccinationItemCard/VaccinationItemCard";

const VaccinationRow = ({ vaccination, isHistory, ...cardProps }) => {
  const date = parseDate(
    vaccination.nextDueDate || vaccination.dateAdministered,
  );

  const isValidDate = date && !Number.isNaN(date.getTime());

  return (
    <div className={`vaccinations-row ${isHistory ? "is-past" : ""}`}>
      <div className="vaccinations-badge" aria-hidden="true">
        {isValidDate ? (
          <>
            <span>
              {date.toLocaleDateString("it-IT", {
                weekday: "short",
              })}
            </span>

            <strong>{date.getDate()}</strong>

            <span>
              {date.toLocaleDateString("it-IT", {
                month: "short",
              })}
            </span>
          </>
        ) : (
          <strong>—</strong>
        )}
      </div>

      <VaccinationItemCard
        vaccination={vaccination}
        {...cardProps}
      />
    </div>
  );
};

export default VaccinationRow;
