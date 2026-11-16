import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Card, Container, Spinner } from "react-bootstrap";
import {
  TelephoneFill,
  HouseFill,
  HeartPulse,
  ExclamationTriangle,
  Capsule,
  Cpu,
  InfoCircle,
} from "react-bootstrap-icons";
import { apiFetch } from "../../utils/apiFetch";
import { SPECIES, SEX } from "../../constants/pets";
import ActionButtontton from "../shared/actionButton/ActionButton";
import "../../styles/variables.css"
import "./PublicPet.css";

const SECTIONS = [
  { key: "conditions", title: "Condizioni mediche", icon: HeartPulse },
  { key: "allergies", title: "Allergie", icon: ExclamationTriangle },
  { key: "therapies", title: "Terapie in corso", icon: Capsule },
];

const ERRORS = {
  notfound:
    "Questo QR non è più valido. Il proprietario potrebbe averlo disattivato o sostituito.",
  error: "Impossibile caricare la scheda. Riprova tra un momento.",
};

const MAX_THERAPIES = 3;

const HealthSection = ({ icon: Icon, title, items, isTherapy }) => {
  const [showAll, setShowAll] = useState(false);
  const visible = isTherapy && !showAll ? items.slice(0, MAX_THERAPIES) : items;

  return (
    <section className="py-3 my-3 border-top">
      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="public-page-icon d-flex align-items-center justify-content-center rounded-3 text-brand">
          <Icon />
        </span>
        <h2 className="h6 fw-semibold mb-0">{title}</h2>
      </div>

      {items.length === 0 ? (
        <p className="text-secondary small mb-0">
          Nessuna informazione registrata.
        </p>
      ) : (
        <>
          <ul
            className={
              isTherapy
                ? "list-unstyled mb-0"
                : "ps-4 mb-0 small text-secondary"
            }
          >
            {visible.map((item, i) => (
              <li
                key={item._id ?? `${title}-${i}`}
                className={isTherapy ? "mb-2" : ""}
              >
                {isTherapy ? (
                  <>
                    <strong className="d-block">{item.name}</strong>
                    <span className="text-muted small">
                      {[item.dosage, item.frequency]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </>
                ) : (
                  item
                )}
              </li>
            ))}
          </ul>

          {isTherapy && items.length > MAX_THERAPIES && (
            <Button
              variant="link"
              className="p-0 mt-2 text-success text-decoration-none fw-semibold"
              onClick={() => setShowAll((prev) => !prev)}
            >
              {showAll
                ? "Mostra meno"
                : `Visualizza tutte le terapie (${items.length})`}
            </Button>
          )}
        </>
      )}
    </section>
  );
};

const PublicPet = () => {
  const { qrToken } = useParams();
  const [pet, setPet] = useState(null);
  const [request, setRequest] = useState({
    token: qrToken,
    status: "loading",
  });

  useEffect(() => {
    let ignore = false;

    apiFetch(`/public/pets/${qrToken}`)
      .then((data) => {
        if (ignore) return;

        setPet(data);
        setRequest({ token: qrToken, status: "ok" });
      })
      .catch((err) => {
        if (ignore) return;

        setRequest({
          token: qrToken,
          status: err.status === 404 ? "notfound" : "error",
        });
      });

    return () => {
      ignore = true;
    };
  }, [qrToken]);
  const status = request.token === qrToken ? request.status : "loading";

  if (status !== "ok") {
    return (
      <main className="public-page-main min-vh-100 d-flex flex-column align-items-center justify-content-center gap-3 px-3">
        {status === "loading" ? (
          <>
            <Spinner animation="border" className="text-brand" />
            <p className="text-secondary small mb-0">
              Caricamento delle informazioni...
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

  const sections = SECTIONS.filter(({ key }) => Array.isArray(pet[key]));
  const details = [
    SPECIES[pet.species] ?? pet.species,
    pet.breed,
    SEX[pet.sex],
  ].filter(Boolean);

  return (
    <main className="public-page-main">
      <Container className="public-page-container pb-5 pt-5">
        <Card className="border-0 rounded-4 overflow-hidden">
          <div className="public-page-hero">
            {pet.cover ? (
              <img className="img-cover" src={pet.cover} alt={pet.name} />
            ) : (
              <HouseFill />
            )}
          </div>

          <Card.Body className="p-4">
            <div className="public-page-identity text-center mb-4">
              <span className="public-page-label d-block fw-bold text-brand mb-2">
                SCHEDA IDENTIFICATIVA
              </span>

              <h1 className="fw-bold mb-2">{pet.name}</h1>

              <div className="d-flex flex-wrap justify-content-center gap-2">
                {details.map((d) => (
                  <span
                    key={d}
                    className="public-page-chip badge rounded-pill fw-normal px-3 py-2"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="row g-4">
              <div className="col-lg-4">
                {pet.message && (
                  <div className="public-page-message d-flex gap-2 p-3 mb-3 rounded-3">
                    <InfoCircle className="flex-shrink-0 mt-1" />
                    <p className="mb-0">{pet.message}</p>
                  </div>
                )}

                {pet.microchipNumber && (
                  <div className="d-flex align-items-center gap-3 p-3 border rounded-3 text-brand">
                    <Cpu className="fs-4" />
                    <div className="d-flex flex-column">
                      <span className="small text-secondary">
                        Numero microchip
                      </span>
                      <strong className="text-dark text-break">
                        {pet.microchipNumber}
                      </strong>
                    </div>
                  </div>
                )}

                {pet.contactPhone && (
                  <div className="public-page-cta-wrap mt-3">
                    <ActionButtontton
                      href={`tel:${pet.contactPhone.replace(/\s/g, "")}`}
                      className="w-100 justify-content-center py-3 border-0"
                    >
                      <TelephoneFill />
                      Chiama il proprietario
                    </ActionButtontton>
                  </div>
                )}
              </div>

              <div className="col-lg-8">
                {sections.length > 0 && (
                  <div className="public-page-health bg-light rounded-4 p-4">
                    <h2 className="h6 fw-bold d-flex align-items-center gap-2 mb-3 text-brand">
                      <HeartPulse />
                      Informazioni sanitarie
                    </h2>

                    {sections.map(({ key, ...rest }) => (
                      <HealthSection
                        key={key}
                        items={pet[key]}
                        isTherapy={key === "therapies"}
                        {...rest}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="d-flex align-items-center justify-content-center gap-2 mt-4 pt-3 border-top small text-secondary">
              <HouseFill className="text-brand" />
              <span>Informazioni condivise tramite PetCare</span>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </main>
  );
};

export default PublicPet;
