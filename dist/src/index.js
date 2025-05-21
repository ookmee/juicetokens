"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TokenStorage_1 = require("./storage/TokenStorage");
const path_1 = __importDefault(require("path"));
const common_1 = require("@juicetokens/common");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Serve static files from the public directory
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Initialize storage
const safeConfig = {
    type: 'safe',
    location: 'SERVER',
    options: {
        mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/tokenengine'
    }
};
let safeStorage;
async function initializeStorage() {
    try {
        safeStorage = await TokenStorage_1.StorageFactory.create(safeConfig);
        await safeStorage.initialize();
        console.log('Storage initialized successfully');
    }
    catch (error) {
        console.error('Failed to initialize storage:', error);
        process.exit(1);
    }
}
// Test endpoints
app.post('/api/tokens/safe', async (req, res) => {
    try {
        const result = await safeStorage.addTokens([req.body]);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'Unknown error' });
    }
});
app.get('/api/tokens/safe', async (req, res) => {
    try {
        const tokens = await safeStorage.getTokens(req.query);
        res.json(tokens);
    }
    catch (error) {
        res.status(500).json({ error: error?.message || 'Unknown error' });
    }
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
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
// Start server
const PORT = process.env.PORT || 4242;
logger.info(`Server would start on port ${PORT} (placeholder)`);
app.listen(PORT, async () => {
    await initializeStorage();
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map