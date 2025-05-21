import { EventEmitter } from 'events';
/**
 * Status of a governance proposal
 */
export declare enum ProposalStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    VOTING = "voting",
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    IMPLEMENTED = "implemented",
    EXPIRED = "expired"
}
/**
 * Type of proposal
 */
export declare enum ProposalType {
    PROTOCOL_UPDATE = "protocol_update",
    PARAMETER_CHANGE = "parameter_change",
    FEATURE_REQUEST = "feature_request",
    SECURITY_PATCH = "security_patch",
    OTHER = "other"
}
/**
 * Interface for a governance proposal
 */
export interface IProposal {
    id: string;
    title: string;
    description: string;
    type: ProposalType;
    authorId: string;
    createdAt: number;
    updatedAt: number;
    status: ProposalStatus;
    votingStartTime: number;
    votingEndTime: number;
    implementationDeadline: number | null;
    proposedChanges: Record<string, any>;
    codeChanges?: string[];
    testResults?: string[];
    securityReview?: string;
}
/**
 * Interface for proposal vote
 */
export interface IVote {
    proposalId: string;
    voterId: string;
    vote: 'yes' | 'no' | 'abstain';
    weight: number;
    timestamp: number;
    reason?: string;
}
/**
 * Interface for proposal voting result
 */
export interface IVotingResult {
    proposalId: string;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
    totalVotes: number;
    quorumReached: boolean;
    passed: boolean;
}
/**
 * Service for managing governance proposals
 */
export declare class ProposalManager extends EventEmitter {
    private static instance;
    private proposals;
    private votes;
    private quorumPercentage;
    private votingPeriodDays;
    private constructor();
    /**
     * Get the singleton instance of the ProposalManager
     */
    static getInstance(): ProposalManager;
    /**
     * Configure the proposal manager
     */
    configure(config: {
        quorumPercentage?: number;
        votingPeriodDays?: number;
    }): void;
    /**
     * Start a periodic check of proposal statuses
     */
    private startProposalStatusChecker;
    /**
     * Update proposal statuses based on time
     */
    private updateProposalStatuses;
    /**
     * Create a new proposal
     */
    createProposal(proposalData: Omit<IProposal, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'votingStartTime' | 'votingEndTime'>): IProposal;
    /**
     * Submit a proposal for voting
     */
    submitProposal(proposalId: string): boolean;
    /**
     * Vote on a proposal
     */
    castVote(vote: Omit<IVote, 'timestamp'>): boolean;
    /**
     * Calculate the result of voting for a proposal
     */
    calculateVotingResult(proposalId: string): IVotingResult;
    /**
     * Mark a proposal as implemented
     */
    markAsImplemented(proposalId: string): boolean;
    /**
     * Get a specific proposal
     */
    getProposal(proposalId: string): IProposal | undefined;
    /**
     * Get all proposals
     */
    getAllProposals(): IProposal[];
    /**
     * Get proposals by status
     */
    getProposalsByStatus(status: ProposalStatus): IProposal[];
    /**
     * Get votes for a proposal
     */
    getVotesForProposal(proposalId: string): IVote[];
    /**
     * Get a voter's vote on a specific proposal
     */
    getVoterVote(proposalId: string, voterId: string): IVote | undefined;
}
