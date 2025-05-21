"use strict";
/**
 * Identity Service
 *
 * This service provides functionality for managing identities with privacy considerations,
 * based on the protocol definitions in protos/trust/identity.proto.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IdentityService = void 0;
const uuid_1 = require("uuid");
const crypto_1 = require("crypto");
const types_1 = require("./types");
class IdentityService {
    constructor() {
        this.identities = new Map();
        this.links = new Map();
    }
    /**
     * Creates a new identity
     */
    createIdentity(displayName, publicKey, initialAttributes = {}) {
        const identityId = (0, uuid_1.v4)();
        // Convert initial attributes to IdentityAttribute objects
        const attributes = Object.entries(initialAttributes).map(([name, value]) => ({
            attributeName: name,
            attributeValue: value,
            selfAttested: true,
            attestationIds: [],
            public: false, // Default to private
            lastUpdatedMs: Date.now(),
            verificationStatus: types_1.AttributeVerificationStatus.UNVERIFIED
        }));
        // Create the identity
        const identity = {
            identityId,
            publicKeys: [publicKey],
            activeKeyId: publicKey,
            displayName,
            attributes,
            creationTimeMs: Date.now(),
            recoveryMethod: "none", // Default to no recovery method
            status: types_1.IdentityStatus.ACTIVE
        };
        // Store the identity
        this.identities.set(identityId, identity);
        // Initialize links array
        this.links.set(identityId, []);
        return identity;
    }
    /**
     * Retrieves an identity by ID
     */
    getIdentity(identityId) {
        return this.identities.get(identityId);
    }
    /**
     * Updates an identity field
     */
    updateIdentity(identityId, field, value, signature, reason = "") {
        const identity = this.identities.get(identityId);
        if (!identity)
            return false;
        // Verify that the active key signed this update
        // In a real implementation, this would verify the signature
        // Create binary value for certain types
        let binaryValue;
        if (typeof value === 'string') {
            binaryValue = Buffer.from(value, 'utf8');
        }
        else {
            binaryValue = Buffer.from(JSON.stringify(value), 'utf8');
        }
        // Create update record
        const update = {
            identityId,
            updatedField: field,
            newValue: binaryValue,
            timestampMs: Date.now(),
            signature,
            updateReason: reason,
            sequenceNumber: this.getNextSequenceNumber(identityId)
        };
        // Apply the update
        switch (field) {
            case 'displayName':
                identity.displayName = value;
                break;
            case 'status':
                identity.status = value;
                break;
            case 'recoveryMethod':
                identity.recoveryMethod = value;
                break;
            case 'activeKeyId':
                // Ensure the key exists in publicKeys
                if (identity.publicKeys.includes(value)) {
                    identity.activeKeyId = value;
                }
                else {
                    return false;
                }
                break;
            // Additional fields would be handled here
            default:
                return false;
        }
        // Store the updated identity
        this.identities.set(identityId, identity);
        // In a real implementation, this would store the update record
        return true;
    }
    /**
     * Adds a public key to an identity
     */
    addPublicKey(identityId, publicKey, signature, makeActive = false) {
        const identity = this.identities.get(identityId);
        if (!identity)
            return false;
        // Verify that the active key signed this update
        // In a real implementation, this would verify the signature
        // Add the key if it doesn't already exist
        if (!identity.publicKeys.includes(publicKey)) {
            identity.publicKeys.push(publicKey);
            // Make active if requested
            if (makeActive) {
                identity.activeKeyId = publicKey;
            }
            // Store the updated identity
            this.identities.set(identityId, identity);
            // Create update record
            const update = {
                identityId,
                updatedField: 'publicKeys',
                newValue: Buffer.from(JSON.stringify(identity.publicKeys), 'utf8'),
                timestampMs: Date.now(),
                signature,
                updateReason: 'Added public key',
                sequenceNumber: this.getNextSequenceNumber(identityId)
            };
            // In a real implementation, this would store the update record
            return true;
        }
        return false;
    }
    /**
     * Revokes a public key from an identity
     */
    revokePublicKey(identityId, publicKey, signature, reason = "Key compromised") {
        const identity = this.identities.get(identityId);
        if (!identity)
            return false;
        // Verify that the active key signed this update
        // In a real implementation, this would verify the signature
        // Can't revoke the active key directly
        if (identity.activeKeyId === publicKey) {
            return false;
        }
        // Remove the key
        const keyIndex = identity.publicKeys.indexOf(publicKey);
        if (keyIndex >= 0) {
            identity.publicKeys.splice(keyIndex, 1);
            // Store the updated identity
            this.identities.set(identityId, identity);
            // Create update record
            const update = {
                identityId,
                updatedField: 'publicKeys',
                newValue: Buffer.from(JSON.stringify(identity.publicKeys), 'utf8'),
                timestampMs: Date.now(),
                signature,
                updateReason: `Revoked key: ${reason}`,
                sequenceNumber: this.getNextSequenceNumber(identityId)
            };
            // In a real implementation, this would store the update record
            // and create a RevocationCertificate
            return true;
        }
        return false;
    }
    /**
     * Sets or updates an identity attribute
     */
    setIdentityAttribute(identityId, attributeName, attributeValue, isPublic = false, signature) {
        const identity = this.identities.get(identityId);
        if (!identity)
            return false;
        // Verify that the active key signed this update
        // In a real implementation, this would verify the signature
        // Check if attribute already exists
        const existingIndex = identity.attributes.findIndex(attr => attr.attributeName === attributeName);
        if (existingIndex >= 0) {
            // Update existing attribute
            identity.attributes[existingIndex] = {
                ...identity.attributes[existingIndex],
                attributeValue,
                public: isPublic,
                lastUpdatedMs: Date.now()
            };
        }
        else {
            // Create new attribute
            const newAttribute = {
                attributeName,
                attributeValue,
                selfAttested: true,
                attestationIds: [],
                public: isPublic,
                lastUpdatedMs: Date.now(),
                verificationStatus: types_1.AttributeVerificationStatus.UNVERIFIED
            };
            identity.attributes.push(newAttribute);
        }
        // Store the updated identity
        this.identities.set(identityId, identity);
        // Create update record
        const update = {
            identityId,
            updatedField: `attribute.${attributeName}`,
            newValue: Buffer.from(attributeValue, 'utf8'),
            timestampMs: Date.now(),
            signature,
            updateReason: 'Updated attribute',
            sequenceNumber: this.getNextSequenceNumber(identityId)
        };
        // In a real implementation, this would store the update record
        return true;
    }
    /**
     * Adds an attestation ID to an attribute for verification
     */
    addAttributeAttestation(identityId, attributeName, attestationId, newStatus) {
        const identity = this.identities.get(identityId);
        if (!identity)
            return false;
        // Find the attribute
        const attrIndex = identity.attributes.findIndex(attr => attr.attributeName === attributeName);
        if (attrIndex < 0)
            return false;
        const attribute = identity.attributes[attrIndex];
        // Add attestation if not already present
        if (!attribute.attestationIds.includes(attestationId)) {
            attribute.attestationIds.push(attestationId);
            // Update verification status if new status is higher
            if (newStatus > attribute.verificationStatus) {
                attribute.verificationStatus = newStatus;
            }
            // Update the attribute
            identity.attributes[attrIndex] = attribute;
            // Store the updated identity
            this.identities.set(identityId, identity);
            return true;
        }
        return false;
    }
    /**
     * Creates a link between two identities
     */
    createIdentityLink(sourceIdentityId, targetIdentityId, linkType, strength, description, signature, bidirectional = false) {
        // Verify both identities exist
        const sourceIdentity = this.identities.get(sourceIdentityId);
        const targetIdentity = this.identities.get(targetIdentityId);
        if (!sourceIdentity || !targetIdentity)
            return null;
        // Verify signature
        // In a real implementation, this would verify the signature
        // Create the link
        const link = {
            sourceIdentityId,
            targetIdentityId,
            linkType,
            strength: Math.max(0, Math.min(100, strength)), // Ensure 0-100 range
            description,
            timestampMs: Date.now(),
            signature,
            bidirectional
        };
        // Store the link
        let sourceLinks = this.links.get(sourceIdentityId) || [];
        sourceLinks.push(link);
        this.links.set(sourceIdentityId, sourceLinks);
        // If bidirectional, create reverse link
        if (bidirectional) {
            let targetLinks = this.links.get(targetIdentityId) || [];
            // Create reverse link with same properties
            const reverseLink = {
                sourceIdentityId: targetIdentityId,
                targetIdentityId: sourceIdentityId,
                linkType,
                strength: link.strength,
                description,
                timestampMs: link.timestampMs,
                signature, // In a real implementation, this would be signed by the target
                bidirectional: true
            };
            targetLinks.push(reverseLink);
            this.links.set(targetIdentityId, targetLinks);
        }
        return link;
    }
    /**
     * Gets all links from an identity
     */
    getIdentityLinks(identityId) {
        return this.links.get(identityId) || [];
    }
    /**
     * Checks if a specific link exists between two identities
     */
    hasLink(sourceIdentityId, targetIdentityId, linkType) {
        const links = this.links.get(sourceIdentityId) || [];
        return links.some(link => link.targetIdentityId === targetIdentityId &&
            (linkType === undefined || link.linkType === linkType));
    }
    /**
     * Gets a specific link between two identities
     */
    getLink(sourceIdentityId, targetIdentityId, linkType) {
        const links = this.links.get(sourceIdentityId) || [];
        return links.find(link => link.targetIdentityId === targetIdentityId &&
            (linkType === undefined || link.linkType === linkType));
    }
    /**
     * Revokes an identity link
     */
    revokeLink(sourceIdentityId, targetIdentityId, linkType, signature) {
        // Get links for source
        const links = this.links.get(sourceIdentityId) || [];
        // Find the link
        const linkIndex = links.findIndex(link => link.targetIdentityId === targetIdentityId &&
            link.linkType === linkType);
        if (linkIndex < 0)
            return false;
        const link = links[linkIndex];
        // Check if bidirectional
        const bidirectional = link.bidirectional;
        // Remove the link
        links.splice(linkIndex, 1);
        this.links.set(sourceIdentityId, links);
        // If bidirectional, remove reverse link
        if (bidirectional) {
            const targetLinks = this.links.get(targetIdentityId) || [];
            const reverseLinkIndex = targetLinks.findIndex(link => link.targetIdentityId === sourceIdentityId &&
                link.linkType === linkType);
            if (reverseLinkIndex >= 0) {
                targetLinks.splice(reverseLinkIndex, 1);
                this.links.set(targetIdentityId, targetLinks);
            }
        }
        return true;
    }
    /**
     * Creates a pseudonymous identity linked to a real identity
     */
    createPseudonym(realIdentityId, displayName, publicKey, signature) {
        const realIdentity = this.identities.get(realIdentityId);
        if (!realIdentity)
            return null;
        // Verify signature
        // In a real implementation, this would verify the signature
        // Create the pseudonymous identity
        const pseudoId = this.createPrivacyEnhancedId(realIdentityId);
        // Create minimal identity
        const pseudoIdentity = {
            identityId: pseudoId,
            publicKeys: [publicKey],
            activeKeyId: publicKey,
            displayName,
            attributes: [],
            creationTimeMs: Date.now(),
            recoveryMethod: "linked", // Special recovery method for pseudonyms
            status: types_1.IdentityStatus.ACTIVE
        };
        // Store the pseudonym
        this.identities.set(pseudoId, pseudoIdentity);
        // Create a private link from real to pseudonym
        this.createIdentityLink(realIdentityId, pseudoId, types_1.LinkType.KNOWS, // Use neutral link type for privacy
        100, // Strong link
        "Pseudonym", signature, false // Not bidirectional for privacy
        );
        return pseudoIdentity;
    }
    /**
     * Gets the disclosure status of an attribute
     */
    canDiscloseAttribute(identityId, attributeName, requesterId) {
        const identity = this.identities.get(identityId);
        if (!identity)
            return false;
        // Find the attribute
        const attribute = identity.attributes.find(attr => attr.attributeName === attributeName);
        if (!attribute)
            return false;
        // If attribute is public, always disclose
        if (attribute.public)
            return true;
        // Check for trust link
        const hasTrustLink = this.hasLink(identityId, requesterId, types_1.LinkType.TRUSTS);
        // In a real implementation, this would check privacy preferences
        // and other disclosure rules
        return hasTrustLink;
    }
    /**
     * Creates a selective disclosure of attributes
     */
    createSelectiveDisclosure(identityId, attributeNames, requesterId, signature) {
        const result = {};
        // For each requested attribute
        for (const attrName of attributeNames) {
            // Check if disclosure is allowed
            if (this.canDiscloseAttribute(identityId, attrName, requesterId)) {
                const identity = this.identities.get(identityId);
                const attribute = identity?.attributes.find(attr => attr.attributeName === attrName);
                if (attribute) {
                    result[attrName] = attribute.attributeValue;
                }
            }
        }
        // In a real implementation, this would create a signed disclosure record
        return result;
    }
    // Helper methods
    /**
     * Creates a privacy-enhanced ID derived from a real ID
     */
    createPrivacyEnhancedId(realId) {
        // Create a keyed hash of the real ID
        // In a real implementation, this would use a secure key
        const hmac = (0, crypto_1.createHmac)('sha256', 'pseudonym-key');
        hmac.update(realId);
        // Return a portion as UUID format
        const hash = hmac.digest('hex');
        return [
            hash.substring(0, 8),
            hash.substring(8, 12),
            hash.substring(12, 16),
            hash.substring(16, 20),
            hash.substring(20, 32)
        ].join('-');
    }
    /**
     * Gets the next sequence number for identity updates
     */
    getNextSequenceNumber(identityId) {
        // In a real implementation, this would get the next sequence number from a chain
        return Date.now();
    }
}
exports.IdentityService = IdentityService;
//# sourceMappingURL=identity.service.js.map