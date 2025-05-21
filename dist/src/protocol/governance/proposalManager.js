"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProposalManager = exports.ProposalType = exports.ProposalStatus = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
/**
 * Status of a governance proposal
 */
var ProposalStatus;
(function (ProposalStatus) {
    ProposalStatus["DRAFT"] = "draft";
    ProposalStatus["SUBMITTED"] = "submitted";
    ProposalStatus["VOTING"] = "voting";
    ProposalStatus["ACCEPTED"] = "accepted";
    ProposalStatus["REJECTED"] = "rejected";
    ProposalStatus["IMPLEMENTED"] = "implemented";
    ProposalStatus["EXPIRED"] = "expired";
})(ProposalStatus || (exports.ProposalStatus = ProposalStatus = {}));
/**
 * Type of proposal
 */
var ProposalType;
(function (ProposalType) {
    ProposalType["PROTOCOL_UPDATE"] = "protocol_update";
    ProposalType["PARAMETER_CHANGE"] = "parameter_change";
    ProposalType["FEATURE_REQUEST"] = "feature_request";
    ProposalType["SECURITY_PATCH"] = "security_patch";
    ProposalType["OTHER"] = "other";
})(ProposalType || (exports.ProposalType = ProposalType = {}));
/**
 * Service for managing governance proposals
 */
class ProposalManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.proposals = new Map();
        this.votes = new Map(); // proposalId -> (voterId -> vote)
        this.quorumPercentage = 51; // Default quorum (percentage)
        this.votingPeriodDays = 7; // Default voting period in days
        this.startProposalStatusChecker();
    }
    /**
     * Get the singleton instance of the ProposalManager
     */
    static getInstance() {
        if (!ProposalManager.instance) {
            ProposalManager.instance = new ProposalManager();
        }
        return ProposalManager.instance;
    }
    /**
     * Configure the proposal manager
     */
    configure(config) {
        if (config.quorumPercentage !== undefined) {
            this.quorumPercentage = config.quorumPercentage;
        }
        if (config.votingPeriodDays !== undefined) {
            this.votingPeriodDays = config.votingPeriodDays;
        }
    }
    /**
     * Start a periodic check of proposal statuses
     */
    startProposalStatusChecker() {
        // Check proposal statuses every hour
        setInterval(() => {
            this.updateProposalStatuses();
        }, 60 * 60 * 1000);
        // Also update immediately
        this.updateProposalStatuses();
    }
    /**
     * Update proposal statuses based on time
     */
    updateProposalStatuses() {
        const now = Date.now();
        for (const proposal of this.proposals.values()) {
            // Skip proposals that are already in terminal states
            if (proposal.status === ProposalStatus.ACCEPTED ||
                proposal.status === ProposalStatus.REJECTED ||
                proposal.status === ProposalStatus.IMPLEMENTED ||
                proposal.status === ProposalStatus.EXPIRED) {
                continue;
            }
            // Check if voting period has started
            if (proposal.status === ProposalStatus.SUBMITTED &&
                now >= proposal.votingStartTime) {
                proposal.status = ProposalStatus.VOTING;
                proposal.updatedAt = now;
                this.emit('proposalVotingStarted', proposal);
            }
            // Check if voting period has ended
            if (proposal.status === ProposalStatus.VOTING &&
                now >= proposal.votingEndTime) {
                const result = this.calculateVotingResult(proposal.id);
                proposal.status = result.passed
                    ? ProposalStatus.ACCEPTED
                    : ProposalStatus.REJECTED;
                proposal.updatedAt = now;
                this.emit('proposalVotingEnded', { proposal, result });
            }
            // Check if implementation deadline has passed
            if (proposal.status === ProposalStatus.ACCEPTED &&
                proposal.implementationDeadline !== null &&
                now >= proposal.implementationDeadline) {
                proposal.status = ProposalStatus.EXPIRED;
                proposal.updatedAt = now;
                this.emit('proposalExpired', proposal);
            }
        }
    }
    /**
     * Create a new proposal
     */
    createProposal(proposalData) {
        const now = Date.now();
        const votingStartTime = now + (24 * 60 * 60 * 1000); // Start voting in 24 hours
        const votingEndTime = votingStartTime + (this.votingPeriodDays * 24 * 60 * 60 * 1000);
        const proposal = {
            id: (0, uuid_1.v4)(),
            ...proposalData,
            createdAt: now,
            updatedAt: now,
            status: ProposalStatus.DRAFT,
            votingStartTime,
            votingEndTime
        };
        this.proposals.set(proposal.id, proposal);
        this.votes.set(proposal.id, new Map());
        this.emit('proposalCreated', proposal);
        return proposal;
    }
    /**
     * Submit a proposal for voting
     */
    submitProposal(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        if (proposal.status !== ProposalStatus.DRAFT) {
            throw new Error(`Proposal ${proposalId} is not in draft status`);
        }
        const now = Date.now();
        proposal.status = ProposalStatus.SUBMITTED;
        proposal.updatedAt = now;
        proposal.votingStartTime = now + (24 * 60 * 60 * 1000); // Start voting in 24 hours
        proposal.votingEndTime = proposal.votingStartTime + (this.votingPeriodDays * 24 * 60 * 60 * 1000);
        this.emit('proposalSubmitted', proposal);
        return true;
    }
    /**
     * Vote on a proposal
     */
    castVote(vote) {
        const proposal = this.proposals.get(vote.proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${vote.proposalId} not found`);
        }
        if (proposal.status !== ProposalStatus.VOTING) {
            throw new Error(`Proposal ${vote.proposalId} is not in voting status`);
        }
        const now = Date.now();
        // Check if voting period is active
        if (now < proposal.votingStartTime || now > proposal.votingEndTime) {
            throw new Error(`Voting period for proposal ${vote.proposalId} is not active`);
        }
        // Get the votes for this proposal
        const proposalVotes = this.votes.get(vote.proposalId);
        if (!proposalVotes) {
            throw new Error(`Votes for proposal ${vote.proposalId} not found`);
        }
        // Record the vote
        const fullVote = {
            ...vote,
            timestamp: now
        };
        proposalVotes.set(vote.voterId, fullVote);
        this.emit('voteCast', fullVote);
        // After each vote, recalculate the result to check if quorum is reached
        const result = this.calculateVotingResult(vote.proposalId);
        this.emit('votingUpdate', { proposal, result });
        return true;
    }
    /**
     * Calculate the result of voting for a proposal
     */
    calculateVotingResult(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        const proposalVotes = this.votes.get(proposalId);
        if (!proposalVotes) {
            throw new Error(`Votes for proposal ${proposalId} not found`);
        }
        let yesVotes = 0;
        let noVotes = 0;
        let abstainVotes = 0;
        let totalVotes = 0;
        for (const vote of proposalVotes.values()) {
            const weight = vote.weight;
            totalVotes += weight;
            switch (vote.vote) {
                case 'yes':
                    yesVotes += weight;
                    break;
                case 'no':
                    noVotes += weight;
                    break;
                case 'abstain':
                    abstainVotes += weight;
                    break;
            }
        }
        // Assuming we have some mechanism to know the total possible votes
        // For now, let's use a fixed number like 1000
        const totalPossibleVotes = 1000;
        const quorumReached = (totalVotes / totalPossibleVotes) * 100 >= this.quorumPercentage;
        // A proposal passes if:
        // 1. Quorum is reached
        // 2. More yes votes than no votes
        const passed = quorumReached && yesVotes > noVotes;
        return {
            proposalId,
            yesVotes,
            noVotes,
            abstainVotes,
            totalVotes,
            quorumReached,
            passed
        };
    }
    /**
     * Mark a proposal as implemented
     */
    markAsImplemented(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }
        if (proposal.status !== ProposalStatus.ACCEPTED) {
            throw new Error(`Proposal ${proposalId} is not in accepted status`);
        }
        proposal.status = ProposalStatus.IMPLEMENTED;
        proposal.updatedAt = Date.now();
        this.emit('proposalImplemented', proposal);
        return true;
    }
    /**
     * Get a specific proposal
     */
    getProposal(proposalId) {
        return this.proposals.get(proposalId);
    }
    /**
     * Get all proposals
     */
    getAllProposals() {
        return Array.from(this.proposals.values());
    }
    /**
     * Get proposals by status
     */
    getProposalsByStatus(status) {
        return Array.from(this.proposals.values()).filter(proposal => proposal.status === status);
    }
    /**
     * Get votes for a proposal
     */
    getVotesForProposal(proposalId) {
        const proposalVotes = this.votes.get(proposalId);
        if (!proposalVotes) {
            return [];
        }
        return Array.from(proposalVotes.values());
    }
    /**
     * Get a voter's vote on a specific proposal
     */
    getVoterVote(proposalId, voterId) {
        const proposalVotes = this.votes.get(proposalId);
        if (!proposalVotes) {
            return undefined;
        }
        return proposalVotes.get(voterId);
    }
}
exports.ProposalManager = ProposalManager;
//# sourceMappingURL=proposalManager.js.map