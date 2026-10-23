# Contributing to ChainLearn

Thank you for your interest in contributing to ChainLearn! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/<your-username>/chainlearn-frontend.git
   cd chainlearn-frontend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Branch Naming

Use descriptive branch names prefixed with the type of change:

- `fix/<short-description>` — bug fixes
- `feat/<short-description>` — new features
- `docs/<short-description>` — documentation changes
- `refactor/<short-description>` — code refactoring

## Commit Conventions

Write clear, concise commit messages:

- Use the imperative mood ("Add feature" not "Added feature")
- Keep the subject line under 72 characters
- Reference related issues in the commit body when applicable

## Testing Requirements

Before submitting a PR, ensure the following pass:

```bash
npm run lint
npm run build
```

If your change affects logic, add or update tests where applicable.

## Pull Request Process

1. Create a feature branch from `main`
2. Make your changes with clear, incremental commits
3. Ensure lint and build pass locally
4. Push to your fork
5. Open a PR against `main` with a clear description
6. Link any related issues using closing keywords (e.g. `Fixes #123`)
7. Respond to review feedback promptly

## Code Style

- Follow the existing code conventions in the codebase
- Use TypeScript for all new code
- Prefer named exports over default exports
- Keep components small and focused
