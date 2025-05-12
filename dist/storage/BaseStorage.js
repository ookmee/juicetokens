"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseStorage = void 0;
class BaseStorage {
    constructor(config) {
        this.config = config;
    }
    createResponse(success, error) {
        return { success, error };
    }
}
exports.BaseStorage = BaseStorage;
//# sourceMappingURL=BaseStorage.js.map