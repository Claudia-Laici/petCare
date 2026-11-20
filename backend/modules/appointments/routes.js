import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  addParticipant,
  updateParticipantNote,
  removeParticipant,
} from "./controller.js";

const AppointmentRouter = express.Router();

AppointmentRouter.post("/", createAppointment);

AppointmentRouter.get("/", getAppointments);
AppointmentRouter.get("/:appointmentId", getAppointmentById);

AppointmentRouter.patch("/:appointmentId", updateAppointment);

AppointmentRouter.delete("/:appointmentId", deleteAppointment);

AppointmentRouter.post("/:appointmentId/participants", addParticipant);

AppointmentRouter.patch(
  "/:appointmentId/participants/:userId",
  updateParticipantNote,
);

AppointmentRouter.delete(
  "/:appointmentId/participants/:userId",
  removeParticipant,
);

export default AppointmentRouter;