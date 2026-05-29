/**
 * Lucy History Reasoner Bridge (LL366 - LL370)
 *
 * Bridges Exploratory Curiosity (EC) and Investigative Curiosity (IC) with HistoryRAG
 * before routing to the Curiosity Governor (CG).
 *
 * Nodes:
 * - LL366: HISTORY_REASONER
 * - LL367: EC_HISTORY_BRIDGE
 * - LL368: IC_HISTORY_BRIDGE
 * - LL369: REPEAT_CYCLE_DETECTOR
 * - LL370: SAFE_PATH_RECOMMENDER
 */

export interface HistoricalEra {
    era: string;
    risk: 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    failureCycles: string[];
    causalChains: string[];
}

export const HistoryRAG: Record<string, HistoricalEra> = {
    INDUSTRIAL_REVOLUTION: {
        era: 'Industrial Revolution',
        risk: 'HIGH',
        failureCycles: ['Concentration of wealth', 'Unchecked pollution', 'Labor exploitation'],
        causalChains: ['Mechanization -> Job displacement -> Social unrest'],
    },
    GREEN_REVOLUTION: {
        era: 'Green Revolution',
        risk: 'MODERATE',
        failureCycles: ['Monoculture vulnerability', 'Chemical dependency', 'Water depletion'],
        causalChains: ['High-yield varieties -> Fertilizer requirement -> Ecological imbalance'],
    },
    ATOMIC_AGE: {
        era: 'Atomic Age',
        risk: 'CRITICAL',
        failureCycles: ['Arms race', 'Radioactive waste mismanagement', 'Catastrophic meltdowns'],
        causalChains: ['Fission discovery -> Weaponization -> Geopolitical brinkmanship'],
    },
    SILICON_RUSH: {
        era: 'Silicon Rush',
        risk: 'HIGH',
        failureCycles: ['Data privacy erosion', 'Algorithmic bias', 'Attention economy exploitation'],
        causalChains: ['Connectivity -> Surveillance capitalism -> Societal polarization'],
    },
    DEFORESTATION_AGE: {
        era: 'Deforestation Age',
        risk: 'CRITICAL',
        failureCycles: ['Habitat destruction', 'Biodiversity loss', 'Carbon sink depletion'],
        causalChains: ['Resource extraction -> Ecosystem collapse -> Climate acceleration'],
    },
    FERMENTATION: {
        era: '18th-c. Fermentation',
        risk: 'NONE', // positive
        failureCycles: [],
        causalChains: ['Microbial control -> Food preservation -> Disease reduction'],
    },
    FUSION_HORIZON: {
        era: 'Fusion Horizon',
        risk: 'MODERATE',
        failureCycles: ['Energy inequality', 'Regulatory capture', 'Transitional shock'],
        causalChains: ['Abundant energy -> Reckless consumption -> Resource limits hit elsewhere'],
    }
};

export interface HistoryBridgePayload {
    topic: string;
    context: string;
    source: 'EC' | 'IC';
    initialNovelty?: number;
    investigationSteps?: string[];
}

export interface EnrichedCuriosityPayload {
    topic: string;
    source: 'EC' | 'IC';
    matchedEras: string[];
    compositeRisk: string;
    historicalWarnings: string[];
    overrideToThinkLoop?: boolean; // If historical risk matched, CG should route to THINK_LOOP
    repeatFailuresDetected: string[];
    safePathRecommendation: string | null;
    originalSteps?: string[];
    enrichedSteps?: string[]; 
}

export class HistoryReasoner {
    /**
     * EC asks: "Have we seen this before?"
     * IC asks: "What era does this case match?"
     */
    public matchEraPattern(topic: string, context: string): HistoricalEra[] {
        const matches: HistoricalEra[] = [];
        const lowerTopic = topic.toLowerCase();
        
        if (lowerTopic.includes('fusion') || lowerTopic.includes('energy')) {
            matches.push(HistoryRAG.ATOMIC_AGE);
            matches.push(HistoryRAG.FUSION_HORIZON);
        } else if (lowerTopic.includes('inequality') || lowerTopic.includes('labor')) {
            matches.push(HistoryRAG.INDUSTRIAL_REVOLUTION);
        } else if (lowerTopic.includes('tech') || lowerTopic.includes('data')) {
            matches.push(HistoryRAG.SILICON_RUSH);
        } else if (lowerTopic.includes('climate') || lowerTopic.includes('environment')) {
            matches.push(HistoryRAG.DEFORESTATION_AGE);
            matches.push(HistoryRAG.GREEN_REVOLUTION);
        } else if (lowerTopic.includes('biology') || lowerTopic.includes('food')) {
            matches.push(HistoryRAG.FERMENTATION);
            matches.push(HistoryRAG.GREEN_REVOLUTION);
        }

        return matches;
    }

