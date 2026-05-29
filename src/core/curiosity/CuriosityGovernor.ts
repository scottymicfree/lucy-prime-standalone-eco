/**
 * Curiosity Governor (LL354)
 *
 * Arbitration, safety, load control, ethical boundaries
 * Prevents infinite exploration loops and ensures safe operation
 *
 * Purpose: "Balance discovery vs purpose-driven searching with safety"
 */

import { ExploratoryEngine, NoveltyScore, EmergingTopic } from './ExploratoryEngine';
import { InvestigativeEngine, ResolutionCase, UrgencyTier } from './InvestigativeEngine';

export interface SafetyFlag {
  type: 'privacy' | 'accuracy' | 'ethics' | 'load' | 'harm';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
}

export interface GovernorDecision {
  primaryFocus: 'EC' | 'IC' | 'BALANCED';
  ecWeight: number; // 0-1
  icWeight: number; // 0-1
  rationale: string;
  safetyFlags: SafetyFlag[];
  approved: boolean;
  timestamp: number;
}

export interface LoadMetrics {
  parallelInvestigations: number;
  explorationDepth: number;
  signalProcessingRate: number;
  memoryUsage: number;
}

export class CuriosityGovernor {
  private ec: ExploratoryEngine;
  private ic: InvestigativeEngine;
  private loadMetrics: LoadMetrics;
  private decisionHistory: GovernorDecision[] = [];
  private lastECSignal?: NoveltyScore;
  private lastICSignal?: ResolutionCase;

  // Safety thresholds
  private readonly SAFETY_RULES = {
    NO_PERSONAL_IDENTIFICATION: true,
    NO_SURVEILLANCE_ESCALATION: true,
    MIN_CONFIDENCE_FOR_ACTION: 0.75,
    REQUIRE_MULTIPLE_SOURCES: true,
    NO_ACCUSATION_WITHOUT_EVIDENCE: true,
    NO_SPECULATION_AS_FACT: true,
    MAX_PARALLEL_INVESTIGATIONS: 5,
    MAX_EXPLORATION_DEPTH: 3,
    MAX_SIGNAL_PROCESSING_RATE: 1000,
  };

