import { useEffect, useMemo, useState } from "react";
import { Alert, Button, Col, Row } from "react-bootstrap";
import { People, Person, PersonPlus, Trash3 } from "react-bootstrap-icons";
import { useParams } from "react-router-dom";
import { useFetch } from "../../hooks/useFetch";
import { apiFetch } from "../../utils/apiFetch";
import { formatDate } from "../../utils/dateUtils";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import LoadingIndicator from "../../components/shared/loadingIndicator/LoadingIndicator";
import PageStats from "../../components/shared/pageStats/PageStats";
import PetFilter from "../../components/shared/pageComponents/petFilter/PetFilter";
import SearchInput from "../../components/shared/pageComponents/searchInput/SearchInput";
import EmptyState from "../../components/shared/pageComponents/emptyState/EmptyState";
import ConfirmDeleteModal from "../../components/shared/confirmDeleteModal/ConfirmDeleteModal";
import ShareModal from "../../components/cards/sharedWith/ShareModal";
import "./SharesPage.css";

const EMPTY_TEXTS = {
  filtered: {
    title: "Nessuna condivisione trovata",
    message: "Prova a cambiare i filtri di ricerca.",
  },
  empty: {
    title: "Non hai ancora condiviso i tuoi animali",
    message:
      "Invita una persona per permetterle di accedere al profilo di uno dei tuoi animali.",
  },
};

const getPersonName = (share) =>
  share.status === "pending"
    ? share.email
    : `${share.user?.nome || ""} ${share.user?.cognome || ""}`.trim();

