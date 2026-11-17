import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";

//import
import UserRouter from "./routes/users.js";
import errorHandler from "./middlewares/errorHandler.js";
import PetRouter from "./routes/pets.js";
import VaccinationRouter from "./routes/vaccinations.js";
import { createUser } from "./controllers/users.js";
import AuthRouter from "./routes/auth.js";
import { auth } from "./middlewares/auth.js";
import TherapyRouter from "./routes/therapies.js";
import MedicalDocumentRouter from "./routes/medicalDocuments.js";
import PublicRouter from "./routes/public.js";
import PetQrRouter from "./routes/petQr.js";
import HealthCardRouter from "./routes/healthCards.js";
import PetSharesRouter from "./routes/petShares.js";
import passport from "passport";
import googleStrategy from "./strategies/google.js";
import GoogleCalendarRouter from "./routes/googleCalendar.js";
import AppointmentRouter from "./routes/appointment.js";
import { startAppointmentSyncJob } from "./services/appointmentSyncJob.js";

const requiredEnv = [
  "MONGO_URL",
  "PORT",
  "JWT_SECRET",
  "JWT_EXPIRES_IN",
  "ALLOWED_ORIGINS",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_CALLBACK_URL",
  "GOOGLE_CALENDAR_CALLBACK_URL",
  "GOOGLE_TOKEN_ENCRYPTION_KEY",
];

for (const variable of requiredEnv) {
  if (!process.env[variable]) {
    console.error(`Variabile d'ambiente mancante: ${variable}`);
    process.exit(1);
  }
}

const server = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(",");

server.use(
  cors({
    origin: allowedOrigins,
  }),
);

server.use(express.json());
server.use(passport.initialize());
passport.use(googleStrategy);
server.use((req, res, next) => {
  req.body ??= {};
  next();
});

try {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connesso a MongoDB");
} catch (error) {
  console.error("Errore connessione MongoDB:", error);
  process.exit(1);
}

startAppointmentSyncJob();

server.get("/", (req, res) => {
  res.status(200).json({
    message: "Benvenuto nel server di PetCare!",
  });
});

// Rotte pubbliche
server.use("/auth", AuthRouter);
server.use("/auth/google/calendar", GoogleCalendarRouter);
server.post("/users", createUser);
server.use("/public", PublicRouter);

// Middleware globale
server.use(auth);

// Rotte private
server.use("/users", UserRouter);

server.use("/pets", PetRouter);

server.use("/vaccinations", VaccinationRouter);

server.use("/therapies", TherapyRouter);

server.use("/medical-documents", MedicalDocumentRouter);

server.use("/pets", PetQrRouter);

server.use("/pets", HealthCardRouter);

server.use("/pets", PetSharesRouter);

server.use("/appointments", AppointmentRouter);


// Rotte non trovate
server.use((req, res, next) => {
  res.status(404).json({
    statusCode: 404,
    message: "La risorsa richiesta non è stata trovata",
  });
});

server.use(errorHandler);

server.listen(process.env.PORT, () => {
  console.log(`Server up and running on port ${process.env.PORT}`);
});
