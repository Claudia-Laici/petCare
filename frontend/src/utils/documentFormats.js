const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp"];

const getFormat = (document) => document.format?.toLowerCase();

export const isImageDocument = (document) =>
  IMAGE_FORMATS.includes(getFormat(document));

export const isPdfDocument = (document) =>
  getFormat(document) === "pdf";
