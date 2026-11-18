import { useState } from "react";
import { Alert, Col, Row, Form } from "react-bootstrap";
import { CalendarEvent, Clock, CheckCircle, Plus } from "react-bootstrap-icons";
import { useFetch } from "../../hooks/useFetch";
import { useAppointments } from "../../hooks/useAppointments";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import LoadingIndicator from "../../components/shared/loadingIndicator/LoadingIndicator";
import PageStats from "../../components/shared/pageStats/PageStats";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import AppointmentCard from "../../components/appointments/appointmentCard/AppointmentCard";
import AppointmentFormModal from "../../components/appointments/appointmentFormModal/AppointmentFormModal";
import AppointmentShareModal from "../../components/appointments/appointmentShareModal/AppointmentShareModal";
import { APPOINTMENT_STATUSES } from "../../constants/appointments";
import "./AppointmentsPage.css";

const AppointmentsPage = () => {
  const [selectedPet, setSelectedPet] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const {
    appointments,
    isLoading: appointmentsLoading,
    error: appointmentsError,
    refetch,
  } = useAppointments();

  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
  } = useFetch("/pets");

  const handleCreateAppointment = () => {
    setSelectedAppointment(null);
    setShowAppointmentModal(true);
  };

  const handleEditAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowAppointmentModal(true);
  };

  const handleShareAppointment = (appointment) => {
    setSelectedAppointment(appointment);
    setShowShareModal(true);
  };

  const error = appointmentsError || petsError;

  if (appointmentsLoading || petsLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <PageLayout title="Appuntamenti">
        <Alert variant="danger">
          {error.message || "Impossibile caricare gli appuntamenti."}
        </Alert>
      </PageLayout>
    );
  }

  const petList = Array.isArray(pets) ? pets : [];
  const appointmentList = Array.isArray(appointments) ? appointments : [];

  const petsById = Object.fromEntries(petList.map((pet) => [pet._id, pet]));

  const canEditAppointment = (appointment) =>
    ["owner", "editor"].includes(petsById[appointment.pet]?.role);

  const filteredAppointments = appointmentList
    .filter(
      (appointment) =>
        (selectedPet === "all" || appointment.pet === selectedPet) &&
        (selectedStatus === "all" || appointment.status === selectedStatus),
    )
    .map((appointment) => ({
      ...appointment,
      petName: petsById[appointment.pet]?.name ?? "Animale non disponibile",
    }));

  const countByStatus = (status) =>
    appointmentList.filter((appointment) => appointment.status === status)
      .length;

  const stats = [
    {
      id: "total",
      label: "Appuntamenti totali",
      value: appointmentList.length,
      icon: <CalendarEvent size={20} className="icon-appointments" />,
    },
    {
      id: "scheduled",
      label: "In programma",
      value: countByStatus("scheduled"),
      icon: <Clock size={20} className="icon-appointments" />,
    },
    {
      id: "completed",
      label: "Completati",
      value: countByStatus("completed"),
      icon: <CheckCircle size={20} className="icon-appointments" />,
    },
  ];

  return (
    <PageLayout
      title="Appuntamenti"
      description="Gestisci gli appuntamenti dei tuoi animali."
      stats={<PageStats stats={stats} />}
      action={
        <ActionButton onClick={handleCreateAppointment}>
          <Plus size={16} />
          Nuovo appuntamento
        </ActionButton>
      }
    >
      <div className="mb-4">
        <Row className="g-3">
          <Col xs={12} md={6}>
            <Form.Group controlId="filterPet">
              <Form.Label className="fw-semibold small">
                Filtra per animale
              </Form.Label>

              <Form.Select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                className="rounded-3 border-0 shadow-sm"
              >
                <option value="all">Tutti gli animali</option>
                {petList.map((pet) => (
                  <option key={pet._id} value={pet._id}>
                    {pet.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group controlId="filterStatus">
              <Form.Label className="fw-semibold small">
                Filtra per stato
              </Form.Label>

              <Form.Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-3 border-0 shadow-sm"
              >
                <option value="all">Tutti gli stati</option>
                {Object.entries(APPOINTMENT_STATUSES).map(
                  ([value, { label }]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ),
                )}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {filteredAppointments.length === 0 ? (
        <Alert variant="info">
          {appointmentList.length === 0
            ? "Non hai ancora appuntamenti registrati."
            : "Nessun appuntamento trovato con i filtri selezionati."}
        </Alert>
      ) : (
        <Row className="g-3">
          {filteredAppointments.map((appointment) => (
            <Col xs={12} key={appointment._id}>
              <AppointmentCard
                appointment={appointment}
                canEdit={canEditAppointment(appointment)}
                onEdit={handleEditAppointment}
                onShare={handleShareAppointment}
              />
            </Col>
          ))}
        </Row>
      )}

      <AppointmentFormModal
        show={showAppointmentModal}
        onHide={() => setShowAppointmentModal(false)}
        pets={petList}
        appointment={selectedAppointment}
        onSaved={() => refetch()}
      />
      
      <AppointmentShareModal
        key={selectedAppointment?._id}
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        appointment={selectedAppointment}
      />
    </PageLayout>
  );
};

export default AppointmentsPage;