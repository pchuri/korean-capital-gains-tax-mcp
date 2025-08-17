# Repository Guidelines

## Project Structure & Module Organization
- `src/`: TypeScript sources.
  - `calculators/`: Core tax logic (e.g., `base-calculator.ts`).
  - `tools/`: MCP tools (`calculate-tax.ts`, `validate-property.ts`).
  - `types/`: Domain types (`property.ts`, `tax.ts`, `index.ts`).
  - `utils/`: Helpers (`tax-rates.ts`, `validators.ts`, `constants.ts`).
- `docs/`: Reference materials (e.g., `CAPITAL_GAINS_TAX_GUIDE.md`).
- `tests/`: Jest tests (create as needed). Root and `__tests__` patterns are supported.

## Build, Test, and Development Commands
- `npm run build`: Compile TypeScript to `dist/` via `tsc`.
- `npm run dev`: Run local server with `tsx src/server.ts` (requires `src/server.ts`).
- `npm start`: Run compiled server `dist/server.js`.
- `npm test`: Run Jest. `npm run test:watch` and `test:coverage` are available.
- `npm run lint` / `lint:fix`: Lint code with ESLint (TypeScript rules + Prettier).
- `npm run format`: Format `src/**/*.ts` with Prettier.
- `npm run typecheck`: Strict type checks without emitting.

## Coding Style & Naming Conventions
- TypeScript strict mode; avoid `any`. 2-space indentation.
- Filenames: kebab-case (`calculate-tax.ts`). Types/Interfaces: PascalCase. Functions/vars: camelCase.
- Keep modules small and domain-focused. No accidental console logs (`no-console` warns).
- Lint/format before pushing: `npm run lint && npm run format`.

## Testing Guidelines
- Framework: Jest with `ts-jest` (`jest.config.js`).
- Location: `tests/**` or `**/__tests__/**`.
- Names: `*.spec.ts` or `*.test.ts`.
- Coverage: Use `npm run test:coverage`. Critical logic in `calculators/` and `utils/` should be covered.

## Commit & Pull Request Guidelines
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`, `build:`, `ci:`.
  - Example: `docs(tax): add capital gains guide`.
- PRs: clear description, linked issues (`Closes #123`), summary of changes, and any notes on tax-rule impacts.
- Before opening PR: `npm run typecheck && npm run lint && npm test`.

## Security & Configuration Tips
- Node.js >= 18. Keep dependencies updated.
- Do not commit secrets. Place configurable tax constants in `src/utils/constants.ts` and document changes in `docs/`.
