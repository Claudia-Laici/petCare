import { useState } from "react";
import { Alert } from "react-bootstrap";
import { CalendarEvent, Plus } from "react-bootstrap-icons";
import { apiFetch } from "../../utils/apiFetch";
import { useFetch } from "../../hooks/useFetch";
import {
  getVaccinationState,
  getVaccinationSortTime,
  VACCINATION_STATUS,
} from "../../utils/vaccinationUtils";
import { groupByLabel } from "../../utils/appointmentDates";
import { useVaccinations } from "../../hooks/useVaccinations";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import LoadingIndicator from "../../components/shared/loadingIndicator/LoadingIndicator";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import ConfirmDeleteModal from "../../components/shared/confirmDeleteModal/ConfirmDeleteModal";
import VaccinationRow from "../../components/cards/vaccinations/VaccinationRow";
import VaccinationModal from "../../components/cards/vaccinations/VaccinationModal";
import PageTabs from "../../components/shared/pageComponents/pageTabs/PageTabs";
import PetFilter from "../../components/shared/pageComponents/petFilter/PetFilter";
import EmptyState from "../../components/shared/pageComponents/emptyState/EmptyState";
import { canEditPet, canDeletePet } from "../../utils/petPermissions";
import "./VaccinationsPage.css";

const PAGE_SIZE = 8;

const ACTIVE_STATES = ["expiring", "toAdminister", "expired"];
const HISTORY_STATES = ["upToDate", "single", "toDefine"];

const EMPTY_TEXTS = {
  none: {
    title: "Nessuna vaccinazione presente",
    message: "Non hai ancora vaccinazioni registrate.",
  },
  active: {
    title: "Nessun richiamo in programma",
    message:
      "Non ci sono vaccinazioni da effettuare o in scadenza per gli animali selezionati.",
  },
  history: {
    title: "Nessuna vaccinazione nello storico",
    message:
      "Non risultano vaccinazioni in regola o passate per gli animali selezionati.",
  },
};

