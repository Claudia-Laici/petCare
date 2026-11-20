import { useMemo, useState } from "react";
import { Alert, Col, Row } from "react-bootstrap";
import { Heart, People, Person, Plus } from "react-bootstrap-icons";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../utils/apiFetch";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import AnimalCard from "../../components/animals/animalCard/AnimalCard";
import PetFormModal from "../../components/profileCard/PetFormModal";
import LoadingIndicator from "../../components/shared/loadingIndicator/LoadingIndicator";
import PageStats from "../../components/shared/pageStats/PageStats";
import PageTabs from "../../components/shared/pageComponents/pageTabs/PageTabs";
import SearchInput from "../../components/shared/pageComponents/searchInput/SearchInput";
import EmptyState from "../../components/shared/pageComponents/emptyState/EmptyState";
import ConfirmDeleteModal from "../../components/shared/confirmDeleteModal/ConfirmDeleteModal";
import "./AnimalsPage.css";

const AnimalsPage = () => {
  const navigate = useNavigate();

  const { data: pets, isLoading, error, refetch } = useFetch("/pets");
  const { data: currentUser } = useFetch("/auth/me");

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [showPetModal, setShowPetModal] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);

  const petList = useMemo(
    () => (Array.isArray(pets) ? pets : []),
    [pets],
  );

  const currentUserId = currentUser?._id?.toString();

  const getOwnerId = (pet) =>
    (pet.owner?._id ?? pet.owner)?.toString();

  const isPetOwner = (pet) => getOwnerId(pet) === currentUserId;

  const canEditPet = (pet) => isPetOwner(pet) || pet.role === "editor";

  const filteredPets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return petList.filter((pet) => {
      const isOwner = getOwnerId(pet) === currentUserId;

      const matchesFilter =
        activeFilter === "all" ||
        (activeFilter === "mine" && isOwner) ||
        (activeFilter === "shared" && !isOwner);

      const matchesSearch =
        !term ||
        pet.name?.toLowerCase().includes(term) ||
        pet.breed?.toLowerCase().includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [petList, currentUserId, activeFilter, searchTerm]);

  const stats = useMemo(() => {
    const owned = petList.filter(isPetOwner).length;

    return {
      total: petList.length,
      owned,
      shared: petList.length - owned,
    };
  }, [petList, currentUserId]);

  const openAddPet = () => {
    setPetToEdit(null);
    setShowPetModal(true);
  };

  const openEditPet = (pet) => {
    setPetToEdit(pet);
    setShowPetModal(true);
  };

  const handlePetSaved = async () => {
    setShowPetModal(false);
    setPetToEdit(null);
    await refetch();
  };

  const deletePet = async () => {
    await apiFetch(`/pets/${petToDelete._id}`, {
      method: "DELETE",
    });

    await refetch();
  };

  const handleClosePetModal = () => {
    setShowPetModal(false);
    setPetToEdit(null);
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <PageLayout
        title="I tuoi animali"
        description="Gestisci tutti i tuoi amici."
      >
        <Alert variant="danger">
          {error.message || "Impossibile caricare gli animali."}
        </Alert>
      </PageLayout>
    );
  }

  const statsContent = (
    <PageStats
      stats={[
        {
          id: "total",
          icon: <Heart size={22} />,
          value: stats.total,
          label: "Animali totali",
        },
        {
          id: "owned",
          icon: <Person size={22} />,
          value: stats.owned,
          label: "Di proprietà",
        },
        {
          id: "shared",
          icon: <People size={22} />,
          value: stats.shared,
          label: "Condivisi con me",
        },
      ]}
    />
  );

  const toolbar = (
    <div className="animals-toolbar">
      <PageTabs
        items={[
          { key: "all", label: "Tutti", count: stats.total },
          { key: "mine", label: "I miei", count: stats.owned },
          { key: "shared", label: "Condivisi", count: stats.shared },
        ]}
        activeKey={activeFilter}
        onChange={setActiveFilter}
      />

      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Cerca un animale..."
        className="animals-search-input"
      />
    </div>
  );

  const hasSearch = Boolean(searchTerm.trim());

  const emptyTitle = hasSearch
    ? "Nessun animale trovato"
    : activeFilter === "shared"
      ? "Nessun animale condiviso"
      : activeFilter === "mine"
        ? "Non hai ancora animali registrati"
        : "Non hai ancora animali";

  const emptyMessage = hasSearch
    ? "Prova a modificare i termini della ricerca."
    : "Aggiungi un animale per iniziare a organizzare la sua salute.";

  return (
    <>
      <PageLayout
        title="I tuoi animali"
        description="Tutti i tuoi amici, in un unico posto. Gestisci i profili e accedi rapidamente alle loro informazioni."
        className="animals-page"
        action={
          <ActionButton onClick={openAddPet}>
            <Plus size={16} />
            Aggiungi animale
          </ActionButton>
        }
        stats={statsContent}
        toolbar={toolbar}
      >
        {filteredPets.length > 0 ? (
          <Row className="g-4">
            {filteredPets.map((pet) => {
              const isOwner = isPetOwner(pet);

              return (
                <Col key={pet._id} xs={12} sm={6} xl={4}>
                  <AnimalCard
                    pet={pet}
                    isOwner={isOwner}
                    canEdit={canEditPet(pet)}
                    onOpen={() => navigate(`/?pet=${pet._id}`)}
                    onEdit={() => openEditPet(pet)}
                    onDelete={() => setPetToDelete(pet)}
                  />
                </Col>
              );
            })}
          </Row>
        ) : (
          <EmptyState
            icon={<Heart size={30} />}
            title={emptyTitle}
            message={emptyMessage}
            action={
              !hasSearch && activeFilter !== "shared" ? (
                <ActionButton onClick={openAddPet}>
                  <Plus size={16} />
                  Aggiungi animale
                </ActionButton>
              ) : null
            }
          />
        )}
      </PageLayout>

      <PetFormModal
        show={showPetModal}
        onHide={handleClosePetModal}
        pet={petToEdit}
        onSaved={handlePetSaved}
      />

      <ConfirmDeleteModal
        show={Boolean(petToDelete)}
        onHide={() => setPetToDelete(null)}
        title="Elimina animale"
        itemName={petToDelete?.name}
        onConfirm={deletePet}
      />
    </>
  );
};

export default AnimalsPage;
