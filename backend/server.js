import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const server = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')

server.use(cors({
   origin: allowedOrigins
}));

server.use(express.json());

try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connesso a MongoDB");
} catch (error) {
    console.error("Errore connessione MongoDB:", error);
}

server.get("/", (req, res) => {
    res.status(200).json({
        message: "Benvenuto nel server di PetCare!"
    });
});

server.listen(process.env.PORT, () => {
    console.log(`Server up and running on port ${process.env.PORT}`);
});
