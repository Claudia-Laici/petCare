import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Spinner, Card, Container } from "react-bootstrap";
import { CalendarEvent, GeoAlt, PersonBadge } from "react-bootstrap-icons";
import { apiFetch } from "../../utils/apiFetch";
import { formatDateTime } from "../../utils/formatDate";
import { FIELD_LABELS } from "../../constants/appointments";

const ERRORS = {
  notfound: "Questo link non è più valido o è scaduto.",
  error: "Impossibile caricare l'appuntamento. Riprova tra un momento.",
};

const AppointmentDetail = ({ label, value }) => {
  if (!value) return null;

  return (
    <div className="mb-3">
      <span className="d-block small text-secondary mb-1">{label}</span>
      <p className="mb-0 fw-medium">{value}</p>
    </div>
  );
};

const DetailSection = ({ icon, title, children }) => (
  <section className="border-top pt-4 mt-4">
    <div className="d-flex align-items-center gap-2 mb-3">
      <span className="public-page-icon d-flex align-items-center justify-content-center rounded-3 text-brand">
        {icon}
      </span>
      <h2 className="h6 fw-semibold mb-0">{title}</h2>
    </div>

    {children}
  </section>
);

const PublicAppointmentPage = () => {
  const { token } = useParams();

  const [request, setRequest] = useState({
    token,
    status: "loading",
    data: null,
  });

  useEffect(() => {
    let ignore = false;

    apiFetch(`/public/appointments/${token}`)
      .then((data) => {
        if (!ignore) setRequest({ token, status: "ok", data });
      })
      .catch((err) => {
        if (ignore) return;

        setRequest({
          token,
          status: err.status === 404 ? "notfound" : "error",
          data: null,
        });
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  const status = request.token === token ? request.status : "loading";
  const appointment = request.data;

  if (status !== "ok") {
    return (
      <main className="public-page-main min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 px-3">
        {status === "loading" ? (
          <>
            <Spinner animation="border" className="text-brand" />
            <p className="text-secondary small mb-0">
              Caricamento dell'appuntamento...
            </p>
          </>
        ) : (
          <Alert
            variant={status === "notfound" ? "warning" : "danger"}
            className="rounded-4 mb-0"
          >
            {ERRORS[status]}
          </Alert>
        )}
      </main>
    );
  }

  const { petName, startAt, endAt, location, veterinarian } = appointment;
  const { notes, vetQuestions, attendeeInstructions } = appointment;

  return (
    <main className="public-page-main">
      <Container className="public-page-container pb-5 pt-5">
        <Card className="border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-4 p-md-5">
            <div className="text-center mb-4">
              <span className="d-block small fw-bold text-brand mb-2">
                APPUNTAMENTO CONDIVISO
              </span>

              <h1 className="h3 fw-bold mb-2">
                {petName
                  ? `Appuntamento per ${petName}`
                  : "Dettagli dell'appuntamento"}
              </h1>

              <p className="text-secondary small mb-0">
                Informazioni condivise tramite PetCare
              </p>
            </div>

            {(startAt || endAt) && (
              <DetailSection icon={<CalendarEvent />} title="Data e ora">
                <AppointmentDetail
                  label="Inizio"
                  value={formatDateTime(startAt)}
                />
                <AppointmentDetail label="Fine" value={formatDateTime(endAt)} />
              </DetailSection>
            )}

            {(location || veterinarian) && (
              <DetailSection icon={<GeoAlt />} title="Luogo e veterinario">
                <AppointmentDetail label="Luogo" value={location} />
                <AppointmentDetail label="Veterinario" value={veterinarian} />
              </DetailSection>
            )}

            {(notes || vetQuestions || attendeeInstructions) && (
              <DetailSection icon={<PersonBadge />} title="Altre informazioni">
                <AppointmentDetail label={FIELD_LABELS.notes} value={notes} />
                <AppointmentDetail
                  label={FIELD_LABELS.vetQuestions}
                  value={vetQuestions}
                />
                <AppointmentDetail
                  label={FIELD_LABELS.attendeeInstructions}
                  value={attendeeInstructions}
                />
              </DetailSection>
            )}
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default PublicAppointmentPage;
