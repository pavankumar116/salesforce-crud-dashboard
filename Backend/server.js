const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const session = require("express-session");
const authRoutes = require("./routes/auth");
const salesforceRoutes = require("./routes/salesforce");

dotenv.config();

const app = express();

// Allow the frontend to send requests with the session cookie.
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

// Store the Salesforce session on the backend instead of exposing tokens to the frontend.
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Keep authentication and Salesforce API routes separated.
app.use("/auth", authRoutes);
app.use("/api/salesforce", salesforceRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Salesforce CRUD Dashboard Backend is running",
  });
});

const PORT = process.env.PORT || 5000;

// Use Render's PORT and listen on all network interfaces.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});