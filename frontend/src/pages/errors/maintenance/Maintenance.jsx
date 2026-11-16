import { Container, Card } from "react-bootstrap";
import { GearFill } from "react-bootstrap-icons";
import "./Maintenance.css";

const Maintenance = () => {
  return (
    <main className="maintenance-page min-vh-100 d-flex align-items-center justify-content-center p-3">
      <Container className="maintenance-container">
        <Card className="maintenance-card border-0 shadow-sm rounded-4 text-center p-4 p-md-5">

          <div className="maintenance-icon rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4">
            <GearFill />
          </div>

          <h2 className="maintenance-brand fw-bold mb-2">
            PetCare
          </h2>

          <h1 className="fs-3 fw-semibold mb-3">
            Stiamo migliorando qualcosa!
          </h1>

          <p className="text-muted mb-4">
            PetCare è temporaneamente offline per alcuni aggiornamenti.
            Stiamo lavorando per offrirti un'esperienza sempre migliore.
          </p>

          <div className="maintenance-message rounded-3 p-3 mb-4">
            <GearFill className="me-2" />
            Stiamo lavorando per tornare presto!
          </div>

          <small className="text-muted">
            Grazie per la pazienza.
          </small>

        </Card>
      </Container>
    </main>
  );
}

export default Maintenance;