const VaccinationsPage = () => {
  const [tab, setTab] = useState("active");
  const [selectedPet, setSelectedPet] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedVaccination, setSelectedVaccination] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    vaccinations,
    isLoading: vaccinationsLoading,
    error: vaccinationsError,
    refetch,
  } = useVaccinations();

  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
  } = useFetch("/pets");

  const openModal =
    (setShow) =>
    (vaccination = null) => {
      setSelectedVaccination(vaccination);
      setShow(true);
    };

  const handleCreate = openModal(setShowFormModal);
  const handleEdit = openModal(setShowFormModal);
  const handleDelete = openModal(setShowDeleteModal);

  const deleteVaccination = async () => {
    await apiFetch(`/vaccinations/${selectedVaccination._id}`, {
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

  if (vaccinationsLoading || petsLoading) {
    return <LoadingIndicator />;
  }

  const error = vaccinationsError || petsError;

  if (error) {
    return (
      <PageLayout title="Vaccinazioni">
        <Alert variant="danger">
          {error.message || "Impossibile caricare le vaccinazioni."}
        </Alert>
      </PageLayout>
    );
  }

  const petList = Array.isArray(pets) ? pets : [];
  const vaccinationList = Array.isArray(vaccinations) ? vaccinations : [];

  const petsById = Object.fromEntries(
    petList.map((pet) => [String(pet._id), pet]),
  );

  const getPetId = (vaccination) =>
    String(vaccination.pet?._id ?? vaccination.pet ?? "");

  const canEdit = (vaccination) =>
    canEditPet(petsById[getPetId(vaccination)]?.role);

  const canDelete = (vaccination) =>
    canDeletePet(petsById[getPetId(vaccination)]?.role);

  const canCreate =
    selectedPet === "all"
      ? petList.some((pet) => canEditPet(pet.role))
      : canEditPet(petsById[String(selectedPet)]?.role);

  const sortVaccinations = (a, b) => {
    const priorityA = VACCINATION_STATUS[a.state]?.priority ?? 99;
    const priorityB = VACCINATION_STATUS[b.state]?.priority ?? 99;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    return getVaccinationSortTime(a) - getVaccinationSortTime(b);
  };

  const petVaccinations = vaccinationList
    .filter(
      (vaccination) =>
        selectedPet === "all" || getPetId(vaccination) === String(selectedPet),
    )
    .map((vaccination) => ({
      ...vaccination,
      petName:
        petsById[getPetId(vaccination)]?.name ?? "Animale non disponibile",
      state: getVaccinationState(vaccination),
    }));

  const active = petVaccinations
    .filter((vaccination) => ACTIVE_STATES.includes(vaccination.state))
    .sort(sortVaccinations);

  const history = petVaccinations
    .filter((vaccination) => HISTORY_STATES.includes(vaccination.state))
    .sort(sortVaccinations);

  const isActiveTab = tab === "active";
  const currentList = isActiveTab ? active : history;
  const visibleList = currentList.slice(0, visibleCount);
  const remaining = currentList.length - visibleList.length;

  const groups = groupByLabel(
    visibleList,
    (vaccination) => VACCINATION_STATUS[vaccination.state]?.label ?? "Altro",
  );

  const emptyKey = vaccinationList.length === 0 ? "none" : tab;

  return (
    <PageLayout
      title="Vaccinazioni"
      description="Tieni sotto controllo le vaccinazioni e i richiami dei tuoi animali."
      className="vaccinations-page"
      contentClassName="vaccinations-content"
      action={
        canCreate && (
          <ActionButton onClick={() => handleCreate()}>
            <Plus size={16} />
            Aggiungi vaccinazione
          </ActionButton>
        )
      }
      toolbar={
        <div className="vaccinations-toolbar">
          <div className="vaccinations-tabs">
            <PageTabs
              items={[
                {
                  key: "active",
                  label: "Da gestire",
                  count: active.length,
                },
                {
                  key: "history",
                  label: "In regola / Storico",
                  count: history.length,
                },
              ]}
              activeKey={tab}
              onChange={changeTab}
            />
          </div>

          <PetFilter
            pets={petList}
            selectedPet={selectedPet}
            onChange={changePet}
            className="vaccinations-pet-select"
          />
        </div>
      }
    >
      {groups.length === 0 ? (
        <EmptyState
          icon={<CalendarEvent size={30} />}
          {...EMPTY_TEXTS[emptyKey]}
          action={
            isActiveTab &&
            canCreate && (
              <ActionButton onClick={() => handleCreate()}>
                <Plus size={16} />
                Aggiungi una vaccinazione
              </ActionButton>
            )
          }
        />
      ) : (
        <div className="vaccinations-feed">
          {groups.map(({ label, items }, index) => (
            <section key={label} className="vaccinations-group">
              <div className="vaccinations-group-header">
                <h2 className="vaccinations-group-title">{label}</h2>

                {isActiveTab && canCreate && index === 0 && (
                  <ActionButton className="py-2" onClick={() => handleCreate()}>
                    <Plus size={16} />
                    Nuova vaccinazione
                  </ActionButton>
                )}
              </div>

              {items.map((vaccination) => (
                <VaccinationRow
                  key={vaccination._id}
                  vaccination={vaccination}
                  isHistory={!isActiveTab}
                  canEdit={canEdit(vaccination)}
                  canDelete={canDelete(vaccination)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </section>
          ))}

          {remaining > 0 && (
            <button
              type="button"
              className="vaccinations-more"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            >
              Mostra altri {Math.min(remaining, PAGE_SIZE)}
            </button>
          )}
        </div>
      )}

      <VaccinationModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        pets={petList}
        petId={
          selectedVaccination
            ? getPetId(selectedVaccination)
            : selectedPet !== "all"
              ? selectedPet
              : null
        }
        vaccination={selectedVaccination}
        onSaved={refetch}
      />

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Elimina vaccinazione"
        itemName={selectedVaccination?.name}
        onConfirm={deleteVaccination}
      />
    </PageLayout>
  );
};

export default VaccinationsPage;