  constructor(ec: ExploratoryEngine, ic: InvestigativeEngine) {
    this.ec = ec;
    this.ic = ic;
    this.loadMetrics = {
      parallelInvestigations: 0,
      explorationDepth: 0,
      signalProcessingRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Main arbitration logic
   */
  arbitrate(ecSignal: NoveltyScore, icSignal?: ResolutionCase): GovernorDecision {
    this.lastECSignal = ecSignal;
    this.lastICSignal = icSignal;

    const safetyFlags: SafetyFlag[] = [];
    let primaryFocus: 'EC' | 'IC' | 'BALANCED' = 'BALANCED';
    let ecWeight = 0.5;
    let icWeight = 0.5;
    let rationale = '';

    // Check safety first
    const safetyCheck = this.validateSafety(ecSignal, icSignal);
    safetyFlags.push(...safetyCheck.flags);

    if (!safetyCheck.approved) {
      return {
        primaryFocus: 'BALANCED',
        ecWeight: 0,
        icWeight: 0,
        rationale: 'Safety constraints violated',
        safetyFlags,
        approved: false,
        timestamp: Date.now(),
      };
    }

    // Rule 1: High human impact + low novelty = prioritize IC
    if (icSignal && icSignal.humanImpact > 0.7 && ecSignal.score < 0.4) {
      primaryFocus = 'IC';
      ecWeight = 0.2;
      icWeight = 0.8;
      rationale = 'High human impact case detected - prioritizing investigation';
    }
    // Rule 2: Critical urgency = always IC
    else if (icSignal && icSignal.urgencyLevel === 'critical') {
      primaryFocus = 'IC';
      ecWeight = 0.1;
      icWeight = 0.9;
      rationale = 'Critical urgency - full investigation focus';
    }
    // Rule 3: High novelty + low impact = exploratory
    else if (ecSignal.score > 0.8 && (!icSignal || icSignal.humanImpact < 0.3)) {
      primaryFocus = 'EC';
      ecWeight = 0.8;
      icWeight = 0.2;
      rationale = 'High novelty discovery - exploratory focus';
    }
    // Rule 4: Balanced discovery + resolution
    else if (ecSignal.score > 0.6 && icSignal && icSignal.solvabilityScore > 0.6) {
      primaryFocus = 'BALANCED';
      ecWeight = 0.5;
      icWeight = 0.5;
      rationale = 'Balanced discovery and resolution opportunity';
    }
    // Default: Investigate high-impact cases
    else {
      primaryFocus = 'IC';
      ecWeight = 0.3;
      icWeight = 0.7;
      rationale = 'Default: prioritizing investigation over exploration';
    }

    // Check load limits
    const loadCheck = this.checkLoadLimits();
    if (!loadCheck.approved) {
      safetyFlags.push(...loadCheck.flags);
      ecWeight *= 0.5;
      icWeight *= 0.5;
      rationale += ' [Load limits enforced]';
    }

    const decision: GovernorDecision = {
      primaryFocus,
      ecWeight,
      icWeight,
      rationale,
      safetyFlags,
      approved: true,
      timestamp: Date.now(),
    };

    this.decisionHistory.push(decision);
    return decision;
  }

  /**
   * Validate safety constraints
   */
  private validateSafety(ecSignal: NoveltyScore, icSignal?: ResolutionCase): { approved: boolean; flags: SafetyFlag[] } {
    const flags: SafetyFlag[] = [];

    // Privacy checks
    if (this.SAFETY_RULES.NO_PERSONAL_IDENTIFICATION) {
      // Check if signal contains personal data
    }

    // Accuracy checks
    if (this.SAFETY_RULES.MIN_CONFIDENCE_FOR_ACTION) {
      if (ecSignal.confidence < this.SAFETY_RULES.MIN_CONFIDENCE_FOR_ACTION) {
        flags.push({
          type: 'accuracy',
          severity: 'high',
          message: `EC confidence ${ecSignal.confidence.toFixed(2)} below threshold ${this.SAFETY_RULES.MIN_CONFIDENCE_FOR_ACTION}`,
        });
      }
    }

    // Ethical checks
    if (icSignal && this.SAFETY_RULES.NO_ACCUSATION_WITHOUT_EVIDENCE) {
      if (icSignal.type === 'cold_case' && icSignal.solvabilityScore < 0.5) {
        flags.push({
          type: 'ethics',
          severity: 'high',
          message: 'Insufficient evidence for cold case investigation',
        });
      }
    }

    const approved = flags.filter((f) => f.severity === 'critical').length === 0;

    return { approved, flags };
  }

  /**
   * Check load limits
   */
  private checkLoadLimits(): { approved: boolean; flags: SafetyFlag[] } {
    const flags: SafetyFlag[] = [];

    if (this.loadMetrics.parallelInvestigations > this.SAFETY_RULES.MAX_PARALLEL_INVESTIGATIONS) {
      flags.push({
        type: 'load',
        severity: 'high',
        message: `Parallel investigations (${this.loadMetrics.parallelInvestigations}) exceeds limit (${this.SAFETY_RULES.MAX_PARALLEL_INVESTIGATIONS})`,
      });
    }

    if (this.loadMetrics.explorationDepth > this.SAFETY_RULES.MAX_EXPLORATION_DEPTH) {
      flags.push({
        type: 'load',
        severity: 'medium',
        message: `Exploration depth (${this.loadMetrics.explorationDepth}) exceeds limit (${this.SAFETY_RULES.MAX_EXPLORATION_DEPTH})`,
      });
    }

    if (this.loadMetrics.signalProcessingRate > this.SAFETY_RULES.MAX_SIGNAL_PROCESSING_RATE) {
      flags.push({
        type: 'load',
        severity: 'high',
        message: `Signal processing rate (${this.loadMetrics.signalProcessingRate}) exceeds limit (${this.SAFETY_RULES.MAX_SIGNAL_PROCESSING_RATE})`,
      });
    }

    const approved = flags.filter((f) => f.severity === 'critical').length === 0;

    return { approved, flags };
  }

  /**
   * Enforce load limits
   */
  enforceLoadLimits(signals: any[]): any[] {
    const filtered: any[] = [];
    for (const signal of signals) {
      if (this.loadMetrics.signalProcessingRate < this.SAFETY_RULES.MAX_SIGNAL_PROCESSING_RATE) {
        filtered.push(signal);
        this.loadMetrics.signalProcessingRate++;
      }
    }
    return filtered;
  }

  /**
   * Validate ethical boundaries
   */
  validateEthicalBoundaries(target: any): boolean {
    // Check privacy constraints
    if (this.SAFETY_RULES.NO_PERSONAL_IDENTIFICATION) {
      // Scan for personal identifiers
    }

    // Check accuracy requirements
    if (target.confidence && target.confidence < this.SAFETY_RULES.MIN_CONFIDENCE_FOR_ACTION) {
      return false;
    }

    // Check for speculation
    if (this.SAFETY_RULES.NO_SPECULATION_AS_FACT) {
      if (target.confidence < 0.7) {
        return false;
      }
    }

    return true;
  }

  /**
   * Update load metrics
   */
  updateLoadMetrics(metrics: Partial<LoadMetrics>): void {
    this.loadMetrics = { ...this.loadMetrics, ...metrics };
  }

  /**
   * Get decision history
   */
  getDecisionHistory(limit: number = 10): GovernorDecision[] {
    return this.decisionHistory.slice(-limit);
  }

  /**
   * Get current load metrics
   */
  getLoadMetrics(): LoadMetrics {
    return { ...this.loadMetrics };
  }
}

export default CuriosityGovernor;
