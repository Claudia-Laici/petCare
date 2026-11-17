import express from "express";
import {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from "../controllers/appointment.js";

const AppointmentRouter = express.Router();

AppointmentRouter.post("/", createAppointment);

AppointmentRouter.get("/", getAppointments);
AppointmentRouter.get("/:appointmentId", getAppointmentById);

AppointmentRouter.put("/:appointmentId", updateAppointment);

AppointmentRouter.delete("/:appointmentId", deleteAppointment);

export default AppointmentRouter;
