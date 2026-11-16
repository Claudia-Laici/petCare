import mongoose from "mongoose";
import Pet from "../modules/pets/Pet.js";
import User from "../modules/users/User.js";
import PetShare from "../modules/petshares/PetShare.js";
import * as petService from "../services/petService.js";
import { sendShareInviteEmail } from "../services/emailService.js";

export const sharePet = async (req, res, next) => {
  try {
    const { email, role = "viewer", expiresAt = null } = req.body;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedEmail) {
      return res.status(400).json({ message: "Email mancante" });
    }

    if (!["viewer", "editor"].includes(role)) {
      return res.status(400).json({ message: "Ruolo non valido" });
    }

    const pet = await Pet.findOne({
      _id: req.params.petId,
      owner: req.user._id,
    });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    if (normalizedEmail === req.user.email) {
      return res.status(400).json({ message: "L'animale è già tuo" });
    }

    if (expiresAt) {
      const expires = new Date(expiresAt);

      if (Number.isNaN(expires.getTime()) || expires <= new Date()) {
        return res
          .status(400)
          .json({ message: "La data di scadenza non è valida" });
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
        ownerName: req.user.nome,
        petName: pet.name,
        role,
        isRegistered: Boolean(target),
      });
    } catch (emailError) {
      emailSent = false;
      console.error("Email di invito non inviata:", emailError.message);
    }

    if (!target) {
      return res.status(202).json({ shared: false, emailSent });
    }

    res.status(200).json({
      shared: true,
      emailSent,
      pet: await petService.petView(pet, req.user._id),
    });
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

export const getPetShares = async (req, res, next) => {
  try {
    const { petId } = req.params;

    if (!mongoose.isValidObjectId(petId)) {
      return res.status(400).json({ message: "Animale non valido" });
    }

    const pet = await Pet.findOne({ _id: petId, owner: req.user._id });
    if (!pet) return res.status(404).json({ message: "Animale non trovato" });

    const shares = await PetShare.find({ pet: pet._id })
      .populate("user", "nome cognome email")
      .sort({ createdAt: -1 });

    res.status(200).json(shares);
  } catch (e) {
    next(e);
  }
};