import { Pipe } from './types/Pipe';
import { PipeType, PipeConfiguration } from './proto-types';
/**
 * Factory class for creating pipe instances
 */
export declare class PipeFactory {
    /**
     * Create a pipe of the specified type
     * @param type Pipe type
     * @param config Optional pipe configuration
     * @returns Pipe instance
     */
    static createPipe(type: PipeType, config?: PipeConfiguration): Pipe;
    /**
     * Create all supported pipe types
     * @returns Array of pipe instances for all supported types
     */
    static createAllPipes(): Pipe[];
    /**
     * Get supported pipe types
     * @returns Array of supported pipe types
     */
    static getSupportedPipeTypes(): PipeType[];
}
