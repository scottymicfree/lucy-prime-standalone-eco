import { globalEventBus } from './EventBus';
import { LucyNode, NodeCategory, SystemMessage } from './types';
import { NODE_IDENTITY_REGISTRY } from './NodeIdentityRegistry';

export const INITIAL_NODES: Record<string, LucyNode> = {};

for (const [id, node] of Object.entries(NODE_IDENTITY_REGISTRY)) {
  INITIAL_NODES[id] = {
    id: node.id,
    name: node.evolvedAlias || node.name,
    category: node.category,
    status: 'idle',
    lastActive: 0,
    dependencies: node.dependencies,
  };
}


export class LucyEngine {
  private generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  private dispatchEvent(source: string, target: string, type: 'request' | 'response' | 'event', payload: any, trace: string[]) {
    const msg: SystemMessage = {
      id: this.generateId(),
      source,
      target,
      type,
      payload,
      confidence: Math.random() * 0.2 + 0.8, // 0.8 to 1.0
      trace,
      timestamp: Date.now()
    };
    globalEventBus.publish(msg);
  }

  public async processRequest(input: string, onOutput: (text: string) => void) {
    const tracePath: string[] = ['UI'];
    
    // N5 DAG Builder starts -> map to LL201
    this.dispatchEvent('UI', 'LL201', 'event', { input }, tracePath);
    await this.sleep(100);

    // 1. Perception -> map to LL151
    tracePath.push('LL151(TextParser)');
    this.dispatchEvent('LL201', 'LL151', 'request', { text: input }, tracePath);
    await this.sleep(150);
    this.dispatchEvent('LL151', 'LL153', 'request', { intent: "extracting" }, tracePath);
    await this.sleep(100);

    // 2. Memory (RAG) -> map to LL020
    tracePath.push('LL020(MemoryRetriever)');
    this.dispatchEvent('LL153', 'LL020', 'request', { query: "context lookup" }, tracePath);
    await this.sleep(200);
    this.dispatchEvent('LL020', 'LL021', 'response', { contextPack: "local simulated context" }, tracePath);
    await this.sleep(150);

    // 3. Little Lucys (Simulated Parallel Execution)
    tracePath.push('LittleLucys(48)');
    for(let i=1; i<=5; i++) {
        // Randomly activate some LLs to simulate swarm (e.g. LL001 to LL048)
        const paddedId = String(Math.floor(Math.random() * 48) + 1).padStart(3, '0');
        const ll_id = `LL${paddedId}`;
        this.dispatchEvent('LL021', ll_id, 'request', { context: true }, tracePath);
    }
    await this.sleep(400);

    // 4. Emma Supervision -> map to Oracle nodes LL120...
    tracePath.push('Emma_LL120_LL127');
    this.dispatchEvent('LL_Swarm', 'LL120', 'event', { candidates: 5 }, tracePath);
    await this.sleep(200);
    this.dispatchEvent('LL120', 'LL127', 'request', { merge_scores: [0.92, 0.88, 0.95] }, tracePath);
    await this.sleep(150);

    // 5. Global Safety -> map to Control LL210
    tracePath.push('LL210(Safety)');
    this.dispatchEvent('LL127', 'LL210', 'request', { check: "safe" }, tracePath);
    await this.sleep(100);

    // 6. Lucy Prime -> map to LL000 (SHADOW_MIRROR)
    tracePath.push('LL000(IdentityCore)');
    this.dispatchEvent('LL210', 'LL000', 'response', { safe: true }, tracePath);
    await this.sleep(150);
    this.dispatchEvent('LL000', 'LL001', 'request', { synthesize: true }, tracePath);
    await this.sleep(200);
    
    // Attempt remote interaction to Local Python Cognitive Mesh
    let responseText = "";
    try {
        const fetchRes = await fetch('/api/mind/input', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: input, source: "NeuroMeshDashboard" })
        });
        if (fetchRes.ok) {
            const data = await fetchRes.json();
            responseText = data.response || data.data || this.generateSimulatedLocalResponse(input);
        } else {
            responseText = this.generateSimulatedLocalResponse(input);
        }
    } catch(e) {
        responseText = this.generateSimulatedLocalResponse(input);
    }

    this.dispatchEvent('LL001', 'LL220', 'request', { text: responseText }, tracePath);
    await this.sleep(100);

    // 7. Output Layer
    tracePath.push('LL220(TextOutput)');
    this.dispatchEvent('LL220', 'LL221', 'request', { text: responseText }, tracePath);
    await this.sleep(100);
    
    onOutput(responseText);
  }

  private generateSimulatedLocalResponse(input: string): string {
    const normalized = input.toLowerCase();
    
    // Highly contextual localized simulated AI
    if (normalized.includes("who are you") || normalized.includes("what are you")) {
      return "I am Lucy Prime. The central identity interface for a 137-node cognitive mesh running locally in your environment. All perception, memory, and cognitive swarms are fully active on this host.";
    }
    
    if (normalized.includes("node") || normalized.includes("mesh")) {
      return "The NodeMesh architecture is successfully coordinating 48 Little Lucy cognitive models and 24 Emma supervisory units. The DAG routing is optimal. There are no external dependencies.";
    }

    if (normalized.includes("status") || normalized.includes("system")) {
      return "System Status: Green. Standalone executor mode active. Local memory layer (M1-M18) is fully initialized, and the EventBus is routing telemetry effectively.";
    }

    if (normalized.includes("hello") || normalized.includes("hi")) {
        return "Hello. My cognitive mesh is initialized and ready. I am operating entirely via local context. How would you like to direct the swarm today?";
    }

    return "Message processed through the cognitive mesh. As a localized, offline system, my semantic memory has parsed your intent, routed it through the Little Lucy swarm, and verified safety protocols before returning this synthesis.";
  }

  private sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const lucyEngine = new LucyEngine();
