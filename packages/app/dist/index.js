"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@juicetokens/common");
// Create a simple logger implementation
const logger = {
    debug: (message, ...args) => console.debug(`[DEBUG] ${message}`, ...args),
    info: (message, ...args) => console.info(`[INFO] ${message}`, ...args),
    warn: (message, ...args) => console.warn(`[WARN] ${message}`, ...args),
    error: (message, ...args) => console.error(`[ERROR] ${message}`, ...args),
};
// Simple startup message
logger.info('JuiceTokens Protocol Implementation');
logger.info(`Is 5 a valid denomination? ${(0, common_1.isValidDenomination)(5)}`);
logger.info(`Is 3 a valid denomination? ${(0, common_1.isValidDenomination)(3)}`);
// Start HTTP server to expose an API (placeholder)
const PORT = process.env.PORT || 4242;
logger.info(`Server would start on port ${PORT} (placeholder)`);
//# sourceMappingURL=index.js.map