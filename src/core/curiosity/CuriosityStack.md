# WHAT THIS DOES:
Defines the architectural overview of the Curiosity Stack v2.

# WHY THIS EXISTS:
Provides architectural context, routing rules, and structural logic for LL352, LL353, and LL354.

# HOW THIS WORKS:
Shows the interaction diagram and routing rules between EC, IC, and the CG. 

# HOW TO CHANGE IT:
Update the diagram when the neuro-mesh integration logic changes.

# DEBUG EXAMPLE:
If a curiosity signal isn't reaching LL201-LL250, verify against this diagram to trace whether CG has correctly forwarded the payload into the integrating mesh.

---

```text
Architecture
┌─────────────────────────────────────────────────────────────┐
│                 Curiosity Governor (CG) - LL354             │
│   (Priority arbitration, safety boundaries, load control)   │
└────────────────┬────────────────────────────────────────────┘
                 │
      ┌──────────┴──────────┐
      ↓                     ↓
┌──────────────────┐  ┌──────────────────┐
│   Exploratory    │  │  Investigative   │
│  Curiosity (EC)  │  │  Curiosity (IC)  │
│      LL352       │  │      LL353       │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    ↓
        ┌─────────────────────────┐
        │  Neuro-Mesh Integration │
        │    (Signal routing)     │
        └────────────┬────────────┘
                     ↓
        ┌─────────────────────────┐
        │   LL201-LL250 Control   │
        │ (Lucy execution layer)  │
        └─────────────────────────┘
```
