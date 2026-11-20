import express from "express";
import {
  updateUser,
  updateUserAvatar,
  deleteUser,
} from "./controller.js";
import { uploadUserAvatar } from "../../middlewares/globals/cloudinary.js";

const UserRouter = express.Router();

UserRouter.patch("/me", updateUser);

UserRouter.patch(
  "/me/avatar",
  uploadUserAvatar.single("avatar"),
  updateUserAvatar,
);

UserRouter.delete("/me", deleteUser);

export default UserRouter;