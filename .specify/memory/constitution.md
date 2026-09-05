<!-- Sync Impact Report
Version change: 0.0.0 → 1.0.0
Added principles:
  - I. Component-First Architecture
  - II. Type Safety
  - III. Performance-First
  - IV. Testing Strategy
  - V. Code Quality
Added sections:
  - Technology Stack
  - Development Workflow
Removed sections: None
Follow-up TODOs: None
-->

# Stripe Sandbox Frontend Constitution

## Core Principles

### I. Component-First Architecture

Every UI feature MUST be built as a self-contained React component. Components MUST have clear responsibilities, proper props typing, and be independently testable. Avoid monolithic page components - compose features from smaller, reusable pieces. Component files MUST follow consistent naming conventions (PascalCase for components, camelCase for utilities).

### II. Type Safety

TypeScript MUST be used for all application code. Any MUST be avoided - use proper type definitions. Props interfaces MUST be explicitly defined for all components. API responses and data structures MUST have corresponding TypeScript types. Type assertions SHOULD be minimized in favor of type guards and narrowing.

### III. Performance-First

Next.js App Router conventions MUST be followed for routing and data fetching. Components SHOULD use appropriate rendering strategies (Server Components by default, Client Components only when needed). Images MUST use Next.js Image component for optimization. Bundle size MUST be monitored - avoid unnecessary dependencies. Code splitting SHOULD be applied to large components or features.

### IV. Testing Strategy

Critical business logic MUST have unit tests. Component tests SHOULD cover user interactions and edge cases. Integration tests MUST verify key user flows. Test files MUST be co-located with source files using `.test.ts` or `.test.tsx` extensions. Tests SHOULD follow Arrange-Act-Assert pattern.

### V. Code Quality

All code MUST pass ESLint and TypeScript type checking before commit. Prettier MUST be used for consistent formatting. Husky pre-commit hooks MUST NOT be bypassed. Code reviews are required for all changes. Complex logic MUST have explanatory comments. Dead code MUST be removed promptly.

## Technology Stack

- **Framework**: Next.js 16.3.0 (App Router)
- **Runtime**: React 19.2.8
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Linting**: ESLint 9.x with eslint-config-next
- **Formatting**: Prettier 3.x with Tailwind plugin
- **Git Hooks**: Husky 9.x with lint-staged

## Development Workflow

1. **Setup**: Use `npm install` for dependency installation
2. **Development**: Run `npm run dev` for local development server
3. **Validation**: Run `npm run typecheck` and `npm run lint` before committing
4. **Formatting**: Run `npm run format` to auto-format code
5. **Pre-commit**: Husky automatically runs lint-staged on staged files
6. **Build**: Use `npm run build` to verify production build succeeds

## Governance

This constitution supersedes all other development practices for this project. Amendments require:

1. Documented rationale for the change
2. Update to version number following semantic versioning
3. Communication to all project contributors
4. Migration plan for existing code if principles change

Compliance is enforced through:

- Automated pre-commit hooks (linting, formatting, type checking)
- Code review process
- CI/CD pipeline checks (if applicable)

**Version**: 1.0.0 | **Ratified**: 2026-09-04 | **Last Amended**: 2026-09-04
