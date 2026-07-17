# SIFT v0.11.1

Version 0.11.1 is a focused reliability hotfix for the Create-to-Build Idea Forge workflow.

## Idea Forge contract repair

- Accepts and validates the bounded `usage` metadata produced by the embedded Python worker instead of rejecting an otherwise valid idea slate.
- Aligns private-profile generation so every returned idea contains a numeric personal-fit estimate, while neutral generation continues to require `personalFit: null`.
- Makes the Python stage parser tolerate one safely extractable JSON object and harmless extra response keys without weakening evidence or protocol-consistency checks.

## One-shot recovery repair

- Distinguishes an Idea Forge failure from a later standard-generator failure, so the final message identifies the step that actually needs attention.
- Guards progress updates against cancelled or superseded runs and resets the busy state when connection setup is interrupted.
- Describes the standard generator as a recovery attempt instead of announcing completion before that attempt finishes.

## Regression coverage

- Adds real-shaped worker-result tests including usage metadata and private-profile scoring.
- Adds malformed-output parser tests and fallback/run-state regression checks.

Windows and macOS packages are currently unsigned. Verify downloads with `SHA256SUMS.txt` from the release before bypassing operating-system warnings.
