import express from "express";
import { connectToDatabase } from "./src/prisma/client.js";
import shortUrlRoutes from "./src/routes/short_urlRoute.js";
import authRoutes from "./src/routes/auth_Route.js"
import analyiticsRoutes from "./src/routes/analytics_Route.js"
import { redirectURL } from "./src/controllers/short_urlController.js";
import cors from "cors"
import cookieParser from "cookie-parser";
import { attachUser } from "./src/utils/attachUsers.js";
import session from "express-session";
import passport from "passport";
import googleAuthRoutes from "./src/routes/auth_google.js"
import qrCodeRoutes from "./src/routes/qr_Route.js"

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/:id", redirectURL)
app.use(cookieParser())
app.use(attachUser)

app.use(session({
  secret: process.env.SESSION_SECRET || "some-random-secret",
  resave: false,
  saveUninitialized: false
}));

// ✅ Initialize passport
app.use(passport.initialize());
app.use(passport.session());

async function startServer() {
  await connectToDatabase();
  app.use("/api/createUrl", shortUrlRoutes);
  app.use("/api/auth", authRoutes)
  app.use("/api/auth", googleAuthRoutes); 
  app.use("/api/analyitics", analyiticsRoutes)
  app.use("/api/qr", qrCodeRoutes)

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
