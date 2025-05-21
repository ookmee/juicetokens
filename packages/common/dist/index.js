"use strict";
// Common utilities for the JuiceTokens protocol
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TIMEOUT = void 0;
exports.isValidDenomination = isValidDenomination;
// Example utility function
function isValidDenomination(value) {
    const validDenominations = [1, 2, 5, 10, 20, 50, 100, 200, 500];
    return validDenominations.includes(value);
}
// Constants
exports.DEFAULT_TIMEOUT = 30000; // 30 seconds 
//# sourceMappingURL=index.js.map