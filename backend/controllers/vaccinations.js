import Vaccination from "../modules/vaccinations/Vaccination.js";
import { getPetWithAccess, getAccessiblePetIds } from "../utils/petAccess.js";
import Pet from "../modules/pets/Pet.js";

export const createVaccination = async (req, res, next) => {
  try {
    const { pet, name, dateAdministered, nextDueDate, veterinarian, notes } =
      req.body;

    const existingPet = await getPetWithAccess(pet, req.user._id, "editor");

    if (!existingPet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    const vaccination = new Vaccination({
      pet,
      name,
      dateAdministered,
      nextDueDate,
      veterinarian,
      notes,
    });

    const savedVaccination = await vaccination.save();

    res.status(201).json(savedVaccination);
  } catch (e) {
    next(e);
  }
};

export const getVaccinations = async (req, res, next) => {
  try {
    const petIds = await getAccessiblePetIds(req.user._id);

    const { status } = req.query;
    const filter = {
      pet: { $in: petIds },
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limitDate = new Date(today);
    limitDate.setDate(limitDate.getDate() + 30);

    if (status === "upcoming") {
      filter.nextDueDate = {
        $gte: today,
        $lte: limitDate,
      };
    } else if (status === "overdue") {
      filter.nextDueDate = {
        $ne: null,
        $lt: today,
      };
    }

    const vaccinations = await Vaccination.find(filter).sort({
      dateAdministered: -1,
    });

    res.status(200).json(vaccinations);
  } catch (e) {
    next(e);
  }
};

export const getVaccinationById = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findById(req.params.vaccinationId);

    if (!vaccination) {
      return res.status(404).json({ message: "Vaccinazione non trovata" });
    }

    const pet = await getPetWithAccess(vaccination.pet, req.user._id, "viewer");

    if (!pet) {
      return res.status(404).json({ message: "Vaccinazione non trovata" });
    }

    res.status(200).json(vaccination);
  } catch (e) {
    next(e);
  }
};

export const updateVaccination = async (req, res, next) => {
  try {
    const { name, dateAdministered, nextDueDate, veterinarian, notes } =
      req.body;

    const vaccination = await Vaccination.findById(req.params.vaccinationId);

    if (!vaccination) {
      return res.status(404).json({ message: "Vaccinazione non trovata" });
    }

    const pet = await getPetWithAccess(vaccination.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json({ message: "Vaccinazione non trovata" });
    }

    if (name !== undefined) vaccination.name = name;
    if (dateAdministered !== undefined) {
      vaccination.dateAdministered = dateAdministered;
    }
    if (nextDueDate !== undefined) vaccination.nextDueDate = nextDueDate;
    if (veterinarian !== undefined) vaccination.veterinarian = veterinarian;
    if (notes !== undefined) vaccination.notes = notes;

    const updatedVaccination = await vaccination.save();

    res.status(200).json(updatedVaccination);
  } catch (e) {
    next(e);
  }
};

export const deleteVaccination = async (req, res, next) => {
  try {
    const vaccination = await Vaccination.findById(req.params.vaccinationId);

    if (!vaccination) {
      return res.status(404).json({ message: "Vaccinazione non trovata" });
    }

    const pet = await getPetWithAccess(vaccination.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json({ message: "Vaccinazione non trovata" });
    }

    await vaccination.deleteOne();

    res.status(200).json({
      message: "Vaccinazione eliminata con successo",
    });
  } catch (e) {
    next(e);
  }
};
