# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.0.1]

### Changed

- rebuilt `preinstalled-snap.json` to match release 4.0.0 ([#42](https://github.com/MetaMask/snap-watch-only/pull/42))

## [4.0.0]

### Changed

- **BREAKING:** upgraded `@metamask/snaps-sdk` to v6 and changed UI component rendering ([#39](https://github.com/MetaMask/snap-watch-only/pull/39))
- **BREAKING:** downgraded ethers package from 6.10 to 5.7.2 ([#37](https://github.com/MetaMask/snap-watch-only/pull/37))

## [3.2.0]

### Added

- Added account name suggestion to `"notify:accountCreated"` event ([#35](https://github.com/MetaMask/snap-watch-only/pull/35))

## [3.1.1]

### Added

- Added preinstalled-snap.json file to the repo ([#33](https://github.com/MetaMask/snap-watch-only/pull/33))

## [3.1.0]

### Changed

- Removed success screen ([#31](https://github.com/MetaMask/snap-watch-only/pull/31))
- Added script to build-preinstalled-snap json to dist ([#30](https://github.com/MetaMask/snap-watch-only/pull/30))
- ENS resolution only supported on mainnet ([#29](https://github.com/MetaMask/snap-watch-only/pull/29))

## [3.0.0]

### Changed

- **BREAKING:** Changed package name from "@metamask/snap-watch-only" to "@metamask/account-watcher"
- Updated form design and copy

## [2.0.0]

### Changed

- **BREAKING:** Converted from monorepo and changed package name from "@metamask/snap-watch-only-snap" to "@metamask/snap-watch-only"

## [1.0.0]

### Added

- Initial release.

[Unreleased]: https://github.com/metamask/snap-watch-only/compare/v4.0.1...HEAD
[4.0.1]: https://github.com/metamask/snap-watch-only/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/metamask/snap-watch-only/compare/v3.2.0...v4.0.0
[3.2.0]: https://github.com/metamask/snap-watch-only/compare/v3.1.1...v3.2.0
[3.1.1]: https://github.com/metamask/snap-watch-only/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/metamask/snap-watch-only/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/metamask/snap-watch-only/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/metamask/snap-watch-only/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/metamask/snap-watch-only/releases/tag/v1.0.0
