"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageFactory = void 0;
const SafeStorage_1 = require("./SafeStorage");
class StorageFactory {
    static async create(config) {
        switch (config.type) {
            case 'safe':
                return new SafeStorage_1.SafeStorage(config);
            default:
                throw new Error(`Unknown storage type: ${config.type}`);
        }
    }
}
exports.StorageFactory = StorageFactory;
//# sourceMappingURL=TokenStorage.js.map