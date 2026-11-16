import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import jwt from "jsonwebtoken";
import User from "../modules/users/User.js";

const googleStrategy = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase();

      if (!email) {
        return done(null, false);
      }

      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.findOne({ email });

        if (user) {
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos?.[0]?.value;
          await user.save();
        } else {
          user = await User.create({
            nome: profile.name?.givenName || "Utente",
            cognome: profile.name?.familyName || "",
            email,
            googleId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });
        }
      }

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      done(null, { token });
    } catch (error) {
      console.error("Errore nella strategia Google:", error);
      done(error);
    }
  }
);

export default googleStrategy;