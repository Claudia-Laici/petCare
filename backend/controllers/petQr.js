import Pet from "../modules/pets/Pet.js";
import PetQr from "../modules/petqrs/PetQr.js";
import HealthCard from "../modules/healthcards/HealthCard.js";
import Therapy from "../modules/therapies/Therapy.js";
import * as petService from "../services/petService.js";
import { getPetWithAccess } from "../utils/petAccess.js";
import { getTherapyStatus } from "../utils/therapyStatus.js";

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

export const getQr = async (req, res, next) => {
  try {
    const pet = await getPetWithAccess(
      req.params.petId,
      req.user._id,
      "viewer",
    );
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const qr = await PetQr.findOne({ pet: pet._id });
    if (!qr) {
      return res.status(200).json({
        qrEnabled: false,
        qrToken: null,
        available: {
          photo: Boolean(pet.cover),
          breed: Boolean(pet.breed),
          microchip: Boolean(pet.microchipNumber),
          conditions: false,
          allergies: false,
          therapies: true,
        },
      });
    }

    const card = await HealthCard.findOne({ pet: pet._id });

    res.status(200).json({
      qrEnabled: qr.enabled,
      qrToken: qr.token,
      share: qr.share,
      message: qr.message,
      contactPhone: qr.contactPhone,

      available: {
        photo: Boolean(pet.cover),
        breed: Boolean(pet.breed),
        microchip: Boolean(pet.microchipNumber),
        conditions: (card?.medicalConditions?.length ?? 0) > 0,
        allergies: (card?.allergies?.length ?? 0) > 0,
        therapies: true,
      },
    });
  } catch (e) {
    next(e);
  }
};

export const regenerateQr = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const qr = await petService.regenerateQr(pet);
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
    const qr = await PetQr.findOne({
      token: req.params.qrToken,
      enabled: true,
    }).populate("pet");

    if (!qr || !qr.pet) {
      return res.status(404).json({ message: "QR non valido" });
    }

    const { pet, share } = qr;

    const data = {
      name: pet.name,
      species: pet.species,
    };

    if (qr.message) data.message = qr.message;
    if (share.photo) data.cover = pet.cover;
    if (share.breed) data.breed = pet.breed;
    if (share.sex) data.sex = pet.sex;
    if (share.microchip) data.microchipNumber = pet.microchipNumber;

    if (share.contact && qr.contactPhone) {
      data.contactPhone = qr.contactPhone;
    }

    if (share.conditions || share.allergies || share.therapies) {
      const card = await HealthCard.findOne({ pet: pet._id });

      if (share.conditions && card?.medicalConditions?.length) {
        data.conditions = card.medicalConditions;
      }

      if (share.allergies && card?.allergies?.length) {
        data.allergies = card.allergies;
      }

      if (share.therapies) {
        const found = await Therapy.find({ pet: pet._id });

        const therapies = found
          .filter((t) => getTherapyStatus(t) === "ongoing")
          .map((t) => ({
            _id: t._id,
            name: t.name,
            dosage: t.dosage,
            frequency: t.frequency,
          }));

        if (therapies.length) data.therapies = therapies;
      }
    }

    res.status(200).json(data);
  } catch (e) {
    next(e);
  }
};

export const updateQrSettings = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });

    if (!pet) {
      return res.status(404).json({ message: "Animale non trovato" });
    }

    const qr = await PetQr.findOne({ pet: pet._id });

    if (!qr) {
      return res.status(404).json({ message: "QR non trovato" });
    }

    const { share, message, contactPhone } = req.body;

    const allowedShareFields = [
      "photo",
      "breed",
      "sex",
      "microchip",
      "contact",
      "conditions",
      "allergies",
      "therapies",
    ];

    if (share !== undefined) {
      if (!share || typeof share !== "object" || Array.isArray(share)) {
        return res.status(400).json({
          message: "Impostazioni di condivisione non valide",
        });
      }

      for (const [key, value] of Object.entries(share)) {
        if (!allowedShareFields.includes(key) || typeof value !== "boolean") {
          return res.status(400).json({
            message: "Impostazioni di condivisione non valide",
          });
        }

        qr.set(`share.${key}`, value);
      }
    }

    if (message !== undefined) {
      if (typeof message !== "string" || message.length > 300) {
        return res.status(400).json({
          message: "Messaggio non valido (massimo 300 caratteri)",
        });
      }

      qr.message = message.trim();
    }

    if (contactPhone !== undefined) {
      if (typeof contactPhone !== "string") {
        return res.status(400).json({
          message: "Numero di telefono non valido",
        });
      }

      qr.contactPhone = contactPhone.trim();
    }

    await qr.save();

    res.status(200).json({
      qrEnabled: qr.enabled,
      share: qr.share,
      message: qr.message,
      contactPhone: qr.contactPhone,
    });
  } catch (e) {
    next(e);
  }
};
