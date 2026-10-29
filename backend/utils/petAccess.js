import mongoose from "mongoose";
import Pet from "../modules/pets/Pet.js";
import PetShare from "../modules/petshares/PetShare.js";

const ROLE_LEVEL = { viewer: 1, editor: 2 };

const notExpired = () => ({
  $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }],
});

export async function getPetWithAccess(petId, userId, minRole = "viewer") {
  if (!mongoose.isValidObjectId(petId)) return null;

  const pet = await Pet.findById(petId);
  if (!pet) return null;

  if (String(pet.owner) === String(userId)) return pet;

  const share = await PetShare.findOne({ pet: pet._id, user: userId, ...notExpired() });
  if (!share || ROLE_LEVEL[share.role] < ROLE_LEVEL[minRole]) return null;

  return pet;
}

export async function getAccessiblePetIds(userId) {
  const [owned, shared] = await Promise.all([
    Pet.distinct("_id", { owner: userId }),
    PetShare.distinct("pet", { user: userId, ...notExpired() }),
  ]);
  return [...owned, ...shared];
}