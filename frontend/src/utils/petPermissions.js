export const canEditPet = (role) =>
  role === "owner" || role === "editor";

export const canDeletePet = (role) =>
  role === "owner";

export const canManagePetShares = (role) =>
  role === "owner";

export const canDownloadPetDocuments = (role) =>
  role === "owner" || role === "editor";