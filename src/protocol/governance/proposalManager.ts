import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

/**
 * Status of a governance proposal
 */
export enum ProposalStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  VOTING = 'voting',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  IMPLEMENTED = 'implemented',
  EXPIRED = 'expired'
}

/**
 * Type of proposal
 */
export enum ProposalType {
  PROTOCOL_UPDATE = 'protocol_update',
  PARAMETER_CHANGE = 'parameter_change',
  FEATURE_REQUEST = 'feature_request',
  SECURITY_PATCH = 'security_patch',
  OTHER = 'other'
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
export class ProposalManager extends EventEmitter {
  private static instance: ProposalManager;
  private proposals: Map<string, IProposal> = new Map();
  private votes: Map<string, Map<string, IVote>> = new Map(); // proposalId -> (voterId -> vote)
  private quorumPercentage: number = 51; // Default quorum (percentage)
  private votingPeriodDays: number = 7; // Default voting period in days
  
  private constructor() {
    super();
    this.startProposalStatusChecker();
  }
  
  /**
   * Get the singleton instance of the ProposalManager
   */
  public static getInstance(): ProposalManager {
    if (!ProposalManager.instance) {
      ProposalManager.instance = new ProposalManager();
    }
    return ProposalManager.instance;
  }
  
  /**
   * Configure the proposal manager
   */
  public configure(config: {
    quorumPercentage?: number;
    votingPeriodDays?: number;
  }): void {
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
  private startProposalStatusChecker(): void {
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
  private updateProposalStatuses(): void {
    const now = Date.now();
    
    for (const proposal of this.proposals.values()) {
      // Skip proposals that are already in terminal states
      if (
        proposal.status === ProposalStatus.ACCEPTED ||
        proposal.status === ProposalStatus.REJECTED ||
        proposal.status === ProposalStatus.IMPLEMENTED ||
        proposal.status === ProposalStatus.EXPIRED
      ) {
        continue;
      }
      
      // Check if voting period has started
      if (
        proposal.status === ProposalStatus.SUBMITTED &&
        now >= proposal.votingStartTime
      ) {
        proposal.status = ProposalStatus.VOTING;
        proposal.updatedAt = now;
        this.emit('proposalVotingStarted', proposal);
      }
      
      // Check if voting period has ended
      if (
        proposal.status === ProposalStatus.VOTING &&
        now >= proposal.votingEndTime
      ) {
        const result = this.calculateVotingResult(proposal.id);
        proposal.status = result.passed
          ? ProposalStatus.ACCEPTED
          : ProposalStatus.REJECTED;
        proposal.updatedAt = now;
        this.emit('proposalVotingEnded', { proposal, result });
      }
      
      // Check if implementation deadline has passed
      if (
        proposal.status === ProposalStatus.ACCEPTED &&
        proposal.implementationDeadline !== null &&
        now >= proposal.implementationDeadline
      ) {
        proposal.status = ProposalStatus.EXPIRED;
        proposal.updatedAt = now;
        this.emit('proposalExpired', proposal);
      }
    }
  }
  
  /**
   * Create a new proposal
   */
  public createProposal(proposalData: Omit<IProposal, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'votingStartTime' | 'votingEndTime'>): IProposal {
    const now = Date.now();
    const votingStartTime = now + (24 * 60 * 60 * 1000); // Start voting in 24 hours
    const votingEndTime = votingStartTime + (this.votingPeriodDays * 24 * 60 * 60 * 1000);
    
    const proposal: IProposal = {
      id: uuidv4(),
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
  public submitProposal(proposalId: string): boolean {
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
  public castVote(vote: Omit<IVote, 'timestamp'>): boolean {
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
    const fullVote: IVote = {
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
  public calculateVotingResult(proposalId: string): IVotingResult {
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
  public markAsImplemented(proposalId: string): boolean {
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
  public getProposal(proposalId: string): IProposal | undefined {
    return this.proposals.get(proposalId);
  }
  
  /**
   * Get all proposals
   */
  public getAllProposals(): IProposal[] {
    return Array.from(this.proposals.values());
  }
  
  /**
   * Get proposals by status
   */
  public getProposalsByStatus(status: ProposalStatus): IProposal[] {
    return Array.from(this.proposals.values()).filter(
      proposal => proposal.status === status
    );
  }
  
  /**
   * Get votes for a proposal
   */
  public getVotesForProposal(proposalId: string): IVote[] {
    const proposalVotes = this.votes.get(proposalId);
    if (!proposalVotes) {
      return [];
    }
    
    return Array.from(proposalVotes.values());
  }
  
  /**
   * Get a voter's vote on a specific proposal
   */
  public getVoterVote(proposalId: string, voterId: string): IVote | undefined {
    const proposalVotes = this.votes.get(proposalId);
    if (!proposalVotes) {
      return undefined;
    }
    
    return proposalVotes.get(voterId);
  }
} 