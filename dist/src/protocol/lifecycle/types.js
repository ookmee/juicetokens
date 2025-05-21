"use strict";
// JuiceTokens Protocol - Lifecycle Layer Types
// This file defines interfaces for token creation and renewal
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationErrorCode = exports.MaturationStage = exports.DistributionStrategy = exports.HatchingConditionType = exports.TokenState = exports.DenominationValue = void 0;
// DenominationValue enum matching the valid denominations in the protocol
var DenominationValue;
(function (DenominationValue) {
    DenominationValue[DenominationValue["DENOMINATION_UNSPECIFIED"] = 0] = "DENOMINATION_UNSPECIFIED";
    DenominationValue[DenominationValue["DENOMINATION_1"] = 1] = "DENOMINATION_1";
    DenominationValue[DenominationValue["DENOMINATION_2"] = 2] = "DENOMINATION_2";
    DenominationValue[DenominationValue["DENOMINATION_5"] = 5] = "DENOMINATION_5";
    DenominationValue[DenominationValue["DENOMINATION_10"] = 10] = "DENOMINATION_10";
    DenominationValue[DenominationValue["DENOMINATION_20"] = 20] = "DENOMINATION_20";
    DenominationValue[DenominationValue["DENOMINATION_50"] = 50] = "DENOMINATION_50";
    DenominationValue[DenominationValue["DENOMINATION_100"] = 100] = "DENOMINATION_100";
    DenominationValue[DenominationValue["DENOMINATION_200"] = 200] = "DENOMINATION_200";
    DenominationValue[DenominationValue["DENOMINATION_500"] = 500] = "DENOMINATION_500";
})(DenominationValue || (exports.DenominationValue = DenominationValue = {}));
// TokenState enum matching the protocol
var TokenState;
(function (TokenState) {
    TokenState[TokenState["ACTIVE"] = 0] = "ACTIVE";
    TokenState[TokenState["FROZEN"] = 1] = "FROZEN";
    TokenState[TokenState["EXPIRED"] = 2] = "EXPIRED";
    TokenState[TokenState["REVOKED"] = 3] = "REVOKED";
    TokenState[TokenState["PENDING"] = 4] = "PENDING";
    TokenState[TokenState["SPLIT"] = 5] = "SPLIT";
    TokenState[TokenState["MERGED"] = 6] = "MERGED";
})(TokenState || (exports.TokenState = TokenState = {}));
var HatchingConditionType;
(function (HatchingConditionType) {
    HatchingConditionType[HatchingConditionType["ATTESTATION_THRESHOLD"] = 0] = "ATTESTATION_THRESHOLD";
    HatchingConditionType[HatchingConditionType["ACTIVITY_COMPLETION"] = 1] = "ACTIVITY_COMPLETION";
    HatchingConditionType[HatchingConditionType["TEMPORAL_TRIGGER"] = 2] = "TEMPORAL_TRIGGER";
    HatchingConditionType[HatchingConditionType["MULTI_PARTY_AGREEMENT"] = 3] = "MULTI_PARTY_AGREEMENT";
})(HatchingConditionType || (exports.HatchingConditionType = HatchingConditionType = {}));
var DistributionStrategy;
(function (DistributionStrategy) {
    DistributionStrategy[DistributionStrategy["EQUAL"] = 0] = "EQUAL";
    DistributionStrategy[DistributionStrategy["WEIGHTED"] = 1] = "WEIGHTED";
    DistributionStrategy[DistributionStrategy["MERIT_BASED"] = 2] = "MERIT_BASED";
    DistributionStrategy[DistributionStrategy["NEED_BASED"] = 3] = "NEED_BASED";
})(DistributionStrategy || (exports.DistributionStrategy = DistributionStrategy = {}));
var MaturationStage;
(function (MaturationStage) {
    MaturationStage[MaturationStage["DORMANT"] = 0] = "DORMANT";
    MaturationStage[MaturationStage["FERTILIZED"] = 1] = "FERTILIZED";
    MaturationStage[MaturationStage["INCUBATING"] = 2] = "INCUBATING";
    MaturationStage[MaturationStage["HATCHING"] = 3] = "HATCHING";
    MaturationStage[MaturationStage["ACTIVE"] = 4] = "ACTIVE";
})(MaturationStage || (exports.MaturationStage = MaturationStage = {}));
var ValidationErrorCode;
(function (ValidationErrorCode) {
    ValidationErrorCode["INVALID_VALUE"] = "INVALID_VALUE";
    ValidationErrorCode["MISSING_REQUIRED"] = "MISSING_REQUIRED";
    ValidationErrorCode["INVALID_FORMAT"] = "INVALID_FORMAT";
    ValidationErrorCode["EXPIRED"] = "EXPIRED";
    ValidationErrorCode["PERMISSION_DENIED"] = "PERMISSION_DENIED";
    ValidationErrorCode["ALREADY_EXISTS"] = "ALREADY_EXISTS";
    ValidationErrorCode["INVALID_STATE"] = "INVALID_STATE";
})(ValidationErrorCode || (exports.ValidationErrorCode = ValidationErrorCode = {}));
//# sourceMappingURL=types.js.map