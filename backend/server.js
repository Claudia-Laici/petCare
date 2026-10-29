import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

dotenv.config();

const requiredEnv = ["MONGO_URL", "PORT", "JWT_SECRET",  "ALLOWED_ORIGINS",];

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

server.get("/", (req, res) => {
  res.status(200).json({
    message: "Benvenuto nel server di PetCare!",
  });
});

// Rotte pubbliche
server.use("/auth", AuthRouter)
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
