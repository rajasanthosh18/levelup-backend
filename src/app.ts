import cors from "cors";
import "dotenv/config";
import express from "express";
import { logger } from "./common/logger";
import { authRoutes } from "./features/auth";
import { usersRoutes } from "./features/users";
import { waitlistRoutes } from "./features/waitlist";
import { commonAuthMiddleware } from "./middleware/authMiddleware";
import { httpLogger } from "./middleware/httpLogger";

const app = express();

app.use(express.json());
app.use(httpLogger);

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://levelup-frontend-eight.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/waitlist", waitlistRoutes);

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email: string;
      iat?: number;
      exp?: number;
    };
  }
}

// Common middleware that checks if request path starts with /api
// If it does, authentication is required
// Otherwise, authentication is skipped
app.use(commonAuthMiddleware);

// Routes
app.use("/api/users", usersRoutes);

// Global error handler — log any error with console.log
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.log("Error:", err.message, err.stack);
    logger.error({ err }, err.message);
    res.status(500).json({ error: err.message ?? "Internal server error" });
  },
);

app
  .listen(process.env.SERVER_PORT, () => {
    logger.info(`Server is running on port: ${process.env.SERVER_PORT}`);
  })
  .on("error", (err) => {
    console.log("Server error:", err.message, err.stack);
  });
