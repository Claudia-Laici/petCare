import express from "express";
import { login, me } from "../controllers/auth.js";
import {auth} from "../middlewares/auth.js"

const AuthRouter = express.Router();

AuthRouter.post("/login", login);

AuthRouter.get("/me",  auth, me);

export default AuthRouter;