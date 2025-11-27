When you are delivered a PRD, do not stop working for any reason until the PRD is fully completed and tested. Do not stop between tasks or microtasks, continue until the full task is complete. Use context documents in the /DOCS folder to understand the codebase as you work. 

# Subagent Reference

## When to Deploy Each Agent

## Research

### external-context-researcher
Use when integrating external APIs, services, libraries, or adopting new frameworks. Gathers official documentation and creates implementation guides.

### codebase-explorer
Use for non-trivial tasks (complexity >3/10) requiring understanding of existing code, patterns, or git history before proceeding.

## Documentation

### docs-weaver
Use after implementing features, modifying APIs, or merging significant changes. Generates documentation with verified code examples from tests.

### project-historian
Use after major changes (>500 lines, architectural refactors, migrations, or milestones). Creates checkpoint narratives with semantic tags.

## UI

### browser-navigator
Use for automated end-to-end UI testing of local web applications. Tests interactivity, validates layouts, and repairs runtime bugs.

### ux-copy-brainstormer
Use when creating or refining user-facing copy. Requires brand voice guidelines. Reviews interface text for clarity and consistency.