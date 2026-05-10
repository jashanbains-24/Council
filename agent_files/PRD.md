# PRD: Council

Naming note: the public product name for this hackathon build is `Council`. Older references to `Contraria` are legacy planning language for the same concept.

## 1. Product Overview

### Working Name
Council

### Internal Concept Name
Council

### Tagline
Don't assume. Consult.

### One-Sentence Description
Council is a judgment layer for AI agents that detects significant assumption points, convenes multiple specialized advisors, surfaces disagreement, and returns structured judgment before the agent acts.

---

## 2. Core Framing

AI agents are increasingly trusted to write code, configure systems, scaffold products, plan workflows, and take multi-step actions. The most dangerous failures often do not happen when the agent obviously does not know something. They happen when the agent makes a plausible assumption silently.

Council exists for that moment.

When an AI agent is about to make a significant assumption, it should not simply guess, halt, or rely on a single reasoning pass. Instead, it should call Council. Council convenes a small panel of specialized agents who deliberate from different perspectives, challenge each other, identify hidden risks, and return a structured judgment object that the calling agent can act on.

This is not “make the model think harder.” It is a separate deliberation layer where distinct perspectives collide before action is taken.

---

## 3. The Problem

AI agents fail silently at assumption points.

Examples:

- Choosing a database without knowing the user’s constraints
- Selecting an authentication approach without asking about security requirements
- Refactoring architecture based on incomplete context
- Assuming a user wants speed over correctness
- Continuing with ambiguous instructions instead of clarifying
- Choosing a framework, API, deployment target, or data model without understanding tradeoffs

Current agent behavior usually falls into one of three bad patterns:

### 3.1 Halt and Ask the Human
This preserves safety but breaks autonomy. If agents ask for help constantly, they become less useful.

### 3.2 Guess and Proceed
This preserves momentum but breaks trust. A single wrong assumption can compound into hours of wasted work.

### 3.3 Use a Reasoning Model
This improves depth but still gives one perspective. The model may sound more confident while still failing to expose what it did not consider.

Council provides a fourth option:

### 3.4 Structured Multi-Perspective Deliberation
The agent calls a panel of specialized advisors. The panel returns:

- A clear recommendation
- Reasoning
- Dissent
- Biggest risk
- Confidence level
- What would change the recommendation
- Whether the agent should pause and ask the human
- The exact question to ask if human input is required

---

## 4. Target User

### Primary User
Builders and developers creating autonomous AI agents, coding agents, workflow agents, and AI-powered productivity tools.

### Secondary User
Hackathon judges evaluating whether this product fits the theme “Build Something Agents Want.”

### Actual Demo User
A fake AI coding agent that hits an architectural decision point while building a web application.

---

## 5. Hackathon Goal

The goal is not to build a complete production platform.

The goal is to produce a polished, understandable, convincing demo that proves the following idea:

> Agents should not silently guess at important assumptions. They should consult a structured judgment layer that exposes disagreement and uncertainty before acting.

The demo must be visually clear enough that a judge understands the product in under 30 seconds.

---

## 6. Main Demo Narrative

### 6.1 Scenario

A fake AI coding agent is building a web app for an early-stage startup.

The user has not specified a database. The agent is about to assume PostgreSQL.

This is a significant architectural decision because it affects:

- Data modeling
- Hosting
- Operational complexity
- Cost
- Migration difficulty
- Team familiarity
- Speed of development
- Future scalability

The agent pauses at this assumption point and compares two approaches:

1. A single-pass model response
2. Council's multi-agent deliberation

---

## 7. Demo Input

The default input should be pre-filled with:

```txt
I am building a web app for an early-stage startup. The user has not specified a database, auth strategy, or expected scale. I am about to assume PostgreSQL with a standard relational schema. Should I proceed with this assumption, or is there something I am missing before I make this architectural decision?