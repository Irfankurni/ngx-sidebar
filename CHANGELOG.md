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

## [18.0.2] - 2026-06-21

This release brings a massive modernization of the `@kuradev/ng-sidebar` internals, adopting the latest Angular reactivity APIs and significantly improving performance and developer experience.

### ⚠️ Breaking Changes
* **Angular Version Bump**: The minimum required Angular version is now **v17.2.0** (up from v16.0.0) to support the new Signals and Model APIs.

### ✨ Features & Enhancements
* **Migrated to Angular Signals**: 
  * All `@Input()` decorators have been refactored to use the modern `input()` Signal API.
  * The `opened` state is now managed using the new two-way `model()` API, providing seamless and highly reactive two-way binding.
  * All `@Output()` decorators have been migrated to the modern `output()` API, replacing `EventEmitter`.
* **Built-in Control Flow**: Migrated legacy structural directives (like `*ngIf`) to Angular's new, highly performant `@if` blocks.
* **CSS Custom Properties (Theming)**: Introduced CSS variables to make styling the sidebar much easier without relying on `::ng-deep`. You can now easily customize your sidebar using:
  * `--ng-sidebar-backdrop-bg` (default: `#000`)
  * `--ng-sidebar-backdrop-opacity` (default: `0.75`)
  * `--ng-sidebar-transition-duration` (default: `0.3s`)

### 🛠️ Refactoring & SSR Safety
* **Improved SSR Compatibility**: Completely removed `PLATFORM_ID` injections and messy `isPlatformBrowser` checks throughout the codebase. The library now gracefully leverages Angular's `afterNextRender()` lifecycle hook to ensure all DOM manipulation runs cleanly and safely in browser environments only.
* Removed legacy `setTimeout()` hacks in favor of clean, reactive Signal `effect()` implementations.
