"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const TokenStorage_1 = require("./storage/TokenStorage");
const path_1 = __importDefault(require("path"));
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
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await initializeStorage();
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map