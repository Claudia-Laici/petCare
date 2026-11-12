import { Container, Row, Col, Card } from "react-bootstrap";
import {
  ShieldCheck,
  CalendarEvent,
  Capsule,
  Folder,
} from "react-bootstrap-icons";
import VaccinationsCard from "../cards/vaccinations/VaccinationsCard";
import TherapiesCard from "../cards/therapies/TherapiesCard";
import RecentDocumentsCard from "../cards/recentDocument/RecentDocumentsCard";
import SharedWithCard from "../cards/sharedWith/SharedWithCard";
import MedicalDocumentModal from "../medicalDocumentModal/MedicalDocumentModal";
import VaccinationModal from "../cards/vaccinations/VaccinationModal";
import ShareModal from "../cards/sharedWith/ShareModal";
import TherapyModal from "../cards/therapies/TherapyModal";
import { usePetDashboard } from "../../hooks/usePetDashboard";
import "./DashboardCards.css";

const DashboardCards = ({ pet }) => {
  const {
    petId,
    isOwner,
    petVaccinations,
    petTherapies,
    petDocuments,
    petShares,
    loading,
    counts,
    modals,
    refetches,
  } = usePetDashboard(pet);

  if (!pet) return null;

  const stats = [
    {
      id: 1,
      count: counts.vaccinations,
      loading: loading.vaccinations,
      label: "Vaccinazioni registrate",
      icon: <ShieldCheck size={20} className="text-success" />,
      iconBg: "bg-success bg-opacity-10",
    },
    {
      id: 2,
      count: counts.upcomingDeadlines,
      loading: loading.vaccinations || loading.therapies,
      label: "Prossime scadenze",
      icon: <CalendarEvent size={20} className="text-warning" />,
      iconBg: "bg-warning bg-opacity-10",
    },
    {
      id: 3,
      count: counts.activeTherapies,
      loading: loading.therapies,
      label: "Terapie in corso",
      icon: <Capsule size={20} className="text-danger" />,
      iconBg: "bg-danger bg-opacity-10",
    },
    {
      id: 4,
      count: counts.documents,
      loading: loading.documents,
      label: "Documenti",
      icon: <Folder size={20} className="text-primary" />,
      iconBg: "bg-primary bg-opacity-10",
    },
  ];

  return (
    <Container className="px-0">
      <Row className="g-3">
        {stats.map((stat) => (
          <Col xs={6} xl={3} key={stat.id}>
            <Card className="border-0 shadow-sm rounded-4 p-3 h-100">
              <Card.Body className="p-1 d-flex flex-column">
                <div
                  className={`icon-dashboard d-inline-flex align-items-center justify-content-center rounded-3 mb-3 ${stat.iconBg}`}
                >
                  {stat.icon}
                </div>

                <div>
                  <h3 className="fw-bold mb-1 text-dark display-6 fs-3">
                    {stat.loading ? "—" : stat.count}
                  </h3>
                  <p className="text-secondary small fw-medium">{stat.label}</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-4 mt-4">
        <Col xs={12} lg={6}>
          <VaccinationsCard
            vaccinations={petVaccinations}
            isLoading={loading.vaccinations}
            petId={petId}
            onAddClick={() => modals.open("vaccination")}
          />
        </Col>

        <Col xs={12} lg={6}>
          <TherapiesCard
            therapies={petTherapies}
            isLoading={loading.therapies}
            petId={petId}
            onAddClick={() => modals.open("therapy")}
          />
        </Col>

        <Col xs={12} lg={6}>
          <RecentDocumentsCard
            documents={petDocuments}
            isLoading={loading.documents}
            onUploadClick={() => modals.open("document")}
          />
        </Col>

        {isOwner && (
          <Col xs={12} lg={6}>
            <SharedWithCard
              sharedWith={petShares}
              isLoading={loading.shares}
              onInviteClick={() => modals.open("share")}
            />
          </Col>
        )}
      </Row>

      <MedicalDocumentModal
        show={modals.activeModal === "document"}
        onHide={modals.close}
        petId={petId}
        onUploaded={refetches.documents}
      />

      <VaccinationModal
        show={modals.activeModal === "vaccination"}
        onHide={modals.close}
        petId={petId}
        onSaved={refetches.vaccinations}
      />

      <TherapyModal
        show={modals.activeModal === "therapy"}
        onHide={modals.close}
        petId={petId}
        onSaved={refetches.therapies}
      />

      <ShareModal
        show={modals.activeModal === "share"}
        onHide={modals.close}
        petId={petId}
        onSaved={refetches.shares}
      />
    </Container>
  );
};

export default DashboardCards;
