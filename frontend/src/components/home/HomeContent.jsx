import { useState } from "react";
import { Row, Col, Alert } from "react-bootstrap";
import { useFetch } from "../../hooks/useFetch";
import Sidebar from "../shared/aside/Sidebar";
import ProfileCard from "../profileCard/ProfileCard";
import PetFormModal from "../petFormModal/PetFormModal";
import LoadingIndicator from "../shared/loadingIndicator/LoadingIndicator";

const HomeContent = () => {
  const { data: pets, isLoading, error, refetch } = useFetch("/pets");
  const { data: currentUser } = useFetch("/auth/me");

  const [selectedPetId, setSelectedPetId] = useState(null);
  const [showPetModal, setShowPetModal] = useState(false);
  const [petToEdit, setPetToEdit] = useState(null);

  const petList = Array.isArray(pets) ? pets : [];

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
      <Alert variant="danger">
        {error.message || "Impossibile caricare i tuoi animali."}
      </Alert>
    );
  }

  const handlePetDeleted = async (deletedPetId) => {
    if (selectedPetId === deletedPetId) {
      setSelectedPetId(null);
    }

    await refetch();
  };

  return (
    <>
      <Row className="g-4">
        <Col xs={12} lg={3}>
          <Sidebar
            pets={petList}
            selectedPetId={selectedPet?._id}
            onSelectPet={setSelectedPetId}
            onAddPet={openAddPet}
          />
        </Col>

        <Col xs={12} lg={9}>
          {selectedPet ? (
            <ProfileCard
              pet={selectedPet}
              currentUserId={currentUser?._id}
              onEdit={() => openEditPet(selectedPet)}
              onDeleted={handlePetDeleted}
            />
          ) : (
            <Alert variant="info" className="mt-3">
              Non hai ancora animali registrati. Aggiungine uno per iniziare!
            </Alert>
          )}
        </Col>
      </Row>

      <PetFormModal
        show={showPetModal}
        onHide={() => setShowPetModal(false)}
        pet={petToEdit}
        onSaved={handlePetSaved}
      />
    </>
  );
};

export default HomeContent;
