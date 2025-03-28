# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [4.1.3]

### Changed

- Bump `ethers` from `^5.7.2` to `^5.8.0` ([#55](https://github.com/MetaMask/snap-watch-only/pull/55))
- Bump `snaps-*` packages ([#55](https://github.com/MetaMask/snap-watch-only/pull/55))

### Fixed

- Use explicit `displayConfirmation: false` ([#58](https://github.com/MetaMask/snap-watch-only/pull/58))
  - This flag was defaulting to `false` already on the Snap bridge side, but this was a mistake, so it has to be explicitly set to `false` now.
- Fix preinstalled Snap builds ([#57](https://github.com/MetaMask/snap-watch-only/pull/57))
  - The `preinstalled-snap.json` was not properly re-built, thus we were using an outdated version.
- Now returns `null` if `handleKeyringRequest` returns `undefined`/`void` ([#56](https://github.com/MetaMask/snap-watch-only/pull/56))
  - This is required to comply with JSON serializable values, since `undefined` is not valid in JSON.

## [4.1.2]

### Changed

- Move deps from `dependencies` to `devDependencies` ([#53](https://github.com/MetaMask/snap-watch-only/pull/53))

## [4.1.1]

### Changed

- Bump `@metamask/keyring-api` from `^4.0.1` to `^8.1.3` ([#51](https://github.com/MetaMask/snap-watch-only/pull/51))
  - This version is now built slightly differently and is part of the [accounts monorepo](https://github.com/MetaMask/accounts).

## [4.1.0]

### Added

- Added `hidden: true` flag to build-preinstalled-snap script ([#48](https://github.com/MetaMask/snap-watch-only/pull/48))

## [4.0.3]

### Changed

- Changed form button copy to "Watch account" ([#46](https://github.com/MetaMask/snap-watch-only/pull/46))

## [4.0.2]

### Changed

- Fixed eslint errors for `SnapComponent` typing ([#44](https://github.com/MetaMask/snap-watch-only/pull/44))

## [4.0.1]

### Changed

- Rebuilt `preinstalled-snap.json` to match release 4.0.0 ([#42](https://github.com/MetaMask/snap-watch-only/pull/42))

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

[Unreleased]: https://github.com/metamask/snap-watch-only/compare/v4.1.3...HEAD
[4.1.3]: https://github.com/metamask/snap-watch-only/compare/v4.1.2...v4.1.3
[4.1.2]: https://github.com/metamask/snap-watch-only/compare/v4.1.1...v4.1.2
[4.1.1]: https://github.com/metamask/snap-watch-only/compare/v4.1.0...v4.1.1
[4.1.0]: https://github.com/metamask/snap-watch-only/compare/v4.0.3...v4.1.0
[4.0.3]: https://github.com/metamask/snap-watch-only/compare/v4.0.2...v4.0.3
[4.0.2]: https://github.com/metamask/snap-watch-only/compare/v4.0.1...v4.0.2
[4.0.1]: https://github.com/metamask/snap-watch-only/compare/v4.0.0...v4.0.1
[4.0.0]: https://github.com/metamask/snap-watch-only/compare/v3.2.0...v4.0.0
[3.2.0]: https://github.com/metamask/snap-watch-only/compare/v3.1.1...v3.2.0
[3.1.1]: https://github.com/metamask/snap-watch-only/compare/v3.1.0...v3.1.1
[3.1.0]: https://github.com/metamask/snap-watch-only/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/metamask/snap-watch-only/compare/v2.0.0...v3.0.0
[2.0.0]: https://github.com/metamask/snap-watch-only/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/metamask/snap-watch-only/releases/tag/v1.0.0
