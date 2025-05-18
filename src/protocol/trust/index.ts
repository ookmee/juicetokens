/**
 * Trust and Attestation Layer - Index File
 * 
 * This file exports all components of the Trust and Attestation Layer.
 */

// Export types
export * from './types';

// Export services
export { AttestationService } from './attestation.service';
export { ReputationService } from './reputation.service';
export { IdentityService } from './identity.service';

// Export DHT adapter
export { DHTAdapter, DHTStorageOptions, DHTQueryOptions, DHTQueryResult } from './dht.adapter';

// Re-export primary interfaces as a convenience
export {
  // Attestation interfaces
  SystemAttestation,
  PeerAttestation,
  CommunityAttestation,
  AttestationMetadata,
  AttestationDHTWrapper,
  StorageType,
  Direction,
  
  // Reputation interfaces
  ReputationMetric,
  ReliabilityScore,
  ContributionScore,
  ValidationScore,
  ReputationProfile,
  UpdateType,
  PatternType,
  
  // Identity interfaces
  Identity,
  IdentityStatus,
  IdentityAttribute,
  AttributeVerificationStatus,
  IdentityLink,
  LinkType
} from './types'; 