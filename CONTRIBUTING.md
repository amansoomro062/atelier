# Contributing to Atelier

Thank you for your interest in contributing to Atelier! This document provides guidelines for contributing to the project.

## 🎯 Development Setup

### Prerequisites
- Node.js 20.9.0 or higher
- npm or yarn
- Git

### Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/atelier.git
   cd atelier
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📝 Commit Message Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, no code change)
- **refactor**: Code refactoring (no feature change or bug fix)
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates
- **ci**: CI/CD changes

### Scopes (optional)
- **api**: API routes
- **ui**: User interface components
- **editor**: Code/prompt editors
- **core**: Core functionality
- **deps**: Dependencies

### Examples

**Good commit messages:**
```
feat(editor): add Monaco editor with syntax highlighting

- Integrated @monaco-editor/react
- Added support for JavaScript and TypeScript
- Configured dark theme
- Added code execution button

Closes #12
```

```
fix(api): handle streaming errors in OpenAI route

Previously, streaming errors would crash the application.
Now properly catches and returns error messages to the client.

Fixes #45
```

```
docs: update README with installation instructions

Added detailed setup guide and usage examples.
```

**Bad commit messages:**
```
updated stuff
fix bug
WIP
```

## 🔀 Pull Request Process

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code style

3. **Commit your changes** using conventional commits:
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request** with:
   - Clear title following conventional commits
   - Description of changes
   - Screenshots (if UI changes)
   - Reference to related issues

### PR Title Format
```
feat(editor): add multi-file support
fix(api): resolve streaming timeout issue
docs: improve API documentation
```

## 🎨 Code Style

- **TypeScript**: Use strict mode, provide types for all functions
- **React**: Use functional components with hooks
- **Formatting**: Prettier (auto-formats on save)
- **Linting**: ESLint (follows Next.js config)

### Component Structure
```typescript
"use client"; // If using client-side features

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ComponentProps {
  title: string;
  onAction?: () => void;
}

export function Component({ title, onAction }: ComponentProps) {
  const [state, setState] = useState("");

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## 🧪 Testing

Before submitting a PR:

1. **Test your changes locally**:
   ```bash
   npm run dev
   ```

2. **Check for TypeScript errors**:
   ```bash
   npm run build
   ```

3. **Test core functionality**:
   - AI prompt generation
   - Code execution
   - Theme switching
   - Panel resizing

## 📁 Project Structure

```
app/
├── api/              # API routes (OpenAI, Anthropic)
├── components/       # React components
│   ├── editor/      # Prompt & Code editors
│   ├── layout/      # Layout components
│   ├── preview/     # Output panel
│   └── settings/    # Settings dialogs
└── page.tsx         # Main entry point

lib/
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
└── utils/           # Utility functions

components/ui/       # shadcn/ui components
```

## 🐛 Reporting Bugs

Use GitHub Issues with the bug template:

**Title**: Brief description
**Description**:
- What happened
- What you expected
- Steps to reproduce
- Screenshots (if applicable)
- Environment (OS, browser, Node version)

## 💡 Suggesting Features

Use GitHub Issues with the feature template:

**Title**: Feature name
**Description**:
- Problem it solves
- Proposed solution
- Alternatives considered
- Additional context

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help newcomers

## 🙏 Recognition

Contributors will be:
- Listed in README.md
- Mentioned in release notes
- Credited in commit history

## ❓ Questions?

- Open a GitHub Discussion
- Check existing issues
- Read the documentation in `/requirements`

Thank you for contributing to Atelier! 🎉
