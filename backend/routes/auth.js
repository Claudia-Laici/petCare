import express from "express";
import { login, me } from "../controllers/auth.js";
import {auth} from "../middlewares/auth.js"
import passport from "passport";
import googleStrategy from "../strategies/google.js"

const AuthRouter = express.Router();

AuthRouter.post("/login", login);

AuthRouter.get("/me",  auth, me);

AuthRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

AuthRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
  }),
  (req, res) => {
    res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${req.user.token}`
    );
  }
);

export default AuthRouter;