# Idea Foundry v0.4.0

Version 0.4.0 makes the desktop app faster to understand and much easier to connect to OpenRouter while preserving the locked deterministic scoring engine.

## What changed

- Added live OpenRouter model typeahead. Enter a name, version, or partial canonical ID—such as `4.8` or `opus.4.8`—and Idea Foundry queries OpenRouter automatically, ranks the response, and shows the best matches in a keyboard-accessible dropdown.
- Added punctuation-tolerant model matching, so dots, hyphens, underscores, and slashes behave naturally without hard-coded model names.
- Simplified the primary workflow to **Home → Ideas → Evaluate → Evidence → Decision**.
- Moved personalization, AI connection, and import/export tools into a compact **Settings & data** drawer.
- Reworked the start screen, idea-generation controls, candidate cards, profile editor, and model setup around progressive disclosure and plain-language actions.
- Combined model saving and connection testing into one **Save & connect** action.
- Added the new Idea Foundry logo, application icon, and transparent mark to the web interface and native Windows/macOS build resources.
- Preserved manual model-ID entry and full-catalog browsing as advanced fallbacks.

## Integrity and security

- The scoring rubric, 51 claims, evidence rules, caps, floors, and gates are unchanged.
- AI output remains an editable hypothesis and cannot write evidence, grades, gates, or decisions.
- OpenRouter remains pinned to `https://openrouter.ai/api/v1`; typeahead text is URL-encoded and API keys remain header-only.
- Credentials remain protected by the operating system and are excluded from projects, exports, and browser storage.

## Downloads

- Windows 64-bit installer and portable executable
- macOS 12+ DMG and ZIP for Apple silicon (`arm64`)
- macOS 12+ DMG and ZIP for Intel (`x64`)
- `SHA256SUMS.txt` for release verification

The Windows and macOS packages are currently unsigned. Verify the checksum before opening them. Windows may show an **Unknown publisher** warning, and macOS may require right-clicking the app and choosing **Open**.
