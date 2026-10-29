import Pet from "../modules/pets/Pet.js";
import User from "../modules/users/User.js";
import Therapy from "../modules/therapies/Therapy.js";
import HealthCard from "../modules/healthcards/HealthCard.js";
import PetQr from "../modules/petqrs/PetQr.js";
import { getPetWithAccess, getAccessiblePetIds } from "../utils/petAccess.js";
import * as petService from "../services/petService.js";

export const createPet = async (req, res, next) => {
  try {
    const {
      species,
      name,
      breed,
      cover,
      birthDate,
      sex,
      sterilized,
      microchipNumber,
    } = req.body;

    const pet = await petService.createPetWithHealthCard(
      {
        species,
        name,
        breed,
        cover,
        birthDate,
        sex,
        sterilized,
        microchipNumber,
      },
      req.user._id,
    );

    res.status(201).json(await petService.petView(pet, req.user._id));
  } catch (e) {
    next(e);
  }
};

export const getPets = async (req, res, next) => {
  try {
    const petIds = await getAccessiblePetIds(req.user._id);

    const pets = await Pet.find({
      _id: { $in: petIds },
    });

    const result = await Promise.all(
      pets.map((pet) => petService.petView(pet, req.user._id)),
    );

    return res.status(200).json(result);
  } catch (e) {
    next(e);
  }
};

export const getPetById = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "viewer",
    );
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    res.status(200).json(await petService.petView(pet, req.user._id));
  } catch (e) {
    next(e);
  }
};

export const updatePet = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "editor",
    );
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const allowed = [
      "species",
      "name",
      "breed",
      "cover",
      "birthDate",
      "sex",
      "sterilized",
      "microchipNumber",
    ];

    for (const field of allowed) {
      if (req.body[field] !== undefined) pet[field] = req.body[field];
    }

    const updatedPet = await pet.save();
    res.status(200).json(await petService.petView(updatedPet, req.user._id));
  } catch (e) {
    next(e);
  }
};

export const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    await petService.deletePetCascade(pet);

    res.status(200).json({ message: "Animale eliminato con successo" });
  } catch (e) {
    next(e);
  }
};

export const updateHealthCard = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const healthCard = await HealthCard.findOne({ pet: pet._id });
    if (!healthCard) {
      return res.status(404).json({ message: "Scheda sanitaria non trovata" });
    }

    const {
      allergies,
      medicalConditions,
      emergencyNotes,
      publicPhone,
      publicTherapies,
    } = req.body;

    if (allergies !== undefined) healthCard.allergies = allergies;
    if (medicalConditions !== undefined)
      healthCard.medicalConditions = medicalConditions;
    if (emergencyNotes !== undefined)
      healthCard.emergencyNotes = emergencyNotes;
    if (publicPhone !== undefined) healthCard.publicPhone = publicPhone;

    if (publicTherapies !== undefined) {
      const valid = await Therapy.countDocuments({
        _id: { $in: publicTherapies },
        pet: pet._id,
      });

      if (valid !== publicTherapies.length) {
        return res
          .status(400)
          .json({ message: "Una o più terapie non sono valide" });
      }

      healthCard.publicTherapies = publicTherapies;
    }

    await healthCard.save();
    res.status(200).json(await petService.petView(pet, req.user._id));
  } catch (e) {
    next(e);
  }
};

export const sharePet = async (req, res, next) => {
  try {
    const { email, role = "viewer", expiresAt = null } = req.body;

    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const target = await User.findOne({
      email: String(email).toLowerCase().trim(),
    });
    if (!target) return res.status(404).json({ message: "Utente non trovato" });

    if (target._id.equals(req.user._id)) {
      return res.status(400).json({ message: "L'animale è già tuo" });
    }

    await petService.grantAccess(pet, target._id, role, expiresAt);

    res.status(200).json(await petService.petView(pet, req.user._id));
  } catch (e) {
    next(e);
  }
};

export const unsharePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    await petService.revokeAccess(pet, req.params.userId);

    res.status(200).json({ message: "Accesso rimosso" });
  } catch (e) {
    next(e);
  }
};

export const enableQr = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const qr = await petService.enableQr(pet);

    res.status(200).json({ qrToken: qr.token, qrEnabled: true });
  } catch (e) {
    next(e);
  }
};

export const disableQr = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    await petService.disableQr(pet);

    res.status(200).json({ message: "QR disattivato" });
  } catch (e) {
    next(e);
  }
};

export const getPublicPet = async (req, res, next) => {
  try {
    const qr = await PetQr.findOne({ token: req.params.qrToken }).populate({
      path: "pet",
      populate: {
        path: "healthCard",
        populate: { path: "publicTherapies", select: "name dosage frequency" },
      },
    });

    if (!qr?.pet)
      return res.status(404).json({ message: "Scheda non trovata" });

    res.status(200).json(petService.toPublicJSON(qr.pet));
  } catch (e) {
    next(e);
  }
};
