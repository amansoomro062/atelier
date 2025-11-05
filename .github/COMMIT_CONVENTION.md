# Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/) for clear and standardized commit messages.

## Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

## Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(editor): add code folding` |
| `fix` | Bug fix | `fix(api): resolve timeout error` |
| `docs` | Documentation | `docs: update README` |
| `style` | Code style (no logic change) | `style: format with prettier` |
| `refactor` | Code refactoring | `refactor(hooks): simplify useApiKeys` |
| `perf` | Performance improvement | `perf(editor): optimize re-renders` |
| `test` | Adding tests | `test(utils): add execution tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `ci` | CI/CD changes | `ci: add GitHub Actions workflow` |

## Scopes

| Scope | Description |
|-------|-------------|
| `api` | API routes (OpenAI, Anthropic) |
| `editor` | Code or Prompt editors |
| `ui` | UI components |
| `layout` | Layout components |
| `hooks` | Custom React hooks |
| `utils` | Utility functions |
| `types` | TypeScript types |
| `deps` | Dependencies |
| `config` | Configuration files |

## Examples

### Good Examples ✅

```bash
# Feature with scope
feat(editor): add Monaco editor integration

- Installed @monaco-editor/react
- Configured JavaScript and TypeScript support
- Added dark theme
- Implemented code execution

# Bug fix with issue reference
fix(api): handle OpenAI streaming errors

Previously, network errors during streaming would crash the app.
Now properly catches errors and displays toast notification.

Fixes #42

# Documentation
docs: add contributing guidelines

Added CONTRIBUTING.md with:
- Development setup
- Commit conventions
- PR process
- Code style guide

# Chore
chore(deps): upgrade Next.js to 16.0.1

# Multiple changes
feat(ui): implement dark/light theme toggle

- Added ThemeProvider with next-themes
- Created ThemeToggle component
- Configured Tailwind CSS dark mode
- Theme persists in localStorage
```

### Bad Examples ❌

```bash
# Too vague
update files

# No type
added feature

# Not descriptive
fix bug

# All caps
FIX: BROKEN CODE

# Too casual
lol fixed it
```

## Body Guidelines

The body should:
- Explain **what** and **why** (not how - that's in the code)
- Use present tense ("add feature" not "added feature")
- Include bullet points for multiple changes
- Reference issues/PRs when applicable

## Footer

Use footer for:
- Breaking changes: `BREAKING CHANGE: <description>`
- Issue references: `Fixes #123`, `Closes #456`
- Co-authors: `Co-authored-by: Name <email>`

## Breaking Changes

```bash
feat(api)!: change API response format

BREAKING CHANGE: API now returns { data, error } instead of raw response.
Update all API calls to use the new format.

Migration guide: docs/migration.md
```

## Tools

### Commitlint (Optional)

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

### Husky (Optional)

```bash
npm install --save-dev husky
npx husky install
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit "$1"'
```

## Quick Reference

```bash
# Feature
git commit -m "feat(editor): add feature"

# Bug fix
git commit -m "fix(api): resolve issue"

# Documentation
git commit -m "docs: update guide"

# Refactor
git commit -m "refactor(utils): improve function"

# Chore
git commit -m "chore(deps): update packages"
```

## Commit Message Template

Create `.gitmessage` in project root:

```
# <type>(<scope>): <subject>
# |<----  Preferably using up to 50 characters  ---->|

# [optional body]
# |<----   Try to limit each line to 72 characters   ---->|

# [optional footer]

# Type:
#   feat, fix, docs, style, refactor, perf, test, chore, ci
# Scope:
#   api, editor, ui, layout, hooks, utils, types, deps, config
# Subject:
#   Brief description in present tense
# Body:
#   Motivation for change, contrast with previous behavior
# Footer:
#   Issue references, breaking changes
```

Configure:
```bash
git config commit.template .gitmessage
```
