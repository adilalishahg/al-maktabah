# Rules: Core Architectural Laws & Code Standards

**Enforcement Level:** Strict  
**Scope:** Universal across all layers (Frontend, Backend, Types, Stores, Scripts)  

---

## 1. Strict Separation of Concerns (SoC) Architectural Quadrants
Every module and source file in the project must strictly map to one of the four architectural quadrants. Mixing responsibilities across quadrants is an explicit architectural violation.

1. **UI Layer (Views & Presentational Components):**
   - Strictly presentational. Render markup, apply semantic tokens, and bind user interactions.
   - **Zero Business Logic:** No inline data manipulation, algorithms, or complex filtering.
   - **Zero Inline Queries / Data Fetching:** No direct `fetch()`, `axios`, or raw database operations inside UI components. Data is supplied via props or consumed from dedicated custom hooks.
2. **Types & Interfaces Layer (`src/types/` or `*.types.ts`):**
   - All TypeScript interfaces, type aliases, union types, and domain schemas must reside in dedicated type declaration files (`src/types/` or adjacent `[Feature].types.ts`).
   - **Zero Inline Interface Dumps:** Components and utilities must never declare multi-line interface dumps inline.
3. **Logic & Functionality Layer (Custom Hooks `src/hooks/use*.ts`):**
   - Encapsulate all side effects, state machines, event handlers, lifecycle hooks, and asynchronous operations.
   - UI views consume hooks via clean, reactive interfaces (e.g., `const { currentChapter, handleJumpPage } = useBookReader(book)`).
4. **Utilities & Infrastructure Layer (`src/utils/` or `src/lib/`):**
   - Pure, deterministic functions, string formatters, mathematical algorithms, security validation, and API client helpers.
   - Free of React dependencies and side effects wherever possible.

---

## 2. Strict File & Function Length Limits
1. **File Length Ceiling (Strict 200–500 Lines):**
   - Every file (components, custom hooks, utilities, and API route handlers) must remain compact and modular.
   - **Hard Maximum:** 500 lines. Any file exceeding 500 lines is an immediate architectural violation that must be broken down into atomic sub-components, sub-hooks, or modular helpers.
   - **Target Modular Size:** 150–350 lines per file.
2. **Atomic Decomposition:**
   - When a component or view grows beyond 350 lines, proactively factor out distinct UI sections (e.g., toolbar, sidebar, drawer, modal, card) into atomic sub-components.
3. **Function Length:**
   - Functions should follow the Single Responsibility Principle (SRP) and ideally remain under 40–50 lines. Decompose multi-step procedures into composable helper functions.

---

## 3. Clean Architecture & DRY (Don't Repeat Yourself)
1. **Single Source of Truth:** Never duplicate domain interfaces or configuration shapes. All library types reside in `src/types/`, all persistent store keys in `src/data/`, and all Mongoose models in `src/models/`.
2. **Clean Component Hierarchy:**
   - **Atoms / Primitives:** Badges, buttons, font-resizers, theme toggles, and icon wrappers (`src/components/`).
   - **Molecules / Sub-components:** Chapter cards, narrator nodes, search inputs, pagination strips.
   - **Organisms:** Toolbar, Table of Contents drawer, dual-pane canvas reader (`src/components/`).
   - **Templates / Pages:** Route viewports (`src/views/` and `src/app/`).

---

## 4. Strict TypeScript Typings
1. **No `any` Policy:** Explicitly disallow arbitrary `any` annotations. All book records, chapters, isnad nodes, and settings must be strictly typed using interfaces defined in `src/types/`.
2. **Null Safety & Optionality:** Use optional chaining (`?.`) and nullish coalescing (`??`) defensively. Array access on chapters or isnad chains must verify existence before accessing index 0.
3. **Immutability in State Updates:** Always produce new object references when updating React state or persistent stores (e.g., spread operators `[...items]`, structuredClone, or object spreads `{ ...prev, ...updates }`). Never mutate existing state arrays directly.

---

## 5. Documentation & Code Integrity
1. **Preserve Documentation Integrity:** Preserve existing docstrings, Arabic transliterations, and explanatory comments when refactoring.
2. **Self-Documenting Code:** Write expressive variable and function names (e.g., `buildReadingSectionFromBook`, `handleSetBookAsHomeReader`).
