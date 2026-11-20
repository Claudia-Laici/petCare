import express from "express";
import { login, me } from "../controllers/auth.js";
import {auth} from "../middlewares/globals/auth.js"
import passport from "passport";

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
    console.log("FRONTEND_URL utilizzato:", process.env.FRONTEND_URL);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?token=${req.user.token}`
    );
  }
);

export default AuthRouter;