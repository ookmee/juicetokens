import { IEggGeneration, ITokenDistribution, IGenesisPool, IDormantEgg, IFertilizationTrigger, IMaturationPath, IFertilizationEvent, IResult, MaturationStage } from './types';
/**
 * TokenCreationAdapter handles all aspects of the token creation lifecycle
 * from egg generation through hatching into active tokens.
 */
export declare class TokenCreationAdapter {
    private readonly MIN_GENERATORS;
    private readonly MAX_GENERATORS;
    private readonly MIN_POTENCY_LEVEL;
    private readonly MAX_POTENCY_LEVEL;
    private readonly VALID_DENOMINATIONS;
    /**
     * Generates new token eggs based on the provided parameters
     * @param params Egg generation parameters
     * @returns Result containing the created eggs or validation errors
     */
    generateEggs(params: IEggGeneration): Promise<IResult<IDormantEgg[]>>;
    /**
     * Creates a genesis pool for token issuance
     * @param params Genesis pool parameters
     * @returns Result containing the created genesis pool or validation errors
     */
    createGenesisPool(params: Omit<IGenesisPool, 'formationTimestampMs'>): Promise<IResult<IGenesisPool>>;
    /**
     * Triggers the fertilization of a dormant egg
     * @param params Fertilization trigger parameters
     * @returns Result containing the fertilization event or validation errors
     */
    triggerFertilization(dormantEgg: IDormantEgg, trigger: IFertilizationTrigger): Promise<IResult<IFertilizationEvent>>;
    /**
     * Updates the maturation path of a fertilized egg
     * @param currentPath Current maturation path
     * @param newStage New maturation stage
     * @returns Updated maturation path
     */
    updateMaturationPath(currentPath: IMaturationPath, newStage: MaturationStage): IResult<IMaturationPath>;
    /**
     * Creates a token distribution based on the specified strategy
     * @param params Token distribution parameters
     * @returns Result containing the token distribution or validation errors
     */
    createTokenDistribution(params: Omit<ITokenDistribution, 'tokens'>): IResult<ITokenDistribution>;
    /**
     * Validates egg generation parameters
     * @param params Egg generation parameters to validate
     * @returns Array of validation errors
     */
    private validateEggGeneration;
    /**
     * Generates a dormancy seal for an egg using SHA256 hash stacking
     * @param eggId Egg ID
     * @param entropyCommitment Entropy commitment
     * @returns Dormancy seal as Uint8Array
     */
    private generateDormancySeal;
    /**
     * Calculates the potency level based on activity proof
     * @param activityProof Activity proof
     * @returns Potency level between 1-100
     */
    private calculatePotencyLevel;
    /**
     * Generates a compatibility proof between egg and sperm components using SHA256 hash stacking
     * @param eggComponent Egg component
     * @param spermComponent Sperm component
     * @returns Compatibility proof as Uint8Array
     */
    private generateCompatibilityProof;
}
