# WHAT THIS DOES:
Documents the integration of Lucy's Curiosity Stack v2 (Exploratory, Investigative, and Governor) into the main Lucy working sets (LL201-LL250).

# WHY THIS EXISTS:
Provides a clear map of how curiosity signals are routed to the intelligence controllers. Without this, curiosity signals would be disconnected from the actual cognitive layers.

# HOW THIS WORKS:
Defines the `receives`, `processes`, and `sends` contracts for key nodes like LL201, LL202, LL203, LL204, LL205, LL210, and LL220.

# HOW TO CHANGE IT:
Modify integration blocks when bringing completely new capabilities online (e.g., adding LL230 memory indexing).

# DEBUG EXAMPLE:
If Intent Weaver ignores Exploratory curiosity signals, check the `LL201_INTEGRATION` schema to ensure `ec_signals` is an accepted receive type.

---

### Integration Points With Existing Lucy Layers (LL201-LL250)

```javascript
// LL201: INTENT_WEAVER
// Receives: EC signals, IC signals
// Sends: Aligned intent, priority weights
const LL201_INTEGRATION = {
  receives: ["ec_signals", "ic_signals"],
  processes: "curiosity_direction_alignment",
  sends: ["aligned_intent", "priority_weights"],
};

// LL202: CONTEXT_FLOW
// Receives: EC context, IC context
// Sends: Context updates, state awareness
const LL202_INTEGRATION = {
  receives: ["ec_context", "ic_context"],
  processes: "curiosity_state_management",
  sends: ["context_updates", "state_awareness"],
};

// LL203: CAUSAL_ENGINE
// Receives: IC chains, EC patterns
// Sends: Causal links, reasoning paths
const LL203_INTEGRATION = {
  receives: ["ic_chains", "ec_patterns"],
  processes: "curiosity_reasoning",
  sends: ["causal_links", "reasoning_paths"],
};

// LL204: EVENT_HORIZON
// Receives: EC signals, CG boundaries
// Sends: Event flags, horizon updates
const LL204_INTEGRATION = {
  receives: ["ec_signals", "cg_boundaries"],
  processes: "curiosity_event_detection",
  sends: ["event_flags", "horizon_updates"],
};

// LL205: MEMORY_LINK
// Receives: IC cases, EC patterns
// Sends: Historical context, memory links
const LL205_INTEGRATION = {
  receives: ["ic_cases", "ec_patterns"],
  processes: "curiosity_memory_retrieval",
  sends: ["historical_context", "memory_links"],
};

// LL210: ACTION_CORE
// Receives: CG decisions
// Sends: Action results, execution feedback
const LL210_INTEGRATION = {
  receives: ["cg_decisions"],
  processes: "curiosity_action_execution",
  sends: ["action_results", "execution_feedback"],
};

// LL220: THINK_LOOP
// Receives: IC targets, CG directives
// Sends: Reasoning results, investigation updates
const LL220_INTEGRATION = {
  receives: ["ic_targets", "cg_directives"],
  processes: "curiosity_reasoning_loops",
  sends: ["reasoning_results", "investigation_updates"],
};
```
