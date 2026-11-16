import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Container } from "react-bootstrap";
import {
  HeartPulse,
  ExclamationTriangle,
  Save,
  ArrowLeft,
} from "react-bootstrap-icons";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../utils/apiFetch";
import LoadingIndicator from "../shared/loadingIndicator/LoadingIndicator";
import ActionButtontton from "../shared/actionButton/ActionButton";
import TagInput from "../shared/tagInput/TagInput";
import "./UpdateHealthCard.css";

const HealthCardPage = () => {
  const { petId } = useParams();

  const {
    data: card,
    isLoading,
    error,
  } = useFetch(`/pets/${petId}/health-card`);

  if (isLoading) return <LoadingIndicator />;

  if (error || !card) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          Impossibile caricare la scheda sanitaria.
        </Alert>
      </Container>
    );
  }

  return <HealthCardForm petId={petId} card={card} />;
};

const HealthCardForm = ({ petId, card }) => {
  const navigate = useNavigate();

  const [conditions, setConditions] = useState(card.medicalConditions ?? []);

  const [allergies, setAllergies] = useState(card.allergies ?? []);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    try {
      await apiFetch(`/pets/${petId}/health-card`, {
        method: "PATCH",
        body: {
          medicalConditions: conditions,
          allergies: allergies,
        },
      });

      navigate(-1);
    } catch (e) {
      setSaveError(e.message || "Impossibile salvare la scheda.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="health-card-page">
      <Container className="health-card-container py-4 py-md-5 px-3 px-sm-4">
        <header className="health-card-header mb-4 mb-md-5">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span className="health-card-eyebrow">PETCARE / SALUTE</span>

            <ActionButtontton onClick={() => navigate(-1)} className="py-2">
              <ArrowLeft size={16} />
              Indietro
            </ActionButtontton>
          </div>

          <div className="health-card-title d-flex align-items-start align-items-md-center gap-3">
            <div className="health-card-main-icon flex-shrink-0">
              <HeartPulse />
            </div>

            <div>
              <h1>Scheda sanitaria</h1>
              <p>
                Gestisci le informazioni sanitarie del tuo animale in un unico
                posto.
              </p>
            </div>
          </div>
        </header>

        {saveError && (
          <Alert variant="danger" className="rounded-3">
            {saveError}
          </Alert>
        )}

        <div className="health-card-intro d-flex justify-content-between align-items-center p-3 p-md-4">
          <div>
            <span className="health-card-intro-label">
              INFORMAZIONI IMPORTANTI
            </span>
            <h2>La salute del tuo pet</h2>
            <p>
              Inserisci le informazioni che potrebbero essere utili durante una
              visita veterinaria o in caso di emergenza.
            </p>
          </div>

          <HeartPulse className="health-card-intro-icon d-none d-sm-block" />
        </div>

        <div className="health-card-sections">
          <section className="health-card-box p-3 p-md-4">
            <div className="health-card-box-header">
              <div className="health-card-section-icon">
                <HeartPulse />
              </div>

              <div>
                <h2>Condizioni mediche</h2>
                <p>Patologie, disturbi o condizioni da segnalare.</p>
              </div>
            </div>

            <TagInput
              id="hc-conditions"
              label="Aggiungi una condizione"
              placeholder="Es. Problemi articolari"
              items={conditions}
              onChange={setConditions}
            />
          </section>

          <section className="health-card-box">
            <div className="health-card-box-header">
              <div className="health-card-section-icon allergy-icon">
                <ExclamationTriangle />
              </div>

              <div>
                <h2>Allergie</h2>
                <p>Allergie alimentari, ambientali o ad altre sostanze.</p>
              </div>
            </div>

            <TagInput
              id="hc-allergies"
              label="Aggiungi un'allergia"
              placeholder="Es. Polline"
              items={allergies}
              onChange={setAllergies}
            />
          </section>
        </div>

        <footer className="health-card-footer mt-4 pt-4 d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
          <span className="lh-sm">
            <HeartPulse />
            Le informazioni saranno disponibili nella scheda sanitaria.
          </span>

          <div className="align-self-end">
            <ActionButtontton
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2"
            >
              <Save />
              {saving ? "Salvataggio..." : "Salva modifiche"}
            </ActionButtontton>
          </div>
        </footer>
      </Container>
    </main>
  );
};

export default HealthCardPage;
