import mongoose from "mongoose";
import Pet from "../modules/pets/Pet.js";
import User from "../modules/users/User.js";
import PetShare from "../modules/petshares/PetShare.js";
import * as petService from "../services/petService.js";

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

    if (expiresAt) {
      const expires = new Date(expiresAt);

      if (Number.isNaN(expires.getTime()) || expires <= new Date()) {
        return res
          .status(400)
          .json({ message: "La data di scadenza non è valida" });
      }
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