import Pet from "../pets/schema.js";
import PetQr from "./schema.js";
import HealthCard from "../healthcards/schema.js";
import Therapy from "../therapies/schema.js";
import * as petService from "../../services/petService.js";
import { getPetWithAccess } from "../../utils/petAccess.js";
import { getTherapyStatus } from "../../utils/therapyStatus.js";

export const enableQr = async (petId, userId) => {
  const pet = await Pet.findOne({
    _id: petId,
    owner: userId,
  });

  if (!pet) {
    return {
      statusCode: 404,
      data: { message: "Animale non trovato" },
    };
  }

  const qr = await petService.enableQr(pet);

  return {
    statusCode: 200,
    data: { qrToken: qr.token, qrEnabled: true },
  };
};

export const getQr = async (petId, userId) => {
  const pet = await getPetWithAccess(petId, userId, "viewer");

  if (!pet) {
    return {
      statusCode: 404,
      data: { message: "Animale non trovato" },
    };
  }

  const qr = await PetQr.findOne({ pet: pet._id });

  if (!qr) {
    return {
      statusCode: 200,
      data: {
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
      },
    };
  }

  const card = await HealthCard.findOne({ pet: pet._id });

  return {
    statusCode: 200,
    data: {
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
    },
  };
};

export const regenerateQr = async (petId, userId) => {
  const pet = await Pet.findOne({
    _id: petId,
    owner: userId,
  });

  if (!pet) {
    return {
      statusCode: 404,
      data: { message: "Animale non trovato" },
    };
  }

  const qr = await petService.regenerateQr(pet);

  return {
    statusCode: 200,
    data: { qrToken: qr.token, qrEnabled: true },
  };
};

export const disableQr = async (petId, userId) => {
  const pet = await Pet.findOne({
    _id: petId,
    owner: userId,
  });

  if (!pet) {
    return {
      statusCode: 404,
      data: { message: "Animale non trovato" },
    };
  }

  await petService.disableQr(pet);

  return {
    statusCode: 200,
    data: { message: "QR disattivato" },
  };
};

export const getPublicPet = async (qrToken) => {
  const qr = await PetQr.findOne({
    token: qrToken,
    enabled: true,
  }).populate("pet");

  if (!qr || !qr.pet) {
    return {
      statusCode: 404,
      data: { message: "QR non valido" },
    };
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

  return {
    statusCode: 200,
    data,
  };
};

export const updateQrSettings = async (petId, userId, body) => {
  const pet = await Pet.findOne({
    _id: petId,
    owner: userId,
  });

  if (!pet) {
    return {
      statusCode: 404,
      data: { message: "Animale non trovato" },
    };
  }

  const qr = await PetQr.findOne({ pet: pet._id });

  if (!qr) {
    return {
      statusCode: 404,
      data: { message: "QR non trovato" },
    };
  }

  const { share, message, contactPhone } = body;

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
      return {
        statusCode: 400,
        data: { message: "Impostazioni di condivisione non valide" },
      };
    }

    for (const [key, value] of Object.entries(share)) {
      if (!allowedShareFields.includes(key) || typeof value !== "boolean") {
        return {
          statusCode: 400,
          data: { message: "Impostazioni di condivisione non valide" },
        };
      }

      qr.set(`share.${key}`, value);
    }
  }

  if (message !== undefined) {
    if (typeof message !== "string" || message.trim().length > 300) {
      return {
        statusCode: 400,
        data: {
          message: "Messaggio non valido (massimo 300 caratteri)",
        },
      };
    }

    qr.message = message.trim();
  }

  if (contactPhone !== undefined) {
    if (typeof contactPhone !== "string") {
      return {
        statusCode: 400,
        data: { message: "Numero di telefono non valido" },
      };
    }

    qr.contactPhone = contactPhone.trim();
  }

  await qr.save();

  return {
    statusCode: 200,
    data: {
      qrEnabled: qr.enabled,
      share: qr.share,
      message: qr.message,
      contactPhone: qr.contactPhone,
    },
  };
};
