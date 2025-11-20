# Git Hooks & Workflow Documentation

This document describes the git hooks and CI/CD workflows configured for this project.

## Overview

This project uses **Husky** for managing git hooks and **GitHub Actions** for automated CI/CD checks on pull requests.

## Pre-Commit Hook

The pre-commit hook runs automatically before each commit to ensure code quality.

### What It Does

1. **Lint-staged**: Runs ESLint and Prettier on staged files only
   - Lints TypeScript/TSX files
   - Formats code automatically
   - Only processes files that are staged for commit

2. **Type Checking**: Runs TypeScript compiler to check for type errors
   - Ensures no type errors before commit
   - Fast feedback loop for developers

### How to Use

The hook runs automatically. If it fails:
- Fix the linting/formatting issues
- Fix any TypeScript errors
- Stage your changes again
- Commit again

### Bypassing (Not Recommended)

```bash
# Skip hooks (use with caution)
git commit --no-verify
```

## Pre-Push Hook

The pre-push hook runs automatically before each push to ensure the codebase is in a good state.

### What It Does

1. **Full Test Suite**: Runs all tests in CI mode
   - Ensures all tests pass
   - Generates coverage report
   - Prevents pushing broken code

2. **Build Check**: Verifies the project builds successfully
   - Catches build errors early
   - Ensures production readiness

### How to Use

The hook runs automatically. If it fails:
- Fix failing tests
- Fix build errors
- Push again

### Bypassing (Not Recommended)

```bash
# Skip hooks (use with caution)
git push --no-verify
```

## GitHub Actions Workflow

The PR workflow runs automatically on pull requests and pushes to main branches.

### What It Does

1. **Lint & Type Check Job**
   - Runs ESLint
   - Checks code formatting
   - Type checks with TypeScript

2. **Test Job**
   - Runs full test suite
   - Generates coverage report

3. **Build Job**
   - Builds the project
   - Verifies production build succeeds

### Triggers

- Pull requests to `main`, `master`, or `develop`
- Pushes to `main`, `master`, or `develop`

### Viewing Results

- Go to the "Actions" tab in GitHub
- Click on the workflow run for your PR
- Review any failing checks

## Setup Instructions

### Initial Setup

1. **Install dependencies** (includes Husky):
   ```bash
   npm install
   ```

2. **Husky will auto-install** via the `prepare` script in package.json

3. **Verify hooks are installed**:
   ```bash
   ls -la .husky
   ```

### For New Team Members

1. Clone the repository
2. Run `npm install` (Husky will be set up automatically)
3. Start developing - hooks will run automatically

## Configuration Files

### Husky Configuration
- `.husky/pre-commit` - Pre-commit hook script
- `.husky/pre-push` - Pre-push hook script
- `.husky/_/husky.sh` - Husky internal script

### GitHub Actions
- `.github/workflows/pr-checks.yml` - PR workflow configuration

### Lint-Staged
- Configured in `package.json` under `lint-staged`
- Runs ESLint and Prettier on staged files

### Prettier
- `.prettierrc` - Prettier configuration
- `.prettierignore` - Files to ignore

## Scripts Reference

### Available npm Scripts

```bash
# Linting
npm run lint              # Check for linting errors
npm run lint:fix          # Fix linting errors automatically

# Formatting
npm run format            # Format all files
npm run format:check      # Check if files are formatted

# Type Checking
npm run type-check        # Check TypeScript types

# Testing
npm run test              # Run tests in watch mode
npm run test:ci           # Run tests in CI mode (no watch)

# Building
npm run build             # Build for production
```

## Troubleshooting

### Hooks Not Running

1. **Check if Husky is installed**:
   ```bash
   npm list husky
   ```

2. **Reinstall Husky**:
   ```bash
   npm install
   npx husky install
   ```

3. **Check hook permissions** (Linux/Mac):
   ```bash
   chmod +x .husky/pre-commit
   chmod +x .husky/pre-push
   ```

### Pre-commit Failing

- **Linting errors**: Run `npm run lint:fix`
- **Formatting issues**: Run `npm run format`
- **Type errors**: Fix TypeScript errors shown

### Pre-push Failing

- **Test failures**: Fix failing tests
- **Build errors**: Fix build issues
- Run `npm run test:ci` and `npm run build` locally first

### GitHub Actions Failing

- Check the Actions tab for detailed error messages
- Ensure all checks pass locally before pushing
- Review the workflow logs for specific failures

## Best Practices

1. **Always run hooks locally** before pushing
2. **Fix issues immediately** when hooks fail
3. **Don't bypass hooks** unless absolutely necessary
4. **Keep hooks fast** - they should complete in seconds
5. **Update hooks** as the project evolves

## Disabling Hooks (Temporary)

If you need to temporarily disable hooks (not recommended):

```bash
# Set environment variable
export HUSKY=0

# Or use git flags
git commit --no-verify
git push --no-verify
```

Remember to re-enable hooks after your work is done!

---

**Last Updated**: January 2025

