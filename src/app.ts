import "dotenv/config";
import express from "express";
import { logger } from "./common/logger";
import { authRoutes } from "./features/auth";
import { usersRoutes } from "./features/users";
import { commonAuthMiddleware } from "./middleware/authMiddleware";
import { httpLogger } from "./middleware/httpLogger";

const app = express();

app.use(express.json());
app.use(httpLogger);
app.use("/api/auth", authRoutes);

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

app.listen(process.env.SERVER_PORT, () => {
  logger.info(`Server is running on port: ${process.env.SERVER_PORT}`);
});
