import express from "express";
import { auth } from "../middlewares/globals/auth.js";
import {
  connectGoogleCalendar,
  googleCalendarCallback,
  syncGoogleCalendarAppointments,
  getGoogleCalendarStatus,
  disconnectGoogleCalendar,
} from "../controllers/googleCalendar.js";

const GoogleCalendarRouter = express.Router();

GoogleCalendarRouter.get("/connect", auth, connectGoogleCalendar);
GoogleCalendarRouter.get("/callback", googleCalendarCallback);
GoogleCalendarRouter.get("/status", auth, getGoogleCalendarStatus);

GoogleCalendarRouter.post("/sync", auth, syncGoogleCalendarAppointments);

GoogleCalendarRouter.delete("/disconnect", auth, disconnectGoogleCalendar);

export default GoogleCalendarRouter;
