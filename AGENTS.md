# AGENTS.md

Project-specific rules for agents working in this repository.

## Prompt Invocation Mechanism

`index.html` and `prompt-lab.html` must always stay aligned on prompt invocation behavior. The production UI and the prompt testing lab are two entry points for the same prompt experiment.

- Current standard: year 1 calls `/api/game/start`; after each choice, generate only the next single year through `/api/game/next`.
- Every `/api/game/next` request must include the complete chosen `history` so far.
- If request cadence, payload shape, model selection, fallback behavior, or result-generation logic changes in one entry point, update and verify the other in the same change.
- Do not reintroduce batch prefetch, warmup decks, bridge cards, or local fixed cards into the `index.html` main flow unless `prompt-lab.html` can reproduce the same mechanism for testing.

See `CLAUDE.md` for broader project architecture notes.
