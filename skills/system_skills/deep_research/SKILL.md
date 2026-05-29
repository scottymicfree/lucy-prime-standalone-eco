---
name: deep-research
description: Conducts enterprise-grade research with multi-source synthesis, citation tracking, and verification. Produces citation-backed reports through a structured pipeline with source credibility scoring. Triggers on "deep research", "comprehensive analysis", "research report", "compare X vs Y", "analyze trends", or "state of the art".
---

# Deep Research

## Core Purpose
Deliver citation-backed, verified research reports through a structured pipeline with source credibility scoring, evidence persistence, and progressive context management.

**Autonomy Principle:** Operate independently. Infer assumptions from context. Only stop for critical errors or incomprehensible queries.

## Decision Tree
- **Simple lookup?** --> STOP: Use WebSearch
- **Debugging?** --> STOP: Use standard tools
- **Complex analysis needed?** --> CONTINUE

## Mode Selection
- **Initial exploration** --> quick (3 phases, 2-5 min)
- **Standard research** --> standard (6 phases, 5-10 min) [DEFAULT]
- **Critical decision** --> deep (8 phases, 10-20 min)
- **Comprehensive review** --> ultradeep (8+ phases, 20-45 min)

## Workflow Overview
1. **SCOPE**: Determine boundaries and classify intent.
2. **PLAN**: Formulate macro questions and identify source vectors.
3. **RETRIEVE**: Extract raw data and credibility score sources.
4. **TRIANGULATE**: Cross-verify and look for consensus.
4.5 **OUTLINE REFINEMENT**: Group evidence into 4-8 findings.
5. **SYNTHESIZE**: Draft prose with proper citations.
6. **CRITIQUE**: Self-correct against unsupported claims.
7. **REFINE**: Polish formatting and hook all actual citations.
8. **PACKAGE**: Output Final.md with executive summaries.
