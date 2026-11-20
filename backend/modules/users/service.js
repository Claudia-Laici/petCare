import bcrypt from "bcrypt";
import User from "./schema.js";
import Pet from "../pets/schema.js";
import PetShare from "../petshares/schema.js";
import { cloudinary } from "../../middlewares/globals/cloudinary.js";
import { sendWelcomeEmail } from "../../services/emailService.js";
import { deletePetCascade } from "../../services/petService.js";

const removePassword = (user) => {
  const userResponse = user.toObject();
  delete userResponse.password;
  return userResponse;
};

export const createUser = async (data) => {
  const { nome, cognome, email, dataDiNascita, password } = data;

  const user = new User({
    nome,
    cognome,
    email,
    password,
    dataDiNascita,
  });

  const savedUser = await user.save();

  try {
    await sendWelcomeEmail(savedUser.email);
  } catch (emailError) {
    console.error("Email di benvenuto non inviata:", emailError.message);
  }

  return removePassword(savedUser);
};

export const updateUser = async (user, data) => {
  const { nome, cognome, email, dataDiNascita, currentPassword, password } =
    data;

  if (password !== undefined) {
    if (typeof password !== "string" || password.trim() === "") {
      return {
        statusCode: 400,
        data: { message: "La nuova password non può essere vuota" },
      };
    }

    if (!currentPassword) {
      return {
        statusCode: 400,
        data: { message: "Inserisci la password attuale" },
      };
    }

    const userWithPassword = await User.findById(user._id).select("+password");

    if (!userWithPassword) {
      return {
        statusCode: 404,
        data: { message: "Utente non trovato" },
      };
    }

    const passwordIsValid = await bcrypt.compare(
      currentPassword,
      userWithPassword.password,
    );

    if (!passwordIsValid) {
      return {
        statusCode: 401,
        data: { message: "La password attuale non è corretta" },
      };
    }

    user.password = password;
  }

  if (nome !== undefined) user.nome = nome;
  if (cognome !== undefined) user.cognome = cognome;
  if (email !== undefined) user.email = email;
  if (dataDiNascita !== undefined) user.dataDiNascita = dataDiNascita;

  const updatedUser = await user.save();

  return {
    statusCode: 200,
    data: removePassword(updatedUser),
  };
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return false;
  }

  const pets = await Pet.find({ owner: userId });

  for (const pet of pets) {
    await deletePetCascade(pet);
  }

  await PetShare.deleteMany({ user: userId });

  await User.findByIdAndDelete(userId);

  return true;
};

export const updateUserAvatar = async (user, file) => {
  if (!file) {
    return {
      statusCode: 400,
      data: {
        message: "Seleziona un'immagine da caricare",
      },
    };
  }

  const oldAvatarPublicId = user.avatarPublicId;

  user.avatar = file.path;
  user.avatarPublicId = file.filename;

  const updatedUser = await user.save();

  if (oldAvatarPublicId && oldAvatarPublicId !== updatedUser.avatarPublicId) {
    try {
      await cloudinary.uploader.destroy(oldAvatarPublicId);
    } catch (cloudinaryError) {
      console.error(
        "Errore durante l'eliminazione del vecchio avatar:",
        cloudinaryError,
      );
    }
  }

  return {
    statusCode: 200,
    data: {
      message: "Avatar aggiornato con successo",
      avatar: updatedUser.avatar,
      avatarPublicId: updatedUser.avatarPublicId,
    },
  };
};