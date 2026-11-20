import mongoose from "mongoose";
import Pet from "../pets/schema.js";
import User from "../users/schema.js";
import PetShare from "./schema.js";
import * as petService from "../../services/petService.js";
import { sendShareInviteEmail } from "../../services/emailService.js";

export const sharePet = async (
  petId,
  userId,
  userEmail,
  ownerName,
  data,
) => {
  const { email, role = "viewer", expiresAt = null } = data;

  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (!normalizedEmail) {
    return {
      statusCode: 400,
      data: { message: "Email mancante" },
    };
  }

  if (!["viewer", "editor"].includes(role)) {
    return {
      statusCode: 400,
      data: { message: "Ruolo non valido" },
    };
  }

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

  if (normalizedEmail === userEmail) {
    return {
      statusCode: 400,
      data: { message: "L'animale è già tuo" },
    };
  }

  if (expiresAt) {
    const expires = new Date(expiresAt);

    if (Number.isNaN(expires.getTime()) || expires <= new Date()) {
      return {
        statusCode: 400,
        data: { message: "La data di scadenza non è valida" },
      };
    }
  }

  const target = await User.findOne({ email: normalizedEmail });

  if (target) {
    await petService.grantAccess(pet, target._id, role, expiresAt);
  }

  let emailSent = true;

  try {
    await sendShareInviteEmail({
      to: normalizedEmail,
      ownerName,
      petName: pet.name,
      role,
      isRegistered: Boolean(target),
    });
  } catch (emailError) {
    emailSent = false;
    console.error("Email di invito non inviata:", emailError.message);
  }

  if (!target) {
    return {
      statusCode: 202,
      data: { shared: false, emailSent },
    };
  }

  return {
    statusCode: 200,
    data: {
      shared: true,
      emailSent,
      pet: await petService.petView(pet, userId),
    },
  };
};

export const unsharePet = async (petId, userId, targetUserId) => {
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

  await petService.revokeAccess(pet, targetUserId);

  return {
    statusCode: 200,
    data: { message: "Accesso rimosso" },
  };
};

export const getPetShares = async (petId, userId) => {
  if (!mongoose.isValidObjectId(petId)) {
    return {
      statusCode: 400,
      data: { message: "Animale non valido" },
    };
  }

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

  const shares = await PetShare.find({ pet: pet._id })
    .populate("user", "nome cognome email")
    .sort({ createdAt: -1 });

  return {
    statusCode: 200,
    data: shares,
  };
};