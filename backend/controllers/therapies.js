import Therapy from "../modules/therapies/Therapy.js";
import Pet from "../modules/pets/Pet.js";
import { getTherapyStatus } from "../utils/therapyStatus.js";

export const createTherapy = async (req, res, next) => {
  try {
    const {
      pet,
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      veterinarian,
      notes,
    } = req.body;

    const existingPet = await Pet.findOne({
      _id: pet,
      owner: req.user._id,
    });

    if (!existingPet) {
      return res.status(404).json({
        message: "Animale non trovato",
      });
    }

    const therapy = new Therapy({
      pet,
      name,
      dosage,
      frequency,
      startDate,
      endDate: endDate || null,
      veterinarian,
      notes,
    });

    const savedTherapy = await therapy.save();

    res.status(201).json({
      ...savedTherapy.toObject(),
      status: getTherapyStatus(savedTherapy),
    });
  } catch (e) {
    next(e);
  }
};

export const getTherapies = async (req, res, next) => {
  try {
    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const therapies = await Therapy.find({
      pet: { $in: petIds },
    }).sort({ startDate: -1 });

    const result = therapies.map((therapy) => ({
      ...therapy.toObject(),
      status: getTherapyStatus(therapy),
    }));

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const getTherapyById = async (req, res, next) => {
  try {
    const { therapyId } = req.params;

    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const therapy = await Therapy.findOne({
      _id: therapyId,
      pet: { $in: petIds },
    });

    if (!therapy) {
      return res.status(404).json({
        message: "Terapia non trovata",
      });
    }

    res.status(200).json({
      ...therapy.toObject(),
      status: getTherapyStatus(therapy),
    });
  } catch (e) {
    next(e);
  }
};

export const updateTherapy = async (req, res, next) => {
  try {
    const { therapyId } = req.params;
    const { name, dosage, frequency, startDate, endDate, veterinarian, notes } =
      req.body;

    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const therapy = await Therapy.findOne({
      _id: therapyId,
      pet: { $in: petIds },
    });

    if (!therapy) {
      return res.status(404).json({
        message: "Terapia non trovata",
      });
    }

    if (name !== undefined) therapy.name = name;
    if (dosage !== undefined) therapy.dosage = dosage;
    if (frequency !== undefined) therapy.frequency = frequency;
    if (startDate !== undefined) therapy.startDate = startDate;
    if (veterinarian !== undefined) therapy.veterinarian = veterinarian;
    if (notes !== undefined) therapy.notes = notes;

    if (endDate !== undefined) {
      therapy.endDate = endDate || null;
    }

    const updatedTherapy = await therapy.save();

    res.status(200).json({
      ...updatedTherapy.toObject(),
      status: getTherapyStatus(updatedTherapy),
    });
  } catch (e) {
    next(e);
  }
};

export const deleteTherapy = async (req, res, next) => {
  try {
    const { therapyId } = req.params;

    const pets = await Pet.find({ owner: req.user._id }).select("_id");
    const petIds = pets.map((pet) => pet._id);

    const therapy = await Therapy.findOneAndDelete({
      _id: therapyId,
      pet: { $in: petIds },
    });

    if (!therapy) {
      return res.status(404).json({
        message: "Terapia non trovata",
      });
    }

    res.status(200).json({
      message: "Terapia eliminata con successo",
    });
  } catch (e) {
    next(e);
  }
};
