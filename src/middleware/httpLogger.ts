import pinoHttp from "pino-http";
import { logger } from "../common/logger";

export const httpLogger = pinoHttp({
  logger,
  customLogLevel: (res, err) => {
    if ((res.statusCode as number) >= 500 || err) return "error";
    if ((res.statusCode as number) >= 400) return "warn";
    return "info";
  },
});
