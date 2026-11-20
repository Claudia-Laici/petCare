import { useState } from "react";
import { Alert, Col, Form, Row } from "react-bootstrap";
import { FileEarmarkMedical, FilePdf, Image, Plus, } from "react-bootstrap-icons";
import { useFetch } from "../../hooks/useFetch";
import { DOCUMENT_TYPES } from "../../utils/documentTypes";
import { isImageDocument, isPdfDocument, } from "../../utils/documentFormats";
import PageLayout from "../../components/shared/pageLayout/PageLayout";
import ActionButton from "../../components/shared/actionButton/ActionButton";
import LoadingIndicator from "../../components/shared/loadingIndicator/LoadingIndicator";
import MedicalDocumentModal from "../../components/medicalDocumentModal/MedicalDocumentModal";
import DocumentCard from "../../components/documents/documentCard/DocumentCard";
import PageStats from "../../components/shared/pageStats/PageStats";
import PetFilter from "../../components/shared/pageComponents/petFilter/PetFilter";
import SearchInput from "../../components/shared/pageComponents/searchInput/SearchInput";
import EmptyState from "../../components/shared/pageComponents/emptyState/EmptyState";
import "./DocumentsPage.css";

const EMPTY_TEXTS = {
  none: {
    title: "Nessun documento presente",
    message:
      "Carica il primo documento sanitario per conservarlo insieme alle informazioni del tuo animale.",
  },
  filtered: {
    title: "Nessun documento trovato",
    message: "Prova a modificare i filtri o la ricerca.",
  },
};

const DocumentsPage = () => {
  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
    refetch: refetchDocuments,
  } = useFetch("/medical-documents");

  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
  } = useFetch("/pets");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPet, setSelectedPet] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const openUpload = () => {
    setSelectedDocument(null);
    setShowDocumentModal(true);
  };

  const openEdit = (document) => {
    setSelectedDocument(document);
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setShowDocumentModal(false);
    setSelectedDocument(null);
  };

  if (documentsLoading || petsLoading) return <LoadingIndicator />;

  const error = documentsError || petsError;

  if (error) {
    return (
      <PageLayout
        title="Documenti"
        description="Raccogli e consulta i documenti sanitari dei tuoi animali."
      >
        <Alert variant="danger">
          {error.message || "Impossibile caricare i documenti."}
        </Alert>
      </PageLayout>
    );
  }

  const documentList = Array.isArray(documents) ? documents : [];
  const petList = Array.isArray(pets) ? pets : [];

  const uploadablePets = petList.filter((pet) =>
    ["owner", "editor"].includes(pet.role),
  );

  const canUpload = uploadablePets.length > 0;
  const term = searchTerm.trim().toLowerCase();

  const filteredDocuments = documentList.filter((doc) => {
    const petId = doc.pet?._id ?? doc.pet;

    const matchesPet = selectedPet === "all" || petId === selectedPet;

    const matchesType =
      selectedType === "all" || doc.documentType === selectedType;

    const matchesSearch =
      !term ||
      [doc.title, doc.description, doc.pet?.name].some((field) =>
        field?.toLowerCase().includes(term),
      );

    return matchesPet && matchesType && matchesSearch;
  });

  const emptyTexts =
    documentList.length === 0 ? EMPTY_TEXTS.none : EMPTY_TEXTS.filtered;

  return (
    <PageLayout
      title="Documenti"
      description="Tutti i documenti sanitari dei tuoi animali, raccolti in un unico posto."
      className="documents-page"
      contentClassName="documents-content"
      action={
        <ActionButton onClick={openUpload} disabled={!canUpload}>
          <Plus size={16} />
          Carica documento
        </ActionButton>
      }
      stats={
        <PageStats
          stats={[
            {
              id: "total",
              icon: <FileEarmarkMedical size={22} />,
              value: documentList.length,
              label: "Documenti totali",
            },
            {
              id: "images",
              icon: <Image size={22} />,
              value: documentList.filter(isImageDocument).length,
              label: "Immagini",
            },
            {
              id: "pdfs",
              icon: <FilePdf size={22} />,
              value: documentList.filter(isPdfDocument).length,
              label: "PDF",
            },
          ]}
        />
      }
      toolbar={
        <div className="documents-toolbar d-flex flex-wrap align-items-center gap-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Cerca un documento..."
            className="documents-search-input flex-grow-1"
          />

          <div className="documents-filters d-flex flex-wrap gap-2">
            <PetFilter
              pets={petList}
              selectedPet={selectedPet}
              onChange={setSelectedPet}
              className="documents-pet-filter"
            />

            <Form.Select
              className="w-auto flex-grow-1"
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
              aria-label="Filtra per tipologia"
            >
              <option value="all">Tutte le tipologie</option>

              {DOCUMENT_TYPES.map(({ value, plural }) => (
                <option key={value} value={value}>
                  {plural}
                </option>
              ))}
            </Form.Select>
          </div>
        </div>
      }
    >
      {filteredDocuments.length > 0 ? (
        <Row className="g-4">
          {filteredDocuments.map((doc) => {
            const documentPetId = doc.pet?._id ?? doc.pet;

            const documentPet = petList.find(
              (pet) => String(pet._id) === String(documentPetId),
            );

            const role = documentPet?.role;

            const canEdit = ["owner", "editor"].includes(role);
            const canDelete = role === "owner";
            const canDownload = ["owner", "editor"].includes(role);

            return (
              <Col key={doc._id} xs={12} sm={6} xl={4}>
                <DocumentCard
                  document={doc}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canDownload={canDownload}
                  onEdit={() => openEdit(doc)}
                  onDeleted={refetchDocuments}
                />
              </Col>
            );
          })}
        </Row>
      ) : (
        <EmptyState
          icon={<FileEarmarkMedical size={30} />}
          {...emptyTexts}
          action={
            documentList.length === 0 &&
            canUpload && (
              <ActionButton onClick={openUpload}>
                <Plus size={16} />
                Carica il primo documento
              </ActionButton>
            )
          }
        />
      )}

      <MedicalDocumentModal
        show={showDocumentModal}
        onHide={closeDocumentModal}
        pets={uploadablePets}
        document={selectedDocument}
        onUploaded={refetchDocuments}
      />
    </PageLayout>
  );
};

export default DocumentsPage;
