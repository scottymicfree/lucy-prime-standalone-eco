/**
 * Exploratory Curiosity Engine (LL352)
 *
 * Free-roam intelligence discovery layer
 * Detects novelty, identifies emerging patterns, tracks global signal drift
 *
 * Purpose: "Find what is becoming important before humans notice it"
 */

export interface Signal {
  domain?: string;
  confidence?: number;
  input?: string;
}

export interface Pattern {
  id: string;
}

export interface AnomalyGroup {
  id: string;
}

export interface NoveltyScore {
  score: number; // 0-1: how novel/unusual
  velocity: number; // change rate per day
  confidence: number; // 0-1: confidence in novelty
  baseline: number; // historical average
  deviation: number; // standard deviations from mean
}

export interface EmergingTopic {
  topic: string;
  noveltyScore: number;
  velocity: number;
  clusters: string[];
  lifecycle: 'birth' | 'growth' | 'maturity' | 'decline';
  discoveryPotential: number;
  firstDetected: number;
  lastUpdated: number;
}

export interface SignalDrift {
  domain: string;
  previousDistribution: number[];
  currentDistribution: number[];
  shift: number; // 0-1: magnitude of shift
  direction: 'increasing' | 'decreasing' | 'stable';
  velocity: number;
}

export interface ExplorationTarget {
  topic: string;
  noveltyScore: number;
  velocity: number;
  recommendedAction: string;
  priority: number;
  estimatedImportance: number;
}

export class ExploratoryEngine {
  private historicalBaseline: Map<string, number[]> = new Map();
  private emergingTopics: Map<string, EmergingTopic> = new Map();
  private signalDrifts: Map<string, SignalDrift> = new Map();
  private noveltyThreshold: number = 2.0; // 2 sigma
  private minVelocity: number = 0.01; // minimum change rate

  /**
   * Detect novelty in incoming signals
   */
  detectNovelty(signal: Signal): NoveltyScore {
    const domain = signal.domain || 'general';
    const baseline = this.getBaseline(domain);

    if (!baseline || baseline.length === 0) {
      return { score: 0.5, velocity: 0, confidence: 0.3, baseline: 0, deviation: 0 };
    }

    // Calculate statistics
    const mean = baseline.reduce((a, b) => a + b) / baseline.length;
    const variance = baseline.reduce((a, b) => a + Math.pow(b - mean, 2)) / baseline.length;
    const stdDev = Math.sqrt(variance);

    // Normalize signal value
    const normalizedValue = signal.confidence || 0.5;
    const deviation = (normalizedValue - mean) / (stdDev || 1);

    // Calculate novelty score (0-1)
    const noveltyScore = Math.min(1, Math.abs(deviation) / this.noveltyThreshold);

    // Calculate velocity (change rate)
    const velocity = this.calculateVelocity(domain, normalizedValue);

    return {
      score: noveltyScore,
      velocity,
      confidence: Math.min(1, Math.abs(deviation) / 3),
      baseline: mean,
      deviation,
    };
  }

  /**
   * Identify emerging patterns
   */
  identifyEmergingPatterns(): EmergingTopic[] {
    const patterns: EmergingTopic[] = [];
    this.emergingTopics.forEach((topic) => {
      if (topic.discoveryPotential > 0.5) {
        patterns.push(topic);
      }
    });

    // Sort by discovery potential
    return patterns.sort((a, b) => b.discoveryPotential - a.discoveryPotential);
  }

  /**
   * Track global signal drift
   */
  trackGlobalDrift(): SignalDrift[] {
    const drifts: SignalDrift[] = [];
    this.signalDrifts.forEach((drift) => {
      if (drift.shift > 0.1) {
        drifts.push(drift);
      }
    });
    return drifts.sort((a, b) => b.shift - a.shift);
  }

  /**
   * Score discovery potential for a topic
   */
  scoreDiscoveryPotential(topic: string): number {
    const emergingTopic = this.emergingTopics.get(topic);
    if (!emergingTopic) return 0;

    // Combine novelty, velocity, and lifecycle stage
    const noveltyComponent = emergingTopic.noveltyScore * 0.4;
    const velocityComponent = Math.min(1, emergingTopic.velocity * 10) * 0.3;
    const lifecycleComponent = this.getLifecycleScore(emergingTopic.lifecycle) * 0.3;

    return Math.min(1, noveltyComponent + velocityComponent + lifecycleComponent);
  }

