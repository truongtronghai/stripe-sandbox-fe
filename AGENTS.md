# Agent Development Policy

Superpowers is installed and available. If not installed, ask user to install.

Use Superpowers skills when they provide meaningful value, but use engineering judgment
about process overhead.

For simple, low-risk changes such as:

- CSS/Tailwind changes
- simple JSX changes
- visual/layout changes
- renaming
- mechanical refactoring
- obvious configuration changes

do not invoke TDD.

For normal features:

- implement the feature
- run relevant tests
- fix failures
- verify the result

Use test-driven-development for:

- complex business logic
- complex state transitions
- authentication/authorization
- non-trivial data transformations
- complex hooks
- high-risk behavior
- regression bugs where a regression test is valuable

When a bug is discovered, prefer writing a regression test before fixing it.

Always perform appropriate verification before declaring the task complete.

Verification uses typecheck/lint/build by default. Do NOT automatically run e2e tests
with a headless browser; they are not required for every task. If a headless browser
e2e test is truly needed, ask the user first, then run it.

## Code Style

- Never use `any` type. Use proper types, generics, or `declare global` augmentation as needed.
- Do not use abbreviation for function or class names. Using meaningful names instead.
- Custom hooks: All custom hooks MUST live in `src/hooks`, not inside component files. Components should consume
  them via imports instead of defining hooks inline.
- Functions are used at multi places MUST be organized as helpers and consumed via importing.
- Separate to components if available. Do not put all components into a big TSX file.