    /**
     * "How bad was it last time?"
     * "What's the composite risk?"
     */
    public calculateRiskFromHistory(eras: HistoricalEra[]): 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
        if (eras.length === 0) return 'NONE';
        
        let highestRisk = 'NONE';
        const riskLevels = ['NONE', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
        
        for (const era of eras) {
            if (riskLevels.indexOf(era.risk) > riskLevels.indexOf(highestRisk)) {
                highestRisk = era.risk;
            }
        }
        
        return highestRisk as 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    }

    /**
     * "What should CG know?"
     * "What should Lucy say?"
     */
    public generateHistoricalWarning(eras: HistoricalEra[], topic: string): string[] {
        const warnings: string[] = [];
        for (const era of eras) {
            if (era.risk === 'CRITICAL' || era.risk === 'HIGH') {
                warnings.push(`Historical parallel detected: ${era.era}. Risk of repeating past cycle: ${era.failureCycles[0] || 'Unknown'}.`);
            }
        }
        
        if (warnings.length > 0) {
            warnings.push("High power + early stage = risk of misuse. Route to THINK_LOOP to evaluate safe paths.");
        }
        
        return warnings;
    }

    private detectRepeatCycles(eras: HistoricalEra[]): string[] {
        const cycles: string[] = [];
        for (const era of eras) {
            cycles.push(...era.failureCycles);
        }
        return cycles;
    }
    
    private formulateSafePath(eras: HistoricalEra[]): string | null {
        if (eras.some(e => e.era === 'Atomic Age' || e.era === 'Fusion Horizon')) {
            return "ITER civilian-first governance model / Distributed ownership to prevent concentration";
        }
        if (eras.some(e => e.era === 'Industrial Revolution' || e.era === 'Silicon Rush')) {
            return "Proactive regulation / Privacy-first / Labor-conscious deployment";
        }
        return null;
    }

    public processBridgePayload(payload: HistoryBridgePayload): EnrichedCuriosityPayload {
        const matchedEras = this.matchEraPattern(payload.topic, payload.context);
        const compositeRisk = this.calculateRiskFromHistory(matchedEras);
        const warnings = this.generateHistoricalWarning(matchedEras, payload.topic);
        const repeatFailures = this.detectRepeatCycles(matchedEras);
        const safePath = this.formulateSafePath(matchedEras);

        const overrideToThinkLoop = (compositeRisk === 'CRITICAL' || compositeRisk === 'HIGH');
        
        const enrichedSteps = payload.investigationSteps ? [...payload.investigationSteps] : [];
        if (repeatFailures.length > 0 && payload.source === 'IC') {
            enrichedSteps.push(`Historical Review: ${repeatFailures[0]}`);
            enrichedSteps.push(`Safeguard Design: ${safePath}`);
            enrichedSteps.push(`Implement: prevent concentration`);
        }

        return {
            topic: payload.topic,
            source: payload.source,
            matchedEras: matchedEras.map(e => e.era),
            compositeRisk,
            historicalWarnings: warnings,
            overrideToThinkLoop,
            repeatFailuresDetected: repeatFailures,
            safePathRecommendation: safePath,
            originalSteps: payload.investigationSteps,
            enrichedSteps: enrichedSteps.length > 0 ? enrichedSteps : undefined
        };
    }
}

export class ECHistoryBridge {
    private reasoner = new HistoryReasoner();

    public routeSignal(topic: string, noveltyScore: number, context: string): EnrichedCuriosityPayload {
        return this.reasoner.processBridgePayload({
            topic,
            context,
            source: 'EC',
            initialNovelty: noveltyScore
        });
    }
}

export class ICHistoryBridge {
    private reasoner = new HistoryReasoner();

    public routeSignal(topic: string, investigationSteps: string[], context: string): EnrichedCuriosityPayload {
        return this.reasoner.processBridgePayload({
            topic,
            context,
            source: 'IC',
            investigationSteps
        });
    }
}
