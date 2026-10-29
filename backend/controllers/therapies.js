import Therapy from "../modules/therapies/Therapy.js";
import { getTherapyStatus } from "../utils/therapyStatus.js";
import { getPetWithAccess, getAccessiblePetIds } from "../utils/petAccess.js";
import HealthCard from "../modules/healthcards/HealthCard.js";

const withStatus = (therapy) => ({
  ...therapy.toObject(),
  status: getTherapyStatus(therapy),
});

export const createTherapy = async (req, res, next) => {
  try {
    const {
      pet,
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      nextReminderDate,
      veterinarian,
      notes,
    } = req.body;

    const existingPet = await getPetWithAccess(pet, req.user._id, "editor");

    if (!existingPet) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    const therapy = new Therapy({
      pet,
      name,
      dosage,
      frequency,
      startDate,
      endDate: endDate || null,
      nextReminderDate: nextReminderDate || null,
      veterinarian,
      notes,
    });

    const savedTherapy = await therapy.save();

    res.status(201).json(withStatus(savedTherapy));
  } catch (e) {
    next(e);
  }
};

export const getTherapies = async (req, res, next) => {
  try {
    const petIds = await getAccessiblePetIds(req.user._id);

    const therapies = await Therapy.find({ pet: { $in: petIds } }).sort({
      startDate: -1,
    });

    res.status(200).json(therapies.map(withStatus));
  } catch (e) {
    next(e);
  }
};

export const getTherapyById = async (req, res, next) => {
  try {
    const therapy = await Therapy.findById(req.params.therapyId);

    if (!therapy) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    const pet = await getPetWithAccess(therapy.pet, req.user._id, "viewer");

    if (!pet) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    res.status(200).json(withStatus(therapy));
  } catch (e) {
    next(e);
  }
};

export const updateTherapy = async (req, res, next) => {
  try {
    const {
      name,
      dosage,
      frequency,
      startDate,
      endDate,
      nextReminderDate,
      veterinarian,
      notes,
    } = req.body;

    const therapy = await Therapy.findById(req.params.therapyId);

    if (!therapy) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    const pet = await getPetWithAccess(therapy.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    if (name !== undefined) therapy.name = name;
    if (dosage !== undefined) therapy.dosage = dosage;
    if (frequency !== undefined) therapy.frequency = frequency;
    if (startDate !== undefined) therapy.startDate = startDate;
    if (veterinarian !== undefined) therapy.veterinarian = veterinarian;
    if (notes !== undefined) therapy.notes = notes;
    if (endDate !== undefined) therapy.endDate = endDate || null;
    if (nextReminderDate !== undefined) {
      therapy.nextReminderDate = nextReminderDate || null;
    }

    const updatedTherapy = await therapy.save();

    res.status(200).json(withStatus(updatedTherapy));
  } catch (e) {
    next(e);
  }
};

export const deleteTherapy = async (req, res, next) => {
  try {
    const therapy = await Therapy.findById(req.params.therapyId);

    if (!therapy) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    const pet = await getPetWithAccess(therapy.pet, req.user._id, "editor");

    if (!pet) {
      return res.status(404).json({ message: "Terapia non trovata" });
    }

    await HealthCard.updateOne(
      { pet: therapy.pet },
      { $pull: { publicTherapies: therapy._id } },
    );

    await therapy.deleteOne();

    res.status(200).json({ message: "Terapia eliminata con successo" });
  } catch (e) {
    next(e);
  }
};
