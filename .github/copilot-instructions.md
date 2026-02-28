### DuetWebControl — Copilot instructions for code completion agents

Keep guidance concise and actionable. Below are the minimal, repository-specific facts and examples an AI coding agent needs to be immediately productive.

Quick start (developer commands)
- Install deps: `npm install`
- Dev server / HMR: `npm run serve` (alias: `npm run dev`)
- Production build: `npm run build`
- Plugin packaging helpers: `npm run build-plugin` and `npm run build-plugin-pkg`

High-level architecture (why it is organized this way)
- Frontend: Vue 2.7 + TypeScript + Vuetify (single-page app). Entry: `src/main.ts`.
- State: Vuex `src/store/index.ts`. Multi-machine support implemented as dynamic submodules under `machines` — each machine has its own Vuex module.
- Routing & menu: `src/routes/index.ts` centralizes route registration. Routes and menu entries are created via helper functions (registerCategory, registerRoute).
- Plugin system: built-in DWC plugins live in `src/plugins/*`; runtime plugin manifest/loader is `src/plugins/index.ts`. There are two plugin types: DWC (built-in) and external (webpack-split bundles). Note: external plugin loading is disabled in dev mode.
- Connectors & object model: communication with RepRapFirmware is handled through `@duet3d/connectors` and `@duet3d/objectmodel` — connection logic and callbacks are wired in `src/store/index.ts` (store actions like `connect`).

Important files to reference (examples)
- `src/main.ts` — app bootstrap, global Vue/Vuetify config, compatibility shim for objectmodel array updates.
- `src/App.vue` — main layout and UI wiring (menu, router-view, top bar, plugin injection points).
- `src/store/index.ts` — central store: connect/disconnect flows, dynamic machine modules, plugin registration helpers (registerPluginData, setPluginData).
- `src/plugins/index.ts` — plugin manifest checks, `loadDwcResources()` and helper APIs `registerPluginContextMenuItem` and `injectComponent` used by plugins.
- `src/plugins/DwcPlugin.ts` — base class for built-in plugins. Use it when authoring built-ins.
- `src/routes/index.ts` — functions to register routes, menu categories and settings tabs. Use `registerRoute` / `registerCategory` when adding pages.
- `i18n/*.json` — translations. Routes and captions use translation keys (see `Menu.caption` usage in `src/routes/index.ts`).

Project-specific patterns & conventions
- Absolute imports with the `@` alias are used throughout (`@/store`, `@/plugins`). Follow existing import style.
- Plugins: built-in plugins are instances/subclasses of `DwcPlugin` and declare a manifest. `checkManifest()` enforces ID/name length/character rules in `src/plugins/index.ts`.
- Dev-mode limitations: external webpack-split plugin loading throws in dev mode (`loadDwcResources` checks `process.env.mode`/`process.env.NODE_ENV`). To test third-party plugins, use the build/publish flow or run production-mode build.
- Dynamic registration: many extension points register via global registries rather than static imports — examples: `registerRoute`, `registerSettingTab`, `registerPluginContextMenuItem`, `injectComponent`. Prefer using these helpers for pluggable features.
- Vuex multi-machine: a machine is a Vuex module returned by `machine(connectorInstance)` and registered under `machines[hostname]`. When selecting a machine, the active `machine` module is un/registered (`setSelectedMachine` mutation).

Debugging & developer workflow notes
- Console & notifications: plugin/load errors and connection logs go to the Console and `makeNotification` calls. Check the browser console and the app Console tab.
- To allow cross-origin AJAX for development with RRF, the README mentions adding `M586 C\"*\"` to `config.g` (security implications). Only do this in safe/dev environments.
- The store runs in strict mode unless `NODE_ENV === 'production'`. Use this when debugging Vuex mutation issues.

How to add a page or plugin (short example)
1. Add a Vue component under `src/routes/<Category>/MyPage.vue`.
2. Register it via `registerRoute(MyComponent, { MyCategory: { MyPage: { path: '/My/Page', caption: 'menu.custom.myPage', icon: 'mdi-star' } } })` (see `src/routes/index.ts`).
3. If the page should be provided by a plugin, expose a plugin manifest in `src/plugins/<my-plugin>/manifest.json` and implement `loadDwcResources` for built-in plugins or use the bundle packaging scripts for external plugins.

What not to change without careful consideration
- Do not alter the shape of the Vuex modules/state without updating all callers — the codebase depends on stable module paths like `machine`, `machines/<host>`, and `settings`.
- Avoid changing plugin manifest validation rules in `src/plugins/index.ts` without ensuring backward compatibility.

Missing / not discovered
- I did not find a test suite or test runner config in the repository root. If you rely on tests, list where they live or how to run them.

If something here is unclear or you'd like more specifics (for example, a step-by-step on creating a DWC plugin bundle or the exact Vuex module shape for a new machine feature), tell me which area to expand and I will iterate.

References (start here):
- `README.md` (root) — build commands and dev hints
- `package.json` — npm scripts and dependency list
- `src/main.ts`, `src/App.vue`, `src/store/index.ts`, `src/plugins/index.ts`, `src/routes/index.ts`, `src/plugins/DwcPlugin.ts`
