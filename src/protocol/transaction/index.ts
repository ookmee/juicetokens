// Export transaction protocol types
export * from './types';

// Export TransactionManager and DenominationVectorClock implementation
export { 
  TransactionManager,
  TransactionError,
  TransactionErrorType
} from './TransactionManager';

export {
  DenominationVectorClock,
  DenominationStatus
} from './DenominationVectorClock';

// Re-export main transaction manager for easy access
import { TransactionManager } from './TransactionManager';
export default TransactionManager; 