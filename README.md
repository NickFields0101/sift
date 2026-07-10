# Idea Foundry — Xahau + Evernode

Idea Foundry is a local-first idea-generation and evidence-review workspace for Xahau and Evernode projects. It helps a founder move from a broad search profile to a falsifiable idea, then calculates stage readiness with a locked 51-claim rubric.

The app deliberately separates two different questions:

- **What should I explore?** A weighted, optional private profile ranks candidate ideas by personal fit, opportunity signal, protocol affordance, and experimentability.
- **What does the evidence support?** A deterministic engine calculates merit, evidence-adjusted value, confidence, coverage, caps, critical floors, and gates. Profile data cannot change these results.

## Use the app

1. Choose **Profile-neutral** or create a **Private profile**.
2. Add hypotheses manually, load the editable starter slate, or copy the generated prompt into any LLM.
3. Give each candidate 0–100 exploration estimates. These values only order the search; they are not validated scores.
4. Select one idea and lock its dominant archetype and target stage.
5. Assess all 51 atomic claims with merit from 0–5.
6. Attach evidence and assign E0–E4. The validator checks evidence-type ceilings, dates, verification, claim links, duplicates, and counterevidence.
7. Resolve the eight non-compensable gates.
8. Read the four separate outputs and every active cap, floor, validation error, and blocker.
9. Export a reproducible JSON packet or claim-level CSV.

The LLM proposes hypotheses. It never calculates the official result. The deterministic rules engine does.

## Scoring integrity

- Framework: `v3`
- Engine: `v3-powershell-parity/1.0.1`
- Canonical claims: `51`
- Archetype weights: exactly `100` for Application, Enterprise, Protocol/Infrastructure, and Marketplace/DePIN
- Rubric manifest SHA-256: `fa940feea694ee4df4aa064d2fc418e68a879f318c11e72cfbc4bf5a9d1c1d67`
- Rounding: midpoint-to-even where required by the canonical calculator

The app labels the combined result **Numeric + gate ready**. It is not a final investment, financing, launch, safety, or governance decision. Team coverage, role design, financing approval, independent review, and human judgment remain separate.

## Privacy model

- No account is required.
- Work is stored in browser `localStorage` on the current device.
- There is no analytics, wallet connection, database, or model API call in this release.
- Private profile data is excluded from exports by default.
- Computed fields in imported packets are ignored and recalculated locally.
- Do not paste secrets, wallet seeds, regulated personal data, or confidential evidence bodies into a public/shared device.

Clearing browser storage or choosing **Clear local data** removes the workspace from that browser. Export important work first.

## Local development

Requires Node.js `>=22.13.0`.

```bash
npm ci
npm run dev
```

Production verification:

```bash
npm test
npm run build
```

`npm test` builds the app and runs deterministic golden fixtures plus rendered-output checks.

## Project structure

- `app/page.tsx` — local-first product workflow and export/import UI
- `app/lib/scoring.ts` — deterministic validator and scoring engine
- `app/lib/rubric.json` — canonical 51-row rubric manifest
- `tests/scoring.test.ts` — parity, caps, evidence, privacy-invariance, and determinism fixtures
- `tests/rendered-html.test.mjs` — production-render and starter-removal checks
- `public/og.png` — generated social preview card

## Methodology source

This implementation is derived from the open-source Xahau/Evernode Idea Review Framework v3 and preserves the current PowerShell calculator behavior under an explicit parity engine version. Any intentional rules change should use a new engine version and new golden fixtures so historical reviews remain reproducible.

## License

MIT. See [LICENSE](LICENSE).
