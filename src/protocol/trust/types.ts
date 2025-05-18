/**
 * Trust and Attestation Layer - TypeScript Types
 * 
 * This file defines TypeScript interfaces that correspond to the protocol buffer 
 * definitions in protos/trust/. These types will be used by the Trust and Attestation 
 * Layer adapters.
 */

// Attestation Types
export interface SystemAttestation {
  attestationId: string;
  subjectId: string;
  attestationType: string;
  evidence: Uint8Array;
  timestampMs: number;
  confidenceScore: number;
  systemSource: string;
}

export interface PeerAttestation {
  attestationId: string;
  subjectId: string;
  attesterId: string;
  attestationType: string;
  attestationContent: string;
  strength: number;
  timestampMs: number;
  signature: Uint8Array;
}

export interface CommunityAttestation {
  attestationId: string;
  subjectId: string;
  communityId: string;
  attestationType: string;
  attestationContent: string;
  approvalCount: number;
  threshold: number;
  timestampMs: number;
  communitySignature: Uint8Array;
}

export interface AttestationMetadata {
  context: string;
  geographicRegion: string;
  culturalContext: string;
  validFromMs: number;
  validUntilMs: number;
  tags: string[];
}

export type Attestation = SystemAttestation | PeerAttestation | CommunityAttestation;

export interface AttestationDHTWrapper {
  attestation: Attestation;
  metadata: AttestationMetadata;
  storageConfig: AttestationStorage;
  entryType: string;
}

export enum StorageType {
  LOCAL = 0,
  DHT = 1,
  BOTH = 2,
}

export interface AttestationStorage {
  storageType: StorageType;
  encrypted: boolean;
  encryptionScheme: string;
  authorizedViewers: string[];
}

export interface GeospatialShard {
  s2CellId: string;
  level: number;
  containedAttestationIds: string[];
  merkleRoot: Uint8Array;
  lastUpdatedMs: number;
}

export interface AttestationExpiry {
  attestationId: string;
  creationMs: number;
  expiryMs: number;
  autoRenew: boolean;
  renewalPolicy: string;
}

export interface PrivacyPreservingLookup {
  blindedQuery: Uint8Array;
  queryType: string;
  queryParameters: Uint8Array;
  revealMetadata: boolean;
}

export enum Direction {
  GIVEN = 0,
  RECEIVED = 1,
  OBSERVED = 2,
}

export interface AttestationChainEntry {
  attestationId: string;
  sequenceNumber: number;
  entryType: string;
  direction: Direction;
  counterpartyId: string;
  dhtKey: Uint8Array;
  attestationHash: Uint8Array;
}

// Reputation Types
export interface ReputationMetric {
  metricId: string;
  name: string;
  description: string;
  value: number;
  confidence: number;
  contributingAttestations: string[];
}

export interface ReliabilityScore {
  successfulTransactionsRate: number;
  onTimeCompletionRate: number;
  averageResponseTimeSeconds: number;
  transactionCount: number;
  score: number;
}

export interface ContributionScore {
  renewalFacilitationRate: number;
  attestationContributionRate: number;
  networkRelayContribution: number;
  contributionCount: number;
  score: number;
}

export interface ValidationScore {
  communityConsensusAlignment: number;
  attestationVerificationRate: number;
  falseAttestationRate: number;
  validationCount: number;
  score: number;
}

export interface ReputationProfile {
  userId: string;
  reliability: ReliabilityScore;
  contribution: ContributionScore;
  validation: ValidationScore;
  customMetrics: ReputationMetric[];
  lastUpdatedMs: number;
  profileHash: Uint8Array;
}

export interface EnvironmentalContext {
  crisisMode: boolean;
  crisisType: string;
  severity: number;
  detectedAtMs: number;
  adjustedThresholds: Record<string, number>;
}

export interface GeographicContext {
  s2CellId: string;
  regionName: string;
  populationDensity: number;
  connectivityIndex: number;
  regionalFactors: Record<string, number>;
}

export enum PatternType {
  CYCLICAL = 0,
  TREND = 1,
  SEASONAL = 2,
  EVENT = 3,
}

export interface TemporalPattern {
  patternType: PatternType;
  metricId: string;
  significance: number;
  description: string;
  temporalAdjustmentFactors: Record<string, number>;
}

export interface ContextualAdjustment {
  metricId: string;
  baseValue: number;
  adjustedValue: number;
  adjustmentFactors: Record<string, number>;
  adjustmentRationale: string;
}

export enum UpdateType {
  TRANSACTION = 0,
  ATTESTATION = 1,
  NETWORK = 2,
  MANUAL = 3,
  PERIODIC = 4,
}

export interface ReputationUpdate {
  userId: string;
  updateSource: string;
  updateType: UpdateType;
  metricId: string;
  oldValue: number;
  newValue: number;
  confidence: number;
  evidenceIds: string[];
  timestampMs: number;
}

export interface HistoryPoint {
  timestampMs: number;
  value: number;
  confidence: number;
  evidenceId: string;
}

export interface ReputationHistory {
  userId: string;
  metricId: string;
  historyPoints: HistoryPoint[];
}

export interface ReputationChainEntry {
  userId: string;
  reputationProfileHash: Uint8Array;
  sequenceNumber: number;
  entryType: string;
  timestampMs: number;
  dhtKey: Uint8Array;
}

// Identity Types
export enum IdentityStatus {
  ACTIVE = 0,
  SUSPENDED = 1,
  REVOKED = 2,
  RECOVERY = 3,
}

export enum AttributeVerificationStatus {
  UNVERIFIED = 0,
  PEER_VERIFIED = 1,
  SYSTEM_VERIFIED = 2,
  EXPERT_VERIFIED = 3,
}

export interface IdentityAttribute {
  attributeName: string;
  attributeValue: string;
  selfAttested: boolean;
  attestationIds: string[];
  public: boolean;
  lastUpdatedMs: number;
  verificationStatus: AttributeVerificationStatus;
}

export interface Identity {
  identityId: string;
  publicKeys: string[];
  activeKeyId: string;
  displayName: string;
  attributes: IdentityAttribute[];
  creationTimeMs: number;
  recoveryMethod: string;
  status: IdentityStatus;
}

export interface IdentityUpdate {
  identityId: string;
  updatedField: string;
  newValue: Uint8Array;
  timestampMs: number;
  signature: Uint8Array;
  updateReason: string;
  sequenceNumber: number;
}

export enum LinkType {
  KNOWS = 0,
  TRUSTS = 1,
  ENDORSES = 2,
  FAMILY = 3,
  GUARDIAN = 4,
  RECOVERY = 5,
}

export interface IdentityLink {
  sourceIdentityId: string;
  targetIdentityId: string;
  linkType: LinkType;
  strength: number;
  description: string;
  timestampMs: number;
  signature: Uint8Array;
  bidirectional: boolean;
} 