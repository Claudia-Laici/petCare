import { Container, Row, Col } from "react-bootstrap";
import VaccinationsCard from "../../cards/vaccinations/VaccinationsCard";
import TherapiesCard from "../../cards/therapies/TherapiesCard";
import RecentDocumentsCard from "../../cards/recentDocument/RecentDocumentsCard";
import SharedWithCard from "../../cards/sharedWith/SharedWithCard";

const DashboardSections = ({
  petId,
  isOwner = false,
  petVaccinations = [],
  vaccinationsLoading = false,
  onAddVaccination,
  petTherapies = [],
  therapiesLoading = false,
  onAddTherapy,
  petSharedWith = [],
  sharesLoading = false,
  onInvite,
  petDocuments = [],
  documentsLoading = false,
  onUploadDocument,
}) => {
  return (
    <Container fluid className="px-0 mt-4">
      <Row className="g-4">
        <Col xs={12} lg={6}>
          <VaccinationsCard
            vaccinations={petVaccinations}
            isLoading={vaccinationsLoading}
            petId={petId}
            onAddClick={onAddVaccination}
          />
        </Col>

        <Col xs={12} lg={6}>
          <TherapiesCard
            therapies={petTherapies}
            isLoading={therapiesLoading}
            petId={petId}
            onAddClick={onAddTherapy}
          />
        </Col>

        <Col xs={12} lg={6}>
          <RecentDocumentsCard
            documents={petDocuments}
            isLoading={documentsLoading}
            onUploadClick={onUploadDocument}
          />
        </Col>

        {isOwner && (
          <Col xs={12} lg={6}>
            <SharedWithCard
              sharedWith={petSharedWith}
              isLoading={sharesLoading}
              onInviteClick={onInvite}
            />
          </Col>
        )}
      </Row>
    </Container>
  );
};

export default DashboardSections;