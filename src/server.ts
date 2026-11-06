import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const uploadsPath = path.resolve(__dirname, "..", "wp-content", "uploads");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/wp-content/uploads", express.static(uploadsPath));

app.use("/api/auth", authRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});