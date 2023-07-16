import * as simpleLogger from 'simple-node-logger';
const log = simpleLogger.createSimpleLogger();
const logLevel = (process.env.LOG_LEVEL) ? process.env.LOG_LEVEL : 'warn';
log.setLevel(logLevel);

export const logger = log;