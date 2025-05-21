/**
 * Identity Service
 *
 * This service provides functionality for managing identities with privacy considerations,
 * based on the protocol definitions in protos/trust/identity.proto.
 */
import { Identity, AttributeVerificationStatus, IdentityLink, LinkType } from './types';
export declare class IdentityService {
    private identities;
    private links;
    /**
     * Creates a new identity
     */
    createIdentity(displayName: string, publicKey: string, initialAttributes?: Record<string, string>): Identity;
    /**
     * Retrieves an identity by ID
     */
    getIdentity(identityId: string): Identity | undefined;
    /**
     * Updates an identity field
     */
    updateIdentity(identityId: string, field: string, value: string | any, signature: Uint8Array, reason?: string): boolean;
    /**
     * Adds a public key to an identity
     */
    addPublicKey(identityId: string, publicKey: string, signature: Uint8Array, makeActive?: boolean): boolean;
    /**
     * Revokes a public key from an identity
     */
    revokePublicKey(identityId: string, publicKey: string, signature: Uint8Array, reason?: string): boolean;
    /**
     * Sets or updates an identity attribute
     */
    setIdentityAttribute(identityId: string, attributeName: string, attributeValue: string, isPublic: boolean | undefined, signature: Uint8Array): boolean;
    /**
     * Adds an attestation ID to an attribute for verification
     */
    addAttributeAttestation(identityId: string, attributeName: string, attestationId: string, newStatus: AttributeVerificationStatus): boolean;
    /**
     * Creates a link between two identities
     */
    createIdentityLink(sourceIdentityId: string, targetIdentityId: string, linkType: LinkType, strength: number, description: string, signature: Uint8Array, bidirectional?: boolean): IdentityLink | null;
    /**
     * Gets all links from an identity
     */
    getIdentityLinks(identityId: string): IdentityLink[];
    /**
     * Checks if a specific link exists between two identities
     */
    hasLink(sourceIdentityId: string, targetIdentityId: string, linkType?: LinkType): boolean;
    /**
     * Gets a specific link between two identities
     */
    getLink(sourceIdentityId: string, targetIdentityId: string, linkType?: LinkType): IdentityLink | undefined;
    /**
     * Revokes an identity link
     */
    revokeLink(sourceIdentityId: string, targetIdentityId: string, linkType: LinkType, signature: Uint8Array): boolean;
    /**
     * Creates a pseudonymous identity linked to a real identity
     */
    createPseudonym(realIdentityId: string, displayName: string, publicKey: string, signature: Uint8Array): Identity | null;
    /**
     * Gets the disclosure status of an attribute
     */
    canDiscloseAttribute(identityId: string, attributeName: string, requesterId: string): boolean;
    /**
     * Creates a selective disclosure of attributes
     */
    createSelectiveDisclosure(identityId: string, attributeNames: string[], requesterId: string, signature: Uint8Array): Record<string, string>;
    /**
     * Creates a privacy-enhanced ID derived from a real ID
     */
    private createPrivacyEnhancedId;
    /**
     * Gets the next sequence number for identity updates
     */
    private getNextSequenceNumber;
}
