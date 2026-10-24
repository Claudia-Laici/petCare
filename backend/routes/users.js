
import express from "express";
import {
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/users.js";

const UserRouter = express.Router();

UserRouter.patch("/me", updateUser);

UserRouter.delete("/me", deleteUser);

export default UserRouter;
