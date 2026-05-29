/**
 * Lucy Curiosity Stack v2
 *
 * Dual-engine neuro-mesh design for discovery + resolution
 *
 * Exports:
 * - ExploratoryEngine (LL352)
 * - InvestigativeEngine (LL353)
 * - CuriosityGovernor (LL354)
 * - CuriosityMeshIntegration
 * - CuriosityEventBus
 */

export { ExploratoryEngine, type NoveltyScore, type EmergingTopic, type SignalDrift, type ExplorationTarget } from './ExploratoryEngine';
export { InvestigativeEngine, type ResolutionCase, type CausalChain, type InvestigativeTarget, type UrgencyTier } from './InvestigativeEngine';
export { CuriosityGovernor, type GovernorDecision, type SafetyFlag, type LoadMetrics } from './CuriosityGovernor';

// Re-export for convenience
export { default as ExploratoryEngineDefault } from './ExploratoryEngine';
export { default as InvestigativeEngineDefault } from './InvestigativeEngine';
export { default as CuriosityGovernorDefault } from './CuriosityGovernor';

/**
 * Curiosity Stack v2 - Complete System
 *
 * Three-layer architecture:
 * 1. Exploratory Curiosity (EC) - Free-roam discovery
 * 2. Investigative Curiosity (IC) - Goal-directed resolution
 * 3. Curiosity Governor (CG) - Arbitration and safety
 *
 * Integrated with Lucy's neuro-mesh (Phases 28-32)
 * Registered as LL352-LL356
 */
export const CURIOSITY_STACK_V2 = {
  version: '2.0.0',
  phases: [28, 29, 30, 31, 32],
  layers: {
    LL352: 'Exploratory Curiosity Engine',
    LL353: 'Investigative Curiosity Engine',
    LL354: 'Curiosity Governor',
    LL355: 'Ethical Curiosity Boundary (Optional)',
    LL356: 'Human Help Priority Index (Optional)',
  },
  purpose: 'Dual-purpose cognitive radar system: discovery + resolution',
  status: 'ARCHITECTURE_DESIGN',
};
