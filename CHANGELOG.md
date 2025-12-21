# Changelog

All notable changes to this project will be documented in this file.

## [18.0.1] - 2025-12-21

### Added

- Compatibility with **Angular 16, 17, and 18**.
- Support for **Standalone Components** (`Sidebar`, `SidebarContainer`, `CloseSidebar`).
- Modernized build output via `ng-packagr` (Angular Package Format).

### Changed

- **BREAKING**: Renamed `keyCode` input to `key` (type `string`) for better modern browser support. Defaults to `'Escape'`.
- Rebranded package to `@kuradev/ng-sidebar`.
- Updated peer dependencies to require Angular >= 16.0.0.

### Fixed

- **Fixed Subscription Leaks**: Refactored internal event handling in `SidebarContainer` to correctly manage subscriptions.
- **Strict Mode**: Fixed multiple TypeScript strict-mode errors and uninitialized property warnings.
- **SSR Safety**: Improved platform checks for better Server-Side Rendering support.

### Internal

- Migrated build system to `ng-packagr`.
- Updated contributor information and developer alias to `kuradev`.
