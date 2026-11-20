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
import PageTabs from "../../components/shared/pageComponents/pageTabs/PageTabs";
import "./SharesPage.css";

const EMPTY_TEXTS = {
  shared: {
    filtered: {
      title: "Nessuna condivisione trovata",
      message: "Prova a cambiare i filtri di ricerca.",
    },
    empty: {
      title: "Non hai ancora condiviso i tuoi animali",
      message:
        "Invita una persona per permetterle di accedere al profilo di uno dei tuoi animali.",
    },
  },
  received: {
    filtered: {
      title: "Nessun animale trovato",
      message: "Prova a modificare i filtri di ricerca.",
    },
    empty: {
      title: "Nessun animale condiviso con te",
      message: "Gli animali condivisi con te appariranno qui.",
    },
  },
};

const getFullName = (person) =>
  `${person?.nome || ""} ${person?.cognome || ""}`.trim();

const getPersonName = (share) =>
  share.status === "pending" ? share.email : getFullName(share.user);

const getOwnerId = (pet) => (pet.owner?._id ?? pet.owner)?.toString();

const matchesTerm = (values, term) =>
  !term || values.some((value) => value?.toLowerCase().includes(term));

const RoleBadge = ({ role }) => {
  const isEditor = role === "editor";

  return (
    <span
      className={`share-role ${
        isEditor ? "share-role-editor" : "share-role-viewer"
      }`}
    >
      {isEditor ? "Editor" : "Lettura"}
    </span>
  );
};

const ShareCard = ({ share, onRevoke }) => (
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

      <RoleBadge role={share.role} />
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
        onClick={() => onRevoke(share)}
        title="Revoca accesso"
      >
        <Trash3 size={16} />
        <span>Revoca</span>
      </Button>
    </div>
  </div>
);

const ReceivedPetCard = ({ pet }) => (
  <div className="share-card">
    <div className="share-card-header">
      <div className="share-avatar">
        <People size={22} />
      </div>

      <div className="share-person">
        <h3>{pet.name}</h3>
        <p>
          Condiviso da{" "}
          {getFullName(pet.owner) || pet.owner?.email || "Proprietario"}
        </p>
      </div>

      <RoleBadge role={pet.role} />
    </div>

    <div className="share-card-pet">
      <span>Hai accesso al profilo di</span>
      <strong>{pet.name}</strong>
    </div>
  </div>
);

const SharesPage = () => {
  const { petId } = useParams();

  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
  } = useFetch("/pets");

  const { data: currentUser, isLoading: userLoading } = useFetch("/auth/me");

  const [tab, setTab] = useState(petId ? "shared" : "received");
  const [selectedPet, setSelectedPet] = useState(petId || "all");
  const [searchTerm, setSearchTerm] = useState("");

  const [shares, setShares] = useState([]);
  const [sharesStatus, setSharesStatus] = useState("loading");
  const [sharesError, setSharesError] = useState("");
  const [reloadCount, setReloadCount] = useState(0);
  const [notification, setNotification] = useState(null);

  const [invitePet, setInvitePet] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [shareToDelete, setShareToDelete] = useState(null);

  const reload = () => setReloadCount((count) => count + 1);

  const term = searchTerm.trim().toLowerCase();
  const userId = currentUser?._id?.toString();
  const petList = Array.isArray(pets) ? pets : [];

  const ownedPets = useMemo(
    () => petList.filter((pet) => getOwnerId(pet) === userId),
    [petList, userId],
  );

  const sharedPets = useMemo(
    () => (userId ? petList.filter((pet) => getOwnerId(pet) !== userId) : []),
    [petList, userId],
  );

  useEffect(() => {
    let cancelled = false;

    const loadShares = async () => {
      try {
        const results = await Promise.all(
          ownedPets.map(async (pet) => {
            const data = await apiFetch(`/pets/${pet._id}/shares`);
            const petInfo = { _id: pet._id, name: pet.name, cover: pet.cover };

            return (Array.isArray(data) ? data : []).map((share) => ({
              ...share,
              pet: petInfo,
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

  const filteredShares = useMemo(
    () =>
      shares.filter(
        (share) =>
          (selectedPet === "all" || share.pet?._id === selectedPet) &&
          matchesTerm(
            [
              share.user?.nome,
              share.user?.cognome,
              share.user?.email,
              share.email,
              share.pet?.name,
            ],
            term,
          ),
      ),
    [shares, selectedPet, term],
  );

  const filteredSharedPets = useMemo(
    () =>
      sharedPets.filter(
        (pet) =>
          (selectedPet === "all" || pet._id === selectedPet) &&
          matchesTerm(
            [pet.name, getFullName(pet.owner), pet.owner?.email],
            term,
          ),
      ),
    [sharedPets, selectedPet, term],
  );

  const stats = useMemo(() => {
    const active = shares.filter((share) => share.status !== "pending");
    const countRole = (role) =>
      active.filter((share) => share.role === role).length;

    return {
      total: active.length,
      editors: countRole("editor"),
      viewers: countRole("viewer"),
    };
  }, [shares]);

  const changeTab = (nextTab) => {
    setTab(nextTab);
    setSelectedPet("all");
    setSearchTerm("");
  };

  const handleShareSaved = (result) => {
    setNotification(result);
    reload();
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
    const { pet, status, _id, user } = shareToDelete;

    const path =
      status === "pending"
        ? `/pets/${pet._id}/invitations/${_id}`
        : `/pets/${pet._id}/shares/${user._id}`;

    await apiFetch(path, { method: "DELETE" });

    setShareToDelete(null);
    reload();
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

  const isSharedTab = tab === "shared";
  const items = isSharedTab ? filteredShares : filteredSharedPets;
  const hasFilters = Boolean(term) || selectedPet !== "all";
  const emptyKey = hasFilters ? "filtered" : "empty";

  const inviteButton = (
    <ActionButton
      onClick={() => openInviteModal()}
      disabled={ownedPets.length === 0}
    >
      <PersonPlus size={16} />
      Invita una persona
    </ActionButton>
  );

  return (
    <>
      <PageLayout
        title="Condivisioni"
        description="Gestisci gli accessi ai profili dei tuoi animali e visualizza quelli condivisi con te."
        className="shares-page"
        action={isSharedTab ? inviteButton : null}
        stats={
          isSharedTab ? (
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
          ) : null
        }
        toolbar={
          <div className="shares-toolbar">
            <PageTabs
              items={[
                { key: "shared", label: "Condivisi", count: shares.length },
                {
                  key: "received",
                  label: "Condivisi con me",
                  count: sharedPets.length,
                },
              ]}
              activeKey={tab}
              onChange={changeTab}
            />

            <PetFilter
              pets={isSharedTab ? ownedPets : sharedPets}
              selectedPet={selectedPet}
              onChange={setSelectedPet}
            />

            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={
                isSharedTab ? "Cerca una persona..." : "Cerca un animale..."
              }
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
            <Button variant="link" onClick={reload}>
              Riprova
            </Button>
          </Alert>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<People size={30} />}
            {...EMPTY_TEXTS[tab][emptyKey]}
            action={
              isSharedTab && !hasFilters && ownedPets.length > 0
                ? inviteButton
                : null
            }
          />
        ) : (
          <Row className="g-4">
            {items.map((item) => (
              <Col key={item._id} xs={12} lg={6}>
                {isSharedTab ? (
                  <ShareCard share={item} onRevoke={setShareToDelete} />
                ) : (
                  <ReceivedPetCard pet={item} />
                )}
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