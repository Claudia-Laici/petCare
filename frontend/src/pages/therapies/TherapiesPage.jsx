
import { useState } from "react";
import { Alert } from "react-bootstrap";
import { Capsule, Plus } from "react-bootstrap-icons";
import { useFetch } from "../../hooks/useFetch";
import { useTherapies } from "../../hooks/useTherapies";
import { getTherapyStatus, getTherapyStatusKey, getTherapySortTime, } from "../../utils/therapyStatus";
import { sortByStatus } from "../../utils/statusUtils";
import { deleteTherapy } from "../../services/therapies/therapyService";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import LoadingIndicator from "../shared/loadingIndicator/LoadingIndicator";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import ConfirmDeleteModal from "../../components/shared/confirmDeleteModal/ConfirmDeleteModal";
import TherapyModal from "../../components/cards/therapies/TherapyModal";
import TherapyRow from "../../components/cards/therapies/TherapyRow";
import PageTabs from "../../components/shared/pageComponents/pageTabs/PageTabs";
import PetFilter from "../../components/shared/pageComponents/petFilter/PetFilter";
import EmptyState from "../../components/shared/pageComponents/emptyState/EmptyState";
import "./TherapiesPage.css";

const PAGE_SIZE = 8;

const TABS = [
  { key: "all", label: "Tutte" },
  { key: "ongoing", label: "In corso" },
  { key: "scheduled", label: "Programmate" },
  { key: "ended", label: "Terminate" },
];

const EMPTY_TEXTS = {
  empty: "Non hai ancora registrato terapie.",
  filtered: "Non ci sono terapie in questa categoria.",
};

const TherapiesPage = () => {
  const [tab, setTab] = useState("all");
  const [selectedPet, setSelectedPet] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [showTherapyModal, setShowTherapyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    therapies,
    isLoading: therapiesLoading,
    error: therapiesError,
    refetch,
  } = useTherapies(selectedPet === "all" ? undefined : selectedPet);

  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
  } = useFetch("/pets");

  const openModal = (setShow) => (therapy = null) => {
    setSelectedTherapy(therapy);
    setShow(true);
  };

  const handleCreate = openModal(setShowTherapyModal);
  const handleEdit = openModal(setShowTherapyModal);
  const handleDelete = openModal(setShowDeleteModal);

  const deleteSelectedTherapy = async () => {
    await deleteTherapy(selectedTherapy._id);
    await refetch();
  };

  const changeFilter = (setter) => (value) => {
    setter(value);
    setVisibleCount(PAGE_SIZE);
  };

  const changeTab = changeFilter(setTab);
  const changePet = changeFilter(setSelectedPet);

  if (therapiesLoading || petsLoading) return <LoadingIndicator />;

  const error = therapiesError || petsError;

  if (error) {
    return (
      <PageLayout title="Terapie">
        <Alert variant="danger">
          {error.message || "Impossibile caricare le terapie."}
        </Alert>
      </PageLayout>
    );
  }

  const petList = Array.isArray(pets) ? pets : [];
  const therapyList = Array.isArray(therapies) ? therapies : [];

  const petsById = Object.fromEntries(
    petList.map((pet) => [pet._id, pet]),
  );

  const canEdit = (therapy) =>
    ["owner", "editor"].includes(petsById[therapy.pet]?.role);

  const counts = therapyList.reduce((acc, therapy) => {
    const key = getTherapyStatusKey(therapy);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const filteredTherapies = sortByStatus(
    therapyList,
    getTherapyStatus,
    getTherapySortTime,
    "desc",
  ).filter(
    (therapy) =>
      tab === "all" || getTherapyStatusKey(therapy) === tab,
  );

  const visibleTherapies = filteredTherapies.slice(0, visibleCount);
  const remaining = filteredTherapies.length - visibleTherapies.length;

  const isEmpty = therapyList.length === 0;

  return (
    <PageLayout
      title="Terapie"
      description="Gestisci farmaci, trattamenti e cure dei tuoi animali."
      className="therapies-page"
      contentClassName="therapies-content"
      action={
        <ActionButton onClick={() => handleCreate()}>
          <Plus size={16} />
          Nuova terapia
        </ActionButton>
      }
      toolbar={
        <div className="therapies-toolbar">
          <PageTabs
            items={TABS.map(({ key, label }) => ({
              key,
              label,
              count: key === "all" ? therapyList.length : (counts[key] ?? 0),
            }))}
            activeKey={tab}
            onChange={changeTab}
          />

          <PetFilter
            pets={petList}
            selectedPet={selectedPet}
            onChange={changePet}
          />
        </div>
      }
    >
      {visibleTherapies.length === 0 ? (
        <EmptyState
          icon={<Capsule size={28} />}
          message={EMPTY_TEXTS[isEmpty ? "empty" : "filtered"]}
          action={
            isEmpty && (
              <ActionButton onClick={() => handleCreate()}>
                <Plus size={16} />
                Aggiungi una terapia
              </ActionButton>
            )
          }
        />
      ) : (
        <div className="therapies-list">
          {visibleTherapies.map((therapy) => (
            <TherapyRow
              key={therapy._id}
              therapy={therapy}
              petName={
                petsById[therapy.pet]?.name || "Animale non disponibile"
              }
              canEdit={canEdit(therapy)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {remaining > 0 && (
            <button
              type="button"
              className="therapies-more"
              onClick={() =>
                setVisibleCount((count) => count + PAGE_SIZE)
              }
            >
              Mostra altre {Math.min(remaining, PAGE_SIZE)}
            </button>
          )}
        </div>
      )}

      {showTherapyModal && (
        <TherapyModal
          show={showTherapyModal}
          onHide={() => setShowTherapyModal(false)}
          pets={petList}
          therapy={selectedTherapy}
          petId={
            selectedTherapy?.pet ||
            (selectedPet !== "all" ? selectedPet : "")
          }
          onSaved={refetch}
        />
      )}

      <ConfirmDeleteModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        title="Elimina terapia"
        itemName={selectedTherapy?.name}
        onConfirm={deleteSelectedTherapy}
      />
    </PageLayout>
  );
};

export default TherapiesPage;
