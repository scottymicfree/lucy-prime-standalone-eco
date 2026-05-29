/**
 * Investigative Curiosity Engine (LL353)
 *
 * Goal-directed resolution and impact-focused searching
 * Targets cold cases, scientific anomalies, systemic issues
 *
 * Purpose: "Find what should be solved and hasn't been"
 */

export type UrgencyTier = 'critical' | 'high' | 'medium' | 'low';
export type CaseType = 'cold_case' | 'scientific' | 'systemic' | 'environmental';

export interface ResolutionCase {
  id: string;
  title: string;
  type: CaseType;
  description: string;
  humanImpact: number; // 0-1: how many people affected
  solvabilityScore: number; // 0-1: likelihood of resolution
  urgencyLevel: UrgencyTier;
  dataAvailable: boolean;
  lastInvestigated?: number;
  status: 'open' | 'investigating' | 'resolved' | 'blocked';
}

export interface CausalChain {
  steps: CausalStep[];
  confidence: number;
  gaps: string[];
  requiredData: string[];
}

export interface CausalStep {
  cause: string;
  effect: string;
  confidence: number;
  evidence: string[];
}

export interface InvestigativeTarget {
  case: ResolutionCase;
  investigationPath: CausalChain;
  priority: number;
  estimatedTimeToResolution: number;
  requiredResources: string[];
  nextSteps: string[];
}

export class InvestigativeEngine {
  private resolutionCases: Map<string, ResolutionCase> = new Map();
  private causalChains: Map<string, CausalChain> = new Map();
  private investigationHistory: Map<string, number> = new Map();

  /**
   * Identify resolution cases
   */
  identifyResolutionCases(): ResolutionCase[] {
    const cases: ResolutionCase[] = [];
    this.resolutionCases.forEach((caseItem) => {
      if (caseItem.status === 'open' || caseItem.status === 'investigating') {
        cases.push(caseItem);
      }
    });

    return cases.sort((a, b) => {
      // Sort by impact * solvability
      const scoreA = a.humanImpact * a.solvabilityScore;
      const scoreB = b.humanImpact * b.solvabilityScore;
      return scoreB - scoreA;
    });
  }

  /**
   * Calculate human impact for a case
   */
  calculateHumanImpact(caseItem: ResolutionCase): number {
    // Combine multiple factors
    const baseImpact = caseItem.humanImpact;
    const urgencyMultiplier = this.getUrgencyMultiplier(caseItem.urgencyLevel);
    const dataAvailabilityBoost = caseItem.dataAvailable ? 0.1 : 0;

    return Math.min(1, baseImpact * urgencyMultiplier + dataAvailabilityBoost);
  }

  /**
   * Assess solvability of a case
   */
  assessSolvability(caseItem: ResolutionCase): number {
    // Combine multiple factors
    const baseScore = caseItem.solvabilityScore;
    const dataBoost = caseItem.dataAvailable ? 0.2 : 0;
    const timeDecay = this.calculateTimeDecay(caseItem);

    return Math.min(1, baseScore + dataBoost - timeDecay);
  }

  /**
   * Build causal chain for investigation
   */
  buildCausalChain(caseItem: ResolutionCase): CausalChain {
    const existing = this.causalChains.get(caseItem.id);
    if (existing) return existing;

    // Generate causal chain based on case type
    const chain = this.generateCausalChain(caseItem);
    this.causalChains.set(caseItem.id, chain);
    return chain;
  }

