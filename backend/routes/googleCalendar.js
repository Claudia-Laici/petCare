import express from "express";
import { auth } from "../middlewares/auth.js";
import {
  connectGoogleCalendar,
  googleCalendarCallback,
} from "../controllers/googleCalendar.js";

const GoogleCalendarRouter = express.Router();

GoogleCalendarRouter.get("/connect", auth, connectGoogleCalendar);
GoogleCalendarRouter.get("/callback", googleCalendarCallback);

export default GoogleCalendarRouter;
