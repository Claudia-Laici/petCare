import { Container, Row, Col } from "react-bootstrap";
import { ExclamationCircle } from "react-bootstrap-icons";
import ActionButtontton from "../../../components/shared/actionButton/ActionButton";
import "./NotFound.css";

const NotFound = () => {
  return (
    <main className="not-found-page min-vh-100 d-flex align-items-center">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="not-found-card text-center p-4 p-md-5">
              <div className="not-found-icon d-flex align-items-center justify-content-center mx-auto mb-3 rounded-circle fs-2">
                <ExclamationCircle />
              </div>

              <span className="not-found-code d-block display-4 fw-bold mb-3">
                404
              </span>

              <h1 className="fs-4 fw-semibold mb-2">Ops! Pagina non trovata</h1>

              <p className="mb-4">
                La pagina che stai cercando non esiste oppure è stata spostata.
              </p>
              <div className="d-flex justify-content-center">
                <ActionButtontton to="/">Torna alla home</ActionButtontton>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default NotFound;
