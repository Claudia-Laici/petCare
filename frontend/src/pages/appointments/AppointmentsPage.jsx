import { useState } from "react";
import { Alert } from "react-bootstrap";
import { CalendarEvent, Plus } from "react-bootstrap-icons";
import { apiFetch } from "../../utils/apiFetch";
import {
  getAppointmentDate,
  groupByLabel,
  hasValidDate,
  pastLabel,
  startOfDay,
  upcomingLabel,
} from "../../utils/appointmentDates";
import { useFetch } from "../../hooks/useFetch";
import { useAppointments } from "../../hooks/useAppointments";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import LoadingIndicator from "../../components/shared/loadingIndicator/LoadingIndicator";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import ConfirmDeleteModal from "../../components/shared/confirmDeleteModal/ConfirmDeleteModal";
import AppointmentRow from "../../components/appointments/appointmentRow/AppointmentRow";
import AppointmentFormModal from "../../components/appointments/appointmentFormModal/AppointmentFormModal";
import AppointmentShareModal from "../../components/appointments/appointmentShareModal/AppointmentShareModal";
import PageTabs from "../../components/shared/pageComponents/pageTabs/PageTabs";
import PetFilter from "../../components/shared/pageComponents/petFilter/PetFilter";
import EmptyState from "../../components/shared/pageComponents/emptyState/EmptyState";
import "./AppointmentsPage.css";

const PAGE_SIZE = 8;

const EMPTY_TEXTS = {
  none: {
    title: "Nessun appuntamento presente",
    message: "Non hai ancora appuntamenti registrati.",
  },
  upcoming: {
    title: "Nessun appuntamento in arrivo",
    message:
      "Non ci sono appuntamenti in programma per gli animali selezionati.",
  },
  past: {
    title: "Nessun appuntamento passato",
    message: "Non risultano appuntamenti passati per gli animali selezionati.",
  },
};

const AppointmentsPage = () => {
  const [tab, setTab] = useState("upcoming");
  const [selectedPet, setSelectedPet] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const openModal =
    (setShow) =>
    (appointment = null) => {
      setSelectedAppointment(appointment);
      setShow(true);
    };

  const handleCreate = openModal(setShowFormModal);
  const handleEdit = openModal(setShowFormModal);
  const handleShare = openModal(setShowShareModal);
  const handleDelete = openModal(setShowDeleteModal);

  const deleteAppointment = async () => {
    await apiFetch(`/appointments/${selectedAppointment._id}`, {
      method: "DELETE",
    });
    await refetch();
  };

  const resetPaging = () => setVisibleCount(PAGE_SIZE);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    resetPaging();
  };

  const changePet = (petId) => {
    setSelectedPet(petId);
    resetPaging();
  };

  if (appointmentsLoading || petsLoading) return <LoadingIndicator />;

  const error = appointmentsError || petsError;

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

  const canEdit = (appointment) =>
    ["owner", "editor"].includes(petsById[appointment.pet]?.role);

  const todayStart = startOfDay(new Date());

  const petAppointments = appointmentList
    .filter(hasValidDate)
    .filter((a) => selectedPet === "all" || a.pet === selectedPet)
    .map((a) => ({
      ...a,
      petName: petsById[a.pet]?.name ?? "Animale non disponibile",
    }));

  const upcoming = petAppointments
    .filter((a) => getAppointmentDate(a) >= todayStart)
    .sort((a, b) => getAppointmentDate(a) - getAppointmentDate(b));

  const past = petAppointments
    .filter((a) => getAppointmentDate(a) < todayStart)
    .sort((a, b) => getAppointmentDate(b) - getAppointmentDate(a));

  const isUpcomingTab = tab === "upcoming";
  const currentList = isUpcomingTab ? upcoming : past;
  const visibleList = currentList.slice(0, visibleCount);
  const remaining = currentList.length - visibleList.length;
  const groups = groupByLabel(visibleList, (appointment) =>
    (isUpcomingTab ? upcomingLabel : pastLabel)(
      getAppointmentDate(appointment),
    ),
  );

  const emptyKey = appointmentList.length === 0 ? "none" : tab;

  return (
    <PageLayout
      title="Appuntamenti"
      description="Tieni sotto controllo visite, controlli e impegni dei tuoi animali."
      className="appointments-page"
      contentClassName="appointments-content"
      action={
        <ActionButton onClick={() => handleCreate()}>
          <Plus size={16} />
          Aggiungi appuntamento
        </ActionButton>
      }
      toolbar={
        <div className="appointments-toolbar">
          <div className="appointments-tabs">
            <PageTabs
              items={[
                { key: "upcoming", label: "In arrivo", count: upcoming.length },
                { key: "past", label: "Passati", count: past.length },
              ]}
              activeKey={tab}
              onChange={changeTab}
            />
          </div>

          <PetFilter
            pets={petList}
            selectedPet={selectedPet}
            onChange={changePet}
            className="appointments-pet-select"
          />
        </div>
      }
    >
      {groups.length === 0 ? (
        <EmptyState
          icon={<CalendarEvent size={30} />}
          {...EMPTY_TEXTS[emptyKey]}
        />
      ) : (
        <div className="appointments-feed">
          {groups.map(({ label, items }) => (
            <section key={label} className="appointments-group">
              <div className="appointments-group-header">
                <h2 className="appointments-group-title">{label}</h2>
              </div>

              {items.map((appointment) => (
                <AppointmentRow
                  key={appointment._id}
                  appointment={appointment}
                  isPast={!isUpcomingTab}
                  canEdit={canEdit(appointment)}
                  onEdit={handleEdit}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
            </section>
          ))}

          {remaining > 0 && (
            <button
              type="button"
              className="appointments-more"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Mostra altri {Math.min(remaining, PAGE_SIZE)}
            </button>
          )}
        </div>
      )}

      <AppointmentFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        pets={petList}
        appointment={selectedAppointment}
        onSaved={refetch}
      />

      <AppointmentShareModal
        key={selectedAppointment?._id}
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        appointment={selectedAppointment}
      />

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Elimina appuntamento"
        itemName={selectedAppointment?.title}
        onConfirm={deleteAppointment}
      />
    </PageLayout>
  );
};

export default AppointmentsPage;
