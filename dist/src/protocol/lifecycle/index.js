"use strict";
// JuiceTokens Protocol - Lifecycle Layer Adapters
// This module handles Token Creation, Renewal, and Developmental Stage processes
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.developmentalStageTypes = exports.types = exports.CommunalPoolAdapter = exports.EscrowAdapter = exports.FutureValueAdapter = exports.DevelopmentalStageAdapter = exports.TokenRenewalAdapter = exports.TokenCreationAdapter = void 0;
const TokenCreationAdapter_1 = require("./TokenCreationAdapter");
Object.defineProperty(exports, "TokenCreationAdapter", { enumerable: true, get: function () { return TokenCreationAdapter_1.TokenCreationAdapter; } });
const TokenRenewalAdapter_1 = require("./TokenRenewalAdapter");
Object.defineProperty(exports, "TokenRenewalAdapter", { enumerable: true, get: function () { return TokenRenewalAdapter_1.TokenRenewalAdapter; } });
const DevelopmentalStageAdapter_1 = require("./DevelopmentalStageAdapter");
Object.defineProperty(exports, "DevelopmentalStageAdapter", { enumerable: true, get: function () { return DevelopmentalStageAdapter_1.DevelopmentalStageAdapter; } });
const FutureValueAdapter_1 = require("./FutureValueAdapter");
Object.defineProperty(exports, "FutureValueAdapter", { enumerable: true, get: function () { return FutureValueAdapter_1.FutureValueAdapter; } });
Object.defineProperty(exports, "EscrowAdapter", { enumerable: true, get: function () { return FutureValueAdapter_1.EscrowAdapter; } });
Object.defineProperty(exports, "CommunalPoolAdapter", { enumerable: true, get: function () { return FutureValueAdapter_1.CommunalPoolAdapter; } });
const types = __importStar(require("./types"));
exports.types = types;
const developmentalStageTypes = __importStar(require("./developmental_stage_types"));
exports.developmentalStageTypes = developmentalStageTypes;
//# sourceMappingURL=index.js.map