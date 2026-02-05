import "dotenv/config";
import express from "express";
import { logger } from "./common/logger";
import { usersRoutes } from "./features/users";
import { httpLogger } from "./middleware/httpLogger";

const app = express();

app.use(express.json());

app.use(httpLogger);

app.use("/api/users", usersRoutes);

app.listen(process.env.SERVER_PORT, () => {
  logger.info(`Server is running on port: ${process.env.SERVER_PORT}`);
});
