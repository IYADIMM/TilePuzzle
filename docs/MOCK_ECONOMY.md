# Mock economy boundary

The economy is an offline design and QA preview only.

- Wallet mutations use idempotent transaction IDs and reject negative balances.
- Catalog purchases are direct and deterministic; there are no randomized paid rewards.
- Daily rewards use a UTC day key and can be claimed once per day.
- A level can roll back its exact pre-loss snapshot once. Gems are charged only after restoration succeeds.
- The rewarded-ad path accepts proof only from `MockAdProvider`; no ad SDK or network is contacted.
- `MockPurchaseProvider` rejects real-money operations. Premium entitlement is preview-only.

This model is not secure against local save editing and is not monetization-ready. A production implementation requires authenticated server-authoritative wallets and receipts, platform billing, age/region policy review, restore-purchases behavior, fraud controls, analytics consent, refund/revocation handling, and separate staging credentials. None of those capabilities should be inferred from the mock UI.
