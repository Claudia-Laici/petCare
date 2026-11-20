import * as userService from "./service.js";

export const createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);

    res.status(201).json(user);
  } catch (e) {
    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const result = await userService.updateUser(req.user, req.body);

    res.status(result.statusCode).json(result.data);
  } catch (e) {
    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deleted = await userService.deleteUser(req.user._id);

    if (!deleted) {
      return res.status(404).json({
        message: "Utente non trovato",
      });
    }

    return res.status(200).json({
      message: "Account eliminato con successo",
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserAvatar = async (req, res, next) => {
  try {
    const result = await userService.updateUserAvatar(req.user, req.file);

    res.status(result.statusCode).json(result.data);
  } catch (error) {
    next(error);
  }
};