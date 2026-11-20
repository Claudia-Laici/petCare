import express from "express";
import {
  createAppointmentShare,
  getAppointmentShares,
  revokeAppointmentShare,
} from "./controller.js";

const AppointmentSharesRouter = express.Router();

AppointmentSharesRouter.post(
  "/:appointmentId/shares",
  createAppointmentShare,
);

AppointmentSharesRouter.get(
  "/:appointmentId/shares",
  getAppointmentShares,
);

AppointmentSharesRouter.delete(
  "/:appointmentId/shares/:shareId",
  revokeAppointmentShare,
);

export default AppointmentSharesRouter;