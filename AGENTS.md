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
