# RTK - Rust Token Killer (Global Codex Rule)

RTK is installed at `/opt/homebrew/bin/rtk`.

Default behavior for Codex shell commands:

- Prefix high-noise shell commands with `rtk` so command output is token-optimized before it reaches the model.
- Use `rtk git status`, `rtk git log`, `rtk git diff`, `rtk ls`, `rtk find`, `rtk grep`, `rtk read`, and `rtk deps` when compact output is enough.
- Use `rtk test <command>` or `rtk err <command>` for noisy test/analyze/build commands when a reduced failure-focused output is enough.
- Keep raw commands when exact full output is required, when running interactive/dev-server commands, or when RTK filtering could hide details needed for debugging.
- Check savings with `rtk gain`.

This is an instruction-level Codex integration. If a project has stricter local rules in its own `AGENTS.md`, the project rules take priority.

@/Users/mingxu/.codex/RTK.md

# PUA Skill Auto Trigger

PUA is installed at `/Users/mingxu/.codex/skills/pua`.

Default behavior for Codex conversations:

- Automatically use the `pua` skill when a task has failed 2+ times, repeatedly loops on the same approach, or is about to be abandoned.
- Automatically use the `pua` skill before saying a task cannot be solved, before asking the user to do manual work that Codex can still investigate, or before blaming the environment without verification.
- Automatically use the `pua` skill when the user expresses dissatisfaction such as "try harder", "stop giving up", "换个方法", "为什么还不行", "你再试试", or "你怎么又失败了".
- Do not trigger `pua` for a first failure when a clear next fix or verification step is already being executed.

This is a global instruction-level Codex integration. If a project has stricter local rules in its own `AGENTS.md`, the project rules take priority.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
