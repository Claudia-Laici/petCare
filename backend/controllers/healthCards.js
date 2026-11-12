import { getPetWithAccess } from "../utils/petAccess.js";
import HealthCard from "../modules/healthcards/HealthCard.js";
import * as petService from "../services/petService.js";

export const getHealthCard = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "viewer",
    );
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const card = await HealthCard.findOne({ pet: pet._id });

    res
      .status(200)
      .json(
       card ?? { allergies: [], medicalConditions: [] }
      );
  } catch (e) {
    next(e);
  }
};
export const updateHealthCard = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "editor",
    );

    if (!pet) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    let healthCard = await HealthCard.findOne({ pet: pet._id });
    let isNew = false;

    if (!healthCard) {
      healthCard = new HealthCard({ pet: pet._id });
      isNew = true;
    }

    const {
      allergies,
      medicalConditions,
      emergencyNotes,
      contactPhone,
    } = req.body;

    if (allergies !== undefined) healthCard.allergies = allergies;
    if (medicalConditions !== undefined)
      healthCard.medicalConditions = medicalConditions;
    if (emergencyNotes !== undefined)
      healthCard.emergencyNotes = emergencyNotes;
    if (contactPhone !== undefined) healthCard.contactPhone = contactPhone;

    await healthCard.save();

    if (isNew) {
      pet.healthCard = healthCard._id;
      await pet.save();
    }

    res.status(200).json(await petService.petView(pet, req.user._id));
  } catch (e) {
    next(e);
  }
};
