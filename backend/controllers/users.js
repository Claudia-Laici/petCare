import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modules/users/User.js";
import Pet from "../modules/pets/Pet.js";

export const createUser = async (req, res, next) => {
  try {
    const { nome, cognome, email, dataDiNascita, avatar, password } = req.body;

    const user = new User({
      nome,
      cognome,
      email,
      password,
      dataDiNascita,
      avatar,
    });

    const savedUser = await user.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (e) {
    next(e);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email o password non validi",
      });
    }

    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Email o password non validi",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: "Login effettuato con successo",
      token,
      user: userResponse,
    });
  } catch (e) {
    next(e);
  }
};

export const getCurrentUser = (req, res) => {
  const userResponse = req.user.toObject();

  delete userResponse.password;

  res.status(200).json(userResponse);
};

export const updateUser = async (req, res, next) => {
  try {
    const {
      nome,
      cognome,
      email,
      dataDiNascita,
      avatar,
      currentPassword,
      password,
    } = req.body;

    const user = req.user;

    if (password !== undefined) {
      if (typeof password !== "string" || password.trim() === "") {
        return res.status(400).json({
          message: "La nuova password non può essere vuota",
        });
      }
      if (!currentPassword) {
        return res.status(400).json({
          message: "Inserisci la password attuale",
        });
      }

      const userWithPassword = await User.findById(user._id).select(
        "+password",
      );

      if (!userWithPassword) {
        return res.status(404).json({
          message: "Utente non trovato",
        });
      }

      const passwordIsValid = await bcrypt.compare(
        currentPassword,
        userWithPassword.password,
      );

      if (!passwordIsValid) {
        return res.status(401).json({
          message: "La password attuale non è corretta",
        });
      }

      user.password = password;
    }

    if (nome !== undefined) user.nome = nome;
    if (cognome !== undefined) user.cognome = cognome;
    if (email !== undefined) user.email = email;
    if (dataDiNascita !== undefined) user.dataDiNascita = dataDiNascita;
    if (avatar !== undefined) user.avatar = avatar;

    const updatedUser = await user.save();

    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json(userResponse);
  } catch (e) {
    next(e);
  }
};


export const deleteUser = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "Utente non trovato",
      });
    }

    const pets = await Pet.find({ owner: userId });

    for (const pet of pets) {
      await deletePetCascade(pet);
    }

    await PetShare.deleteMany({ user: userId });

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Account eliminato con successo",
    });
  } catch (error) {
    next(error);
  }
};

