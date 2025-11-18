const pino = require("pino");

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: undefined, // don't include pid, hostname by default
  transport: !isProduction
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          singleLine: false,
        },
      }
    : undefined,
});

module.exports = logger;
