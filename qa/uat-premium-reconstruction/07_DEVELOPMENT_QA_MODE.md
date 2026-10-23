# Development-only QA mode

Local Vite builds accept `?qaMode=1` with an optional `qaScenario`. The mode is guarded by `import.meta.env.DEV`; production builds cannot enable it through the query string.

QA data uses a prefixed `sessionStorage` adapter (`jade-garden-tiles-qa:*`) instead of the production local-save namespace. The default booster scenario supplies 99 Hint, Shuffle and Undo uses plus mock currency. The `treasure` scenario supplies an isolated ready-to-claim five-level milestone.

The browser isolation test proved:

- QA inventory was available;
- a QA save existed only in session storage;
- the production save key remained absent;
- an unrelated production sentinel remained unchanged.

QA scenarios do not award production rewards, overwrite genuine progress or bypass production purchase rules.
