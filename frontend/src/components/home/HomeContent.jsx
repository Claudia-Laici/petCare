import { useState } from "react";
import { Alert, Container } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import Sidebar from "../shared/aside/Sidebar";
import ProfileCard from "../profileCard/ProfileCard";
import PetFormModal from "../profileCard/PetFormModal";
import LoadingIndicator from "../shared/loadingIndicator/LoadingIndicator";
import DashboardCards from "../dashboardCard/DashboardCards";
import QrCard from "../qrCode/qrCard/QrCard";
import ActionButtontton from "../shared/actionButton/ActionButton";
import "./HomeContent.css";

const HomeContent = () => {
  const {
    data: pets,
    isLoading: petsLoading,
    error,
    refetch,
  } = useFetch("/pets");
  const { data: currentUser, isLoading: userLoading } = useFetch("/auth/me");

  const isLoading = petsLoading || userLoading;

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPetId = searchParams.get("pet");
  const setSelectedPetId = (id) => {
    setSearchParams(id ? { pet: id } : {}, { replace: true });
  };

  const [showPetModal, setShowPetModal] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);

  const petList = Array.isArray(pets) ? pets : [];

  const ownedPets = petList.filter(
    (pet) =>
      pet.owner === currentUser?._id || pet.owner?._id === currentUser?._id,
  );

  const sharedPets = petList.filter(
    (pet) => !ownedPets.some((ownedPet) => ownedPet._id === pet._id),
  );

  const selectedPet =
    petList.find((pet) => pet._id === selectedPetId) ?? petList[0] ?? null;

  const openAddPet = () => {
    setPetToEdit(null);
    setShowPetModal(true);
  };

  const openEditPet = (pet) => {
    setPetToEdit(pet);
    setShowPetModal(true);
  };

  const handlePetSaved = async (savedPet) => {
    if (savedPet?._id) {
      setSelectedPetId(savedPet._id);
    }

    await refetch();
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error.message || "Impossibile caricare i tuoi animali."}
        </Alert>
      </Container>
    );
  }

  const handlePetDeleted = async (deletedPetId) => {
    if (selectedPetId === deletedPetId) {
      setSelectedPetId(null);
    }

    await refetch();
  };

  return (
    <Container>
      <div className="home-layout mt-3">
        <div className="home-sidebar">
          <div className="home-owned">
            <Sidebar
              pets={ownedPets}
              title="I miei animali"
              selectedPetId={selectedPet?._id}
              onSelectPet={setSelectedPetId}
              onAddPet={openAddPet}
            />
          </div>

          {sharedPets.length > 0 && (
            <div className="home-shared">
              <Sidebar
                pets={sharedPets}
                title="Condivisi con me"
                selectedPetId={selectedPet?._id}
                onSelectPet={setSelectedPetId}
              />
            </div>
          )}

          {selectedPet && (
            <div className="home-qr">
              <QrCard
                petId={selectedPet._id}
                petName={selectedPet.name}
                role={selectedPet.role}
              />
            </div>
          )}
        </div>

        <div className="home-main">
          {selectedPet ? (
            <ProfileCard
              pet={selectedPet}
              currentUserId={currentUser?._id}
              onEdit={() => openEditPet(selectedPet)}
              onDeleted={handlePetDeleted}
            />
          ) : (
            <Alert variant="info" className="rounded-4 border-0 shadow-sm p-4">
              <h5 className="fw-semibold">Benvenuto su PetCare!</h5>

              <p className="mb-3">
                Non hai ancora animali registrati. Aggiungine uno per iniziare a
                organizzare la salute dei tuoi amici a quattro zampe.
              </p>

              <ActionButtontton onClick={openAddPet}>
                Aggiungi un animale
              </ActionButtontton>
            </Alert>
          )}

          <div className="mt-4">
            <DashboardCards pet={selectedPet} />
          </div>
        </div>

        <PetFormModal
          show={showPetModal}
          onHide={() => setShowPetModal(false)}
          pet={petToEdit}
          onSaved={handlePetSaved}
        />
      </div>
    </Container>
  );
};

export default HomeContent;
