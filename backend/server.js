import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9098;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Benvenuto nel backend di PetCare!");
});


mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB collegato:", mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`Server avviato sulla porta ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Errore di connessione a MongoDB:", error.message);
  });

