import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../modules/users/User.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Email o password non validi",
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: "Questo account utilizza Google. Accedi con Google.",
      });
    }

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password,
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: "Email o password non validi",
      });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login effettuato con successo",
      token,
    });
  } catch (e) {
    next(e);
  }
};

export const me = (req, res) => {
  const userResponse = req.user.toObject();

  delete userResponse.password;

  res.status(200).json(userResponse);
};
