/**
 * WHAT THIS DOES:
 * Establishes the complete 350-node identity registry for Lucy Sovereign, including legacy identities and v8 extensions.
 *
 * WHY THIS EXISTS:
 * To provide a source-of-truth mapping for all system nodes, preserving legacy nodes and mapping the new domain layers (sensor, builder, game dev) without deleting anything.
 *
 * HOW THIS WORKS:
 * Exports a constant object mapping Node IDs (e.g., 'LL000' to 'LL350') to their metadata, category, and evolved alias if applicable.
 *
 * HOW TO CHANGE IT:
 * Do not delete any nodes. Instead, add 'evolvedAlias' when renaming (e.g., LL068 evolving). Append new nodes into reserved ranges.
 *
 * DEBUG EXAMPLE:
 * If a Dashboard tool fails to locate 'LL068', the registry ensures it remaps to 'IRON_PULSE_PRIME'.
 */

export interface LucyNodeIdentity {
  id: string;
  name: string;
  category: string;
  evolvedAlias?: string;
  status: 'idle' | 'active' | 'reserved' | 'error';
  lastActive: number;
  dependencies: string[];
}

export const NODE_IDENTITY_REGISTRY: Record<string, LucyNodeIdentity> = {};

function populateRange(
  start: number,
  end: number,
  category: string,
  prefix: string = 'LL',
  baseName: string = 'Node',
  depRange?: { start: number, end: number, prefix: string }
) {
  for (let i = start; i <= end; i++) {
    const padded = i.toString().padStart(3, '0');
    const id = `${prefix}${padded}`;
    
    const dependencies: string[] = [];
    if (depRange) {
      const numDeps = Math.floor(Math.random() * 3) + 1; // 1 to 3 deps
      for (let d = 0; d < numDeps; d++) {
        const depId = Math.floor(Math.random() * (depRange.end - depRange.start + 1)) + depRange.start;
        dependencies.push(`${depRange.prefix}${depId.toString().padStart(3, '0')}`);
      }
    } else if (category !== 'Root / Refiner' && id !== 'LL000') {
      dependencies.push('LL000');
    }

    NODE_IDENTITY_REGISTRY[id] = {
      id,
      name: `${baseName} ${padded}`,
      category,
      status: 'idle',
      lastActive: 0,
      dependencies
    };
  }
}

// LL000 SHADOW_MIRROR
NODE_IDENTITY_REGISTRY['LL000'] = {
    id: 'LL000',
    name: 'SHADOW_MIRROR',
    category: 'Root / Refiner',
    status: 'idle',
    lastActive: 0,
    dependencies: []
};

// LL001-LL119 Classical Core
populateRange(1, 119, 'Classical Core', 'LL', 'Classical Core', { start: 0, end: 0, prefix: 'LL' });

// LL120-LL137 Oracle / Quantum Gate layer
populateRange(120, 137, 'Oracle / Quantum Gate', 'LL', 'Oracle Node', { start: 1, end: 119, prefix: 'LL' });

// LL138-LL150 Stem Cell Pool
populateRange(138, 150, 'Stem Cell Pool', 'LL', 'Stem Cell', { start: 120, end: 137, prefix: 'LL' });

// LL151-LL200 Planetary / Sensor / Feed layer
populateRange(151, 200, 'Planetary Sensor', 'LL', 'Sensor Feed', { start: 138, end: 150, prefix: 'LL' });

// LL201-LL250 v7 Intelligence / Control layer
populateRange(201, 250, 'Intelligence / Control', 'LL', 'Intelligence Controller', { start: 151, end: 200, prefix: 'LL' });

// LL251-LL325 v8 Builder / GameDev layer
populateRange(251, 325, 'Builder / GameDev', 'LL', 'Builder Node', { start: 201, end: 250, prefix: 'LL' });

// LL326-LL350 Reserved Evolution Pool
populateRange(326, 350, 'Reserved Evolution Pool', 'LL', 'Evolution Reserved', { start: 251, end: 325, prefix: 'LL' });

// Evolution Aliases
if (NODE_IDENTITY_REGISTRY['LL068']) {
    NODE_IDENTITY_REGISTRY['LL068'].name = 'IRON_PULSE';
    NODE_IDENTITY_REGISTRY['LL068'].evolvedAlias = 'IRON_PULSE_PRIME';
}

if (NODE_IDENTITY_REGISTRY['LL108']) {
    NODE_IDENTITY_REGISTRY['LL108'].name = 'PULSE_MATRIX';
    NODE_IDENTITY_REGISTRY['LL108'].evolvedAlias = 'PULSE_MATRIX_CORE';
}

if (NODE_IDENTITY_REGISTRY['LL352']) {
    NODE_IDENTITY_REGISTRY['LL352'].name = 'Exploratory Curiosity (EC)';
    NODE_IDENTITY_REGISTRY['LL352'].evolvedAlias = 'EC_ENGINE';
    NODE_IDENTITY_REGISTRY['LL352'].category = 'Reserved Evolution Pool (Curiosity)';
}

if (NODE_IDENTITY_REGISTRY['LL353']) {
    NODE_IDENTITY_REGISTRY['LL353'].name = 'Investigative Curiosity (IC)';
    NODE_IDENTITY_REGISTRY['LL353'].evolvedAlias = 'IC_ENGINE';
    NODE_IDENTITY_REGISTRY['LL353'].category = 'Reserved Evolution Pool (Curiosity)';
}

if (NODE_IDENTITY_REGISTRY['LL354']) {
    NODE_IDENTITY_REGISTRY['LL354'].name = 'Curiosity Governor (CG)';
    NODE_IDENTITY_REGISTRY['LL354'].evolvedAlias = 'CG_ENGINE';
    NODE_IDENTITY_REGISTRY['LL354'].category = 'Reserved Evolution Pool (Curiosity)';
}

NODE_IDENTITY_REGISTRY['LL355'] = {
    id: 'LL355',
    name: 'Deep Research Agent (DR)',
    evolvedAlias: 'DEEP_RESEARCH_CORE',
    category: 'Reserved Evolution Pool (Deep Research)',
    status: 'idle',
    lastActive: 0,
    dependencies: ['LL200']
};

NODE_IDENTITY_REGISTRY['LL366'] = {
    id: 'LL366',
    name: 'HISTORY_REASONER',
    category: 'Curiosity / Bridge',
    status: 'idle',
    lastActive: 0,
    dependencies: ['LL150']
};

NODE_IDENTITY_REGISTRY['LL367'] = {
    id: 'LL367',
    name: 'EC_HISTORY_BRIDGE',
    category: 'Curiosity / Bridge',
    status: 'idle',
    lastActive: 0,
    dependencies: ['LL366']
};

NODE_IDENTITY_REGISTRY['LL368'] = {
    id: 'LL368',
    name: 'IC_HISTORY_BRIDGE',
    category: 'Curiosity / Bridge',
    status: 'idle',
    lastActive: 0,
    dependencies: ['LL366']
};

NODE_IDENTITY_REGISTRY['LL369'] = {
    id: 'LL369',
    name: 'REPEAT_CYCLE_DETECTOR',
    category: 'Curiosity / Bridge',
    status: 'idle',
    lastActive: 0,
    dependencies: ['LL366']
};

NODE_IDENTITY_REGISTRY['LL370'] = {
    id: 'LL370',
    name: 'SAFE_PATH_RECOMMENDER',
    category: 'Curiosity / Bridge',
    status: 'idle',
    lastActive: 0,
    dependencies: ['LL366']
};
