import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Alert, Container, Card, Form, Row, Col } from "react-bootstrap";
import { ArrowLeft, Save } from "react-bootstrap-icons";
import { useFetch } from "../../../hooks/useFetch";
import { usePetQr } from "../../../hooks/usePetQr";
import LoadingIndicator from "../../shared/loadingIndicator/LoadingIndicator";
import ActionButtontton from "../../shared/actionButton/ActionButton";
import "./QrSettings.css";

const SHARE_GROUPS = [
  {
    key: "pet",
    title: "Informazioni dell'animale",
    fillPath: (petId) => `/pets/${petId}/health`,
    items: [
      { key: "photo", label: "Foto" },
      { key: "breed", label: "Razza" },
      { key: "sex", label: "Sesso" },
      { key: "microchip", label: "Numero microchip" },
    ],
  },
  {
    key: "health",
    title: "Informazioni sanitarie",
    fillPath: (petId) => `/pets/${petId}/health`,
    description:
      "Gestisci le condizioni mediche, le allergie e le terapie da rendere disponibili tramite QR.",
    items: [
      { key: "conditions", label: "Condizioni mediche" },
      { key: "allergies", label: "Allergie" },
      { key: "therapies", label: "Terapie" },
    ],
  },
];

const Notice = ({ variant, children }) => (
  <Container className="py-4">
    <Alert variant={variant}>{children}</Alert>
  </Container>
);

const QrSettings = () => {
  const { petId } = useParams();
  const { data: pets, error, isLoading } = useFetch("/pets");

  const pet = Array.isArray(pets) ? pets.find((p) => p._id === petId) : null;
  const isOwner = pet?.role === "owner";

  const { qr, loading, updateSettings } = usePetQr(isOwner ? petId : null);

  if (isLoading || (isOwner && loading)) return <LoadingIndicator />;

  if (error) {
    return (
      <Notice variant="danger">
        Impossibile caricare i dati dell'animale.
      </Notice>
    );
  }

  if (!isOwner) {
    return (
      <Notice variant="danger">
        Non hai i permessi per modificare queste impostazioni.
      </Notice>
    );
  }

  if (!qr?.qrEnabled) {
    return (
      <Notice variant="info">
        Attiva prima il QR per configurare le informazioni da condividere.
      </Notice>
    );
  }

  return <QrSettingsForm pet={pet} qr={qr} onSave={updateSettings} />;
};