  /**
   * Generate exploration targets
   */
  generateExplorationTargets(): ExplorationTarget[] {
    const targets: ExplorationTarget[] = [];
    this.emergingTopics.forEach((topic) => {
      const potential = this.scoreDiscoveryPotential(topic.topic);
      if (potential > 0.4) {
        targets.push({
          topic: topic.topic,
          noveltyScore: topic.noveltyScore,
          velocity: topic.velocity,
          recommendedAction: this.getRecommendedAction(topic),
          priority: potential,
          estimatedImportance: this.estimateImportance(topic),
        });
      }
    });
    return targets.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update with new signal
   */
  updateWithSignal(signal: Signal): void {
    const domain = signal.domain || 'general';

    // Update baseline
    this.updateBaseline(domain, signal.confidence || 0.5);

    // Detect novelty
    const novelty = this.detectNovelty(signal);

    // Update or create emerging topic
    if (novelty.score > 0.5) {
      this.updateEmergingTopic(signal, novelty);
    }

    // Track drift
    this.updateSignalDrift(domain);
  }

  /**
   * Private helper methods
   */
  private getBaseline(domain: string): number[] {
    return this.historicalBaseline.get(domain) || [];
  }

  private updateBaseline(domain: string, value: number): void {
    const baseline = this.historicalBaseline.get(domain) || [];
    baseline.push(value);

    // Keep last 1000 values
    if (baseline.length > 1000) {
      baseline.shift();
    }
    this.historicalBaseline.set(domain, baseline);
  }

  private calculateVelocity(domain: string, currentValue: number): number {
    const baseline = this.getBaseline(domain);
    if (baseline.length < 2) return 0;

    const previous = baseline[baseline.length - 2];
    const current = baseline[baseline.length - 1];

    return (current - previous) / (previous || 1);
  }

  private updateEmergingTopic(signal: Signal, novelty: NoveltyScore): void {
    const topic = signal.input || 'unknown';
    const existing = this.emergingTopics.get(topic);

    if (existing) {
      existing.noveltyScore = (existing.noveltyScore + novelty.score) / 2;
      existing.velocity = (existing.velocity + novelty.velocity) / 2;
      existing.lastUpdated = Date.now();
      existing.discoveryPotential = this.scoreDiscoveryPotential(topic);
    } else {
      this.emergingTopics.set(topic, {
        topic,
        noveltyScore: novelty.score,
        velocity: novelty.velocity,
        clusters: [signal.domain || 'general'],
        lifecycle: 'birth',
        discoveryPotential: novelty.score,
        firstDetected: Date.now(),
        lastUpdated: Date.now(),
      });
    }
  }

  private updateSignalDrift(domain: string): void {
    const baseline = this.getBaseline(domain);
    if (baseline.length < 10) return;

    const recent = baseline.slice(-10);
    const older = baseline.slice(-20, -10);

    const recentMean = recent.reduce((a, b) => a + b) / recent.length;
    const olderMean = older.reduce((a, b) => a + b) / older.length;

    const shift = Math.abs(recentMean - olderMean) / (olderMean || 1);
    const direction = recentMean > olderMean ? 'increasing' : 'decreasing';

    this.signalDrifts.set(domain, {
      domain,
      previousDistribution: older,
      currentDistribution: recent,
      shift,
      direction,
      velocity: (recentMean - olderMean) / 10,
    });
  }

  private getLifecycleScore(lifecycle: string): number {
    const scores: Record<string, number> = {
      'birth': 0.9,
      'growth': 0.8,
      'maturity': 0.5,
      'decline': 0.2,
    };
    return scores[lifecycle] || 0.5;
  }

  private getRecommendedAction(topic: EmergingTopic): string {
    if (topic.velocity > 0.1) {
      return 'Monitor for convergence';
    } else if (topic.noveltyScore > 0.8) {
      return 'Deep investigation';
    } else {
      return 'Track and correlate';
    }
  }

  private estimateImportance(topic: EmergingTopic): number {
    return Math.min(1, topic.noveltyScore * 0.5 + topic.velocity * 0.5);
  }
}

export default ExploratoryEngine;
