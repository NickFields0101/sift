# SIFT v0.3.0 (legacy package)

This historical release added macOS support and made large model catalogs much easier to navigate.

## What changed

- Search models by friendly name, version, provider, or exact ID. Typing `4.8`, for example, surfaces matching entries such as Anthropic Claude Opus 4.8 when the connected provider exposes them.
- Choose a result with the mouse or keyboard while retaining manual model-ID entry as a fallback.
- Discover up to 2,000 unique models instead of truncating the catalog at 500.
- Download native macOS packages for Apple silicon (`arm64`) and Intel (`x64`). Both architectures are built, inspected, and launch-smoke-tested on matching GitHub-hosted Mac hardware.
- Continue using the Windows x64 installer or portable executable.

## Downloads

| Computer | Recommended file | Alternative |
| --- | --- | --- |
| Apple silicon Mac (M1 or newer) | `Idea-Foundry-0.3.0-macOS-arm64.dmg` | `Idea-Foundry-0.3.0-macOS-arm64.zip` |
| Intel Mac | `Idea-Foundry-0.3.0-macOS-x64.dmg` | `Idea-Foundry-0.3.0-macOS-x64.zip` |
| Windows x64 | `Idea-Foundry-Setup-0.3.0-x64.exe` | `Idea-Foundry-Portable-0.3.0-x64.exe` |

macOS 12 Monterey or newer is required. Open a DMG and drag the app into Applications. ZIP files are provided for manual deployment.

## Signing notice

These first macOS packages are not yet signed or notarized. After verifying the download against `SHA256SUMS.txt`, macOS may require you to right-click the app, choose **Open**, and confirm, or approve it under **System Settings → Privacy & Security**. Do not disable Gatekeeper globally.

The Windows packages also remain unsigned and may show a Microsoft SmartScreen warning.

## Privacy and model connections

- SIFT itself requires no account.
- OpenRouter requires the user's own account, API key, and credits.
- API keys remain encrypted by the operating system, bound to their selected provider, and excluded from project files, exports, and browser storage.
- OpenRouter stays pinned to `https://openrouter.ai/api/v1`.
- When OpenRouter is selected, the displayed prompt is sent to OpenRouter and the selected upstream model provider.
