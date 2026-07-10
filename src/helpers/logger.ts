import winston from 'winston';
import dayjs from 'dayjs';
import expressWinston from 'express-winston';
import config, { Environment } from '@config';

const { combine, timestamp, printf, colorize, align, simple, prettyPrint } = winston.format;

const logFormat = printf((info: winston.Logform.TransformableInfo): string => {
  return `${info.level} [${dayjs(info.timestamp as string).format('MM-DD-YYYY HH:mm:ss')}] : ${info.message}`;
});

const createLoggerForEnv = (environment: string) => {
  let logger: winston.Logger;
  switch (environment) {
    case Environment.Development:
      logger = winston.createLogger({
        format: combine(colorize(), timestamp(), prettyPrint(), logFormat, align()),
        transports: [new winston.transports.Console()],
      });
      logger.level = 'debug';

      break;

    case Environment.Test:
      logger = winston.createLogger({});
      logger.level = 'debug';
      logger.add(
        new winston.transports.Console({
          format: simple(),
          silent: process.env.ENABLE_TEST_LOGGING !== 'true',
        }),
      );
      break;
    case Environment.Production:
      logger = winston.createLogger({});
      logger.level = 'info';
      logger.add(
        new winston.transports.Console({
          format: combine(timestamp(), simple(), align()),
        }),
      );
      break;
  }
  return logger;
};

export const logger = createLoggerForEnv(config.environment);

export default function RequestLogger() {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');

  return expressWinston.logger({
    winstonInstance: logger,
    colorize: true,
  });
}