  /**
   * Prioritize investigations
   */
  prioritizeInvestigation(): InvestigativeTarget[] {
    const targets: InvestigativeTarget[] = [];
    const cases = this.identifyResolutionCases();

    for (const caseItem of cases) {
      const impact = this.calculateHumanImpact(caseItem);
      const solvability = this.assessSolvability(caseItem);
      const chain = this.buildCausalChain(caseItem);

      const priority = impact * solvability * chain.confidence;

      if (priority > 0.3) {
        targets.push({
          case: caseItem,
          investigationPath: chain,
          priority,
          estimatedTimeToResolution: this.estimateTimeToResolution(caseItem),
          requiredResources: this.identifyRequiredResources(caseItem),
          nextSteps: this.generateNextSteps(caseItem, chain),
        });
      }
    }

    return targets.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Register a new case
   */
  registerCase(caseItem: ResolutionCase): void {
    this.resolutionCases.set(caseItem.id, caseItem);
  }

  /**
   * Update case status
   */
  updateCaseStatus(caseId: string, status: ResolutionCase['status']): void {
    const caseItem = this.resolutionCases.get(caseId);
    if (caseItem) {
      caseItem.status = status;
      this.investigationHistory.set(caseId, Date.now());
    }
  }

  /**
   * Get investigation history
   */
  getInvestigationHistory(caseId: string): number | undefined {
    return this.investigationHistory.get(caseId);
  }

  /**
   * Private helper methods
   */
  private getUrgencyMultiplier(urgency: UrgencyTier): number {
    const multipliers: Record<UrgencyTier, number> = {
      'critical': 1.5,
      'high': 1.2,
      'medium': 1.0,
      'low': 0.8,
    };
    return multipliers[urgency];
  }

  private calculateTimeDecay(caseItem: ResolutionCase): number {
    if (!caseItem.lastInvestigated) return 0;
    const daysSinceInvestigation = (Date.now() - caseItem.lastInvestigated) / (1000 * 60 * 60 * 24);
    const decayRate = 0.01; // 1% per day
    return Math.min(0.3, daysSinceInvestigation * decayRate);
  }

  private generateCausalChain(caseItem: ResolutionCase): CausalChain {
    const steps: CausalStep[] = [];
    const gaps: string[] = [];
    const requiredData: string[] = [];

    // Generate chain based on case type
    switch (caseItem.type) {
      case 'cold_case':
        steps.push(
          {
            cause: 'Initial incident',
            effect: 'Evidence collection',
            confidence: 0.8,
            evidence: ['witness statements', 'physical evidence'],
          },
          {
            cause: 'Evidence analysis',
            effect: 'Pattern identification',
            confidence: 0.6,
            evidence: ['forensic analysis', 'timeline reconstruction'],
          }
        );
        gaps.push('Missing evidence', 'Witness availability');
        requiredData.push('historical records', 'forensic data');
        break;
      case 'scientific':
        steps.push(
          {
            cause: 'Anomaly detection',
            effect: 'Hypothesis formation',
            confidence: 0.7,
            evidence: ['experimental data', 'literature review'],
          },
          {
            cause: 'Hypothesis testing',
            effect: 'Theory validation',
            confidence: 0.5,
            evidence: ['reproducible results', 'peer review'],
          }
        );
        gaps.push('Experimental limitations', 'Data gaps');
        requiredData.push('experimental data', 'theoretical models');
        break;
      case 'systemic':
        steps.push(
          {
            cause: 'Problem identification',
            effect: 'Root cause analysis',
            confidence: 0.7,
            evidence: ['system metrics', 'failure logs'],
          },
          {
            cause: 'Root cause analysis',
            effect: 'Solution design',
            confidence: 0.6,
            evidence: ['expert analysis', 'simulation results'],
          }
        );
        gaps.push('System complexity', 'Data availability');
        requiredData.push('system logs', 'performance metrics');
        break;
      case 'environmental':
        steps.push(
          {
            cause: 'Environmental change',
            effect: 'Impact assessment',
            confidence: 0.7,
            evidence: ['sensor data', 'satellite imagery'],
          },
          {
            cause: 'Impact assessment',
            effect: 'Mitigation strategy',
            confidence: 0.5,
            evidence: ['modeling results', 'expert consensus'],
          }
        );
        gaps.push('Long-term data', 'Prediction uncertainty');
        requiredData.push('environmental data', 'climate models');
        break;
    }

    return {
      steps,
      confidence: steps.reduce((a, b) => a + b.confidence, 0) / steps.length,
      gaps,
      requiredData,
    };
  }

  private estimateTimeToResolution(caseItem: ResolutionCase): number {
    // Estimate in days
    const baseTime = 30; // 30 days base
    const impactMultiplier = caseItem.humanImpact * 2;
    const solvabilityDivisor = caseItem.solvabilityScore || 0.5;

    return Math.round((baseTime * impactMultiplier) / solvabilityDivisor);
  }

  private identifyRequiredResources(caseItem: ResolutionCase): string[] {
    const resources: string[] = [];

    if (caseItem.dataAvailable) {
      resources.push('data_access');
    }

    switch (caseItem.type) {
      case 'cold_case':
        resources.push('forensic_experts', 'historical_records', 'witness_coordination');
        break;
      case 'scientific':
        resources.push('research_equipment', 'computational_resources', 'expert_analysis');
        break;
      case 'systemic':
        resources.push('system_access', 'engineering_expertise', 'testing_environment');
        break;
      case 'environmental':
        resources.push('sensor_network', 'modeling_tools', 'climate_expertise');
        break;
    }

    return resources;
  }

  private generateNextSteps(caseItem: ResolutionCase, chain: CausalChain): string[] {
    const steps: string[] = [];

    // First step: gather required data
    if (chain.requiredData.length > 0) {
      steps.push(`Gather: ${chain.requiredData[0]}`);
    }

    // Second step: address gaps
    if (chain.gaps.length > 0) {
      steps.push(`Address: ${chain.gaps[0]}`);
    }

    // Third step: execute first causal step
    if (chain.steps.length > 0) {
      steps.push(`Execute: ${chain.steps[0].cause} → ${chain.steps[0].effect}`);
    }

    return steps;
  }
}

export default InvestigativeEngine;
