import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import { security } from "./middleware/security.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import pasteRoutes from "./routes/pastes.js";

const app = express();

// Render sits behind one proxy; this makes req.ip the real client IP for rate limiting
app.set("trust proxy", 1);

app.use(security());
app.use(pasteRoutes);
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB(process.env.MONGODB_URI)
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => {
    console.error("Failed to start:", err.message);
    process.exit(1);
  });
