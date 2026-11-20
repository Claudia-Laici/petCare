import * as medicalDocumentService from "./service.js";

export const createMedicalDocument = async (req, res, next) => {
  try {
    const result = await medicalDocumentService.createMedicalDocument(
      req.body,
      req.file,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getMedicalDocuments = async (req, res, next) => {
  try {
    const result = await medicalDocumentService.getMedicalDocuments(
      req.user._id,
      req.query.pet,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getMedicalDocumentById = async (req, res, next) => {
  try {
    const result = await medicalDocumentService.getMedicalDocumentById(
      req.params.id,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const deleteMedicalDocument = async (req, res, next) => {
  try {
    const result = await medicalDocumentService.deleteMedicalDocument(
      req.params.id,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};

export const getMedicalDocumentAccessUrl = async (req, res, next) => {
  try {
    const result = await medicalDocumentService.getMedicalDocumentAccessUrl(
      req.params.id,
      req.user._id,
    );

    return res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};