const SharesPage = () => {
  const { petId } = useParams();

  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
  } = useFetch("/pets");

  const { data: currentUser, isLoading: userLoading } = useFetch("/auth/me");

  const [shares, setShares] = useState([]);
  const [sharesStatus, setSharesStatus] = useState("loading");
  const [sharesError, setSharesError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [notification, setNotification] = useState(null);

  const [selectedPet, setSelectedPet] = useState(petId || "all");
  const [searchTerm, setSearchTerm] = useState("");

  const [invitePet, setInvitePet] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [shareToDelete, setShareToDelete] = useState(null);

  const petList = Array.isArray(pets) ? pets : [];

  const ownedPets = useMemo(
    () =>
      petList.filter(
        (pet) =>
          (pet.owner?._id ?? pet.owner)?.toString() ===
          currentUser?._id?.toString(),
      ),
    [petList, currentUser],
  );

  useEffect(() => {
    let cancelled = false;

    const loadShares = async () => {
      try {
        const results = await Promise.all(
          ownedPets.map(async (pet) => {
            const data = await apiFetch(`/pets/${pet._id}/shares`);

            return (Array.isArray(data) ? data : []).map((share) => ({
              ...share,
              pet: {
                _id: pet._id,
                name: pet.name,
                cover: pet.cover,
              },
            }));
          }),
        );

        if (cancelled) return;

        setShares(results.flat());
        setSharesStatus("success");
        setSharesError("");
      } catch (error) {
        if (cancelled) return;

        setSharesStatus("error");
        setSharesError(
          error.message || "Impossibile caricare le condivisioni.",
        );
      }
    };

    loadShares();

    return () => {
      cancelled = true;
    };
  }, [ownedPets, reloadCount]);

  const filteredShares = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return shares.filter((share) => {
      const matchesPet =
        selectedPet === "all" || share.pet?._id === selectedPet;

      const matchesSearch = [
        share.user?.nome,
        share.user?.cognome,
        share.user?.email,
        share.email,
        share.pet?.name,
      ].some((value) => value?.toLowerCase().includes(term));

      return matchesPet && (!term || matchesSearch);
    });
  }, [shares, selectedPet, searchTerm]);

  const stats = useMemo(() => {
    const active = shares.filter((share) => share.status !== "pending");

    return {
      total: active.length,
      editors: active.filter((share) => share.role === "editor").length,
      viewers: active.filter((share) => share.role === "viewer").length,
    };
  }, [shares]);

  const handleShareSaved = (result) => {
    setNotification(result);
    setReloadCount((count) => count + 1);
  };

  const openInviteModal = (pet = null) => {
    setNotification(null);
    setInvitePet(pet);
    setShowInviteModal(true);
  };

  const closeInviteModal = () => {
    setShowInviteModal(false);
    setInvitePet(null);
  };

  const deleteShare = async () => {
    const isPending = shareToDelete.status === "pending";

    const path = isPending
      ? `/pets/${shareToDelete.pet._id}/invitations/${shareToDelete._id}`
      : `/pets/${shareToDelete.pet._id}/shares/${shareToDelete.user._id}`;

    await apiFetch(path, { method: "DELETE" });

    setReloadCount((count) => count + 1);
  };

  if (petsLoading || userLoading) return <LoadingIndicator />;

  if (petsError) {
    return (
      <PageLayout title="Condivisioni">
        <Alert variant="danger">
          {petsError.message || "Impossibile caricare gli animali."}
        </Alert>
      </PageLayout>
    );
  }

  const hasFilters = Boolean(searchTerm.trim()) || selectedPet !== "all";
  const emptyKey = hasFilters ? "filtered" : "empty";

  return (
    <>
      <PageLayout
        title="Condivisioni"
        description="Gestisci le persone che possono accedere ai profili dei tuoi animali."
        className="shares-page"
        action={
          <ActionButton
            onClick={() => openInviteModal()}
            disabled={ownedPets.length === 0}
          >
            <PersonPlus size={16} />
            Invita una persona
          </ActionButton>
        }
        stats={
          <PageStats
            stats={[
              {
                id: "total",
                icon: <People size={22} />,
                value: stats.total,
                label: "Persone con accesso",
              },
              {
                id: "editors",
                icon: <PersonPlus size={22} />,
                value: stats.editors,
                label: "Editor",
              },
              {
                id: "viewers",
                icon: <Person size={22} />,
                value: stats.viewers,
                label: "Sola lettura",
              },
            ]}
          />
        }
        toolbar={
          <div className="shares-toolbar">
            <PetFilter
              pets={ownedPets}
              selectedPet={selectedPet}
              onChange={setSelectedPet}
            />

            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Cerca una persona..."
            />
          </div>
        }
      >
        {notification && (
          <Alert
            variant="success"
            dismissible
            onClose={() => setNotification(null)}
          >
            {notification.message}
          </Alert>
        )}
        {sharesStatus === "loading" ? (
          <LoadingIndicator />
        ) : sharesStatus === "error" ? (
          <Alert variant="danger">
            {sharesError}
            <Button
              variant="link"
              onClick={() => setReloadCount((count) => count + 1)}
            >
              Riprova
            </Button>
          </Alert>
        ) : filteredShares.length === 0 ? (
          <EmptyState
            icon={<People size={30} />}
            {...EMPTY_TEXTS[emptyKey]}
            action={
              !hasFilters && ownedPets.length > 0 ? (
                <ActionButton onClick={() => openInviteModal()}>
                  <PersonPlus size={16} />
                  Invita una persona
                </ActionButton>
              ) : null
            }
          />
        ) : (
          <Row className="g-4">
            {filteredShares.map((share) => (
              <Col key={share._id} xs={12} lg={6}>
                <div className="share-card">
                  <div className="share-card-header">
                    <div className="share-avatar">
                      <Person size={22} />
                    </div>

                    <div className="share-person">
                      <h3>{getPersonName(share)}</h3>
                      <p>
                        {share.status === "pending"
                          ? "In attesa di registrazione"
                          : share.user?.email}
                      </p>
                    </div>

                    <span
                      className={`share-role ${
                        share.role === "editor"
                          ? "share-role-editor"
                          : "share-role-viewer"
                      }`}
                    >
                      {share.role === "editor" ? "Editor" : "Lettura"}
                    </span>
                  </div>

                  <div className="share-card-pet">
                    <span>Accesso al profilo di</span>
                    <strong>{share.pet?.name}</strong>
                  </div>

                  <div className="share-card-footer">
                    <div className="share-expiration">
                      {share.expiresAt
                        ? `Accesso fino al ${formatDate(share.expiresAt)}`
                        : "Accesso senza scadenza"}
                    </div>

                    <Button
                      variant="light"
                      className="share-delete-button"
                      onClick={() => setShareToDelete(share)}
                      title="Revoca accesso"
                    >
                      <Trash3 size={16} />
                      <span>Revoca</span>
                    </Button>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        )}
      </PageLayout>

      {showInviteModal && (
        <ShareModal
          key={invitePet?._id || "all-pets"}
          show={showInviteModal}
          onHide={closeInviteModal}
          pets={ownedPets}
          initialPet={invitePet}
          onSaved={handleShareSaved}
        />
      )}

      <ConfirmDeleteModal
        show={Boolean(shareToDelete)}
        onHide={() => setShareToDelete(null)}
        title="Revoca accesso"
        itemName={
          shareToDelete
            ? `${getPersonName(shareToDelete)} al profilo di ${shareToDelete.pet?.name}`
            : ""
        }
        onConfirm={deleteShare}
      />
    </>
  );
};

export default SharesPage;