const QrSettingsForm = ({ pet, qr, onSave }) => {
  const navigate = useNavigate();

  const backPath = `/?pet=${pet._id}`;

  const [form, setForm] = useState({
    share: qr.share ?? {},
    message: qr.message ?? "",
    contactPhone: qr.contactPhone ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handleToggle = (key) => (event) => {
    const { checked } = event.target;
    setForm((prev) => ({ ...prev, share: { ...prev.share, [key]: checked } }));
  };

  const handleField = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const missingPhone = form.share.contact && !form.contactPhone.trim();

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");

    const share = Object.fromEntries(
      Object.entries(form.share).map(([key, value]) => [
        key,
        Boolean(value) && qr.available?.[key] !== false,
      ]),
    );

    try {
      await onSave({ ...form, share });
      navigate(backPath);
    } catch (e) {
      setSaveError(e.message || "Impossibile salvare le impostazioni.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container className="py-4 qr-settings-container">
      <div className="d-flex flex-column flex-sm-row justify-content-between gap-3 mb-4">
        <div className="order-2 order-sm-1">
          <h2 className="fw-bold mb-1">Impostazioni QR</h2>
          <p className="text-muted mb-0">
            Scegli quali informazioni di {pet.name} condividere.
          </p>
        </div>

        <div className="order-1 order-sm-2">
          <ActionButtontton onClick={() => navigate(backPath)} className="py-2">
            <ArrowLeft size={16} />
            Torna alla dashboard
          </ActionButtontton>
        </div>
      </div>

      {saveError && <Alert variant="danger">{saveError}</Alert>}

      <Row className="g-4">
        <Col xs={12} lg={7}>
          <Card className="border-0 shadow-sm rounded-4 p-4">
            {SHARE_GROUPS.map((group) => (
              <section key={group.key} className="mb-4">
                <h5 className="fw-semibold mb-3">{group.title}</h5>

                {group.description && (
                  <p className="text-muted small mb-3">{group.description}</p>
                )}

                {group.items.map(({ key, label }) => {
                  const empty = qr.available?.[key] === false;

                  return (
                    <div key={key} className="mb-3">
                      <Form.Check
                        type="switch"
                        id={`share-${key}`}
                        label={label}
                        disabled={empty}
                        checked={Boolean(form.share[key]) && !empty}
                        onChange={handleToggle(key)}
                      />

                      {empty && group.key === "pet" && (
                        <Link
                          to={group.fillPath(pet._id)}
                          className="small text-decoration-none"
                        >
                          Completa questa informazione
                        </Link>
                      )}
                    </div>
                  );
                })}

                {group.key === "health" && (
                  <div className="mt-3 p-3 rounded-3 bg-light">
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                      <div>
                        <div className="fw-semibold">
                          Gestisci la scheda sanitaria
                        </div>
                        <div className="small text-muted">
                          Completa e seleziona le informazioni da condividere.
                        </div>
                      </div>

                      <ActionButtontton
                        href={group.fillPath(pet._id)}
                        className="py-2"
                      >
                        Apri scheda sanitaria
                      </ActionButtontton>
                    </div>
                  </div>
                )}

                <hr />
              </section>
            ))}

            <h5 className="fw-semibold mb-3">Contatti</h5>

            <Form.Check
              type="switch"
              id="share-contact"
              label="Mostra il contatto telefonico"
              checked={Boolean(form.share.contact)}
              onChange={handleToggle("contact")}
              className="mb-3"
            />

            <Form.Group className="mb-3" controlId="qr-phone">
              <Form.Label className="fw-medium">Numero di telefono</Form.Label>
              <Form.Control
                name="contactPhone"
                type="tel"
                maxLength={30}
                placeholder="Inserisci il numero di telefono"
                value={form.contactPhone}
                onChange={handleField}
                isInvalid={missingPhone}
              />
              <Form.Control.Feedback type="invalid">
                Inserisci un numero, altrimenti il contatto non verrà mostrato.
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Verrà mostrato soltanto se attivi la condivisione del contatto.
              </Form.Text>
            </Form.Group>

            <hr />

            <Form.Group controlId="qr-message">
              <Form.Label className="h5 fw-semibold mb-3">
                Messaggio personalizzato
              </Form.Label>
              <Form.Control
                name="message"
                as="textarea"
                rows={3}
                maxLength={300}
                placeholder="Inserisci un messaggio per chi trova il tuo animale..."
                value={form.message}
                onChange={handleField}
              />
              <div className="text-end text-muted small mt-1">
                {form.message.length}/300
              </div>
            </Form.Group>

            <div className="d-flex justify-content-end mt-4">
              <ActionButtontton
                onClick={handleSave}
                disabled={saving || missingPhone}
                className="py-2"
              >
                <Save size={16} />
                {saving ? "Salvataggio..." : "Salva modifiche"}
              </ActionButtontton>
            </div>
          </Card>
        </Col>

        <Col xs={12} lg={5}>
          <Card className="border-0 shadow-sm rounded-4 p-4">
            <h5 className="fw-semibold mb-3">
              Informazioni sulla condivisione
            </h5>
            <p className="text-muted mb-0">
              Le informazioni attivate saranno visibili pubblicamente a chiunque
              scansioni il QR code di {pet.name}. Disattiva le informazioni che
              non desideri rendere disponibili.
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QrSettings;
