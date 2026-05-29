# continuation.md

## Handling Large Reports (>18K words)
If the report threatens to exceed context windows or maximum generation tokens:
1. **Chunking**: Write the report in separate files. e.g., `Part1_Introduction.md`, `Part2_Findings.md`.
2. **State Saving**: Pass a manifest file along with each chunk so the agent knows the current bibliography index.
3. **Synthesis Merge**: Once all chunks are written, perform a final merge script or index file that points to the respective outputs.
