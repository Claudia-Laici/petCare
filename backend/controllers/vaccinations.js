import Vaccination from "../modules/vaccinations/Vaccination.js";
import Pet from "../modules/pets/Pet.js";

export const createVaccination = async (req, res, next) => {
  try {
    const { pet, name, dateAdministered, nextDueDate, veterinarian, notes } =
      req.body;

    const existingPet = await Pet.findOne({
      _id: pet,
      owner: req.user._id,
    });

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
    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

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
    const { vaccinationId } = req.params;

    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const vaccination = await Vaccination.findOne({
      _id: vaccinationId,
      pet: { $in: petIds },
    });

    if (!vaccination) {
      return res.status(404).json({
        message: "Vaccinazione non trovata",
      });
    }

    res.status(200).json(vaccination);
  } catch (e) {
    next(e);
  }
};

export const updateVaccination = async (req, res, next) => {
  try {
    const { vaccinationId } = req.params;
    const { name, dateAdministered, nextDueDate, veterinarian, notes } =
      req.body;

    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const vaccination = await Vaccination.findOne({
      _id: vaccinationId,
      pet: { $in: petIds },
    });

    if (!vaccination) {
      return res.status(404).json({
        message: "Vaccinazione non trovata",
      });
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
    const { vaccinationId } = req.params;

    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const vaccination = await Vaccination.findOneAndDelete({
      _id: vaccinationId,
      pet: { $in: petIds },
    });

    if (!vaccination) {
      return res.status(404).json({
        message: "Vaccinazione non trovata",
      });
    }

    res.status(200).json({
      message: "Vaccinazione eliminata con successo",
    });
  } catch (e) {
    next(e);
  }
};

