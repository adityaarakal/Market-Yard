# Versioning Strategy

## Overview

Market Yard uses **Semantic Versioning (SemVer)** for automated version management. Versions follow the format: `MAJOR.MINOR.PATCH` (e.g., `1.2.3`).

## Version Number Format

```
MAJOR.MINOR.PATCH
│     │     │
│     │     └─ Patch: Bug fixes, minor improvements, documentation
│     └─────── Minor: New features (backward compatible)
└───────────── Major: Breaking changes, major features, architectural changes
```

## Version Bump Rules

### MAJOR Version (1.0.0 → 2.0.0)

Bumped when:
- **Breaking Changes**: Changes that require users to modify their existing data or workflow
- **Data Format Changes**: Changes to localStorage schema that are not backward compatible
- **API Breaking Changes**: Changes to public APIs, service methods, or component props
- **Major Architecture Changes**: Significant refactoring affecting multiple systems
- **Migration Required**: Data migration scripts needed for existing users

**Examples:**
- Changing data structure requiring migration
- Removing or significantly changing core features
- Changing storage format from one system to another
- Major UI/UX overhaul affecting user workflows

### MINOR Version (1.0.0 → 1.1.0)

Bumped when:
- **New Features**: Adding new functionality that doesn't break existing features
- **New Pages/Components**: Adding new pages, major components, or sections
- **Enhanced Functionality**: Significant improvements to existing features
- **New Integrations**: Adding support for new features or integrations

**Examples:**
- Adding new page (e.g., Analytics, Reports)
- Adding new transaction type or category
- Adding new export formats
- Adding new chart types or analytics
- New settings or configuration options

### PATCH Version (1.0.0 → 1.0.1)

Bumped when:
- **Bug Fixes**: Fixing bugs in existing functionality
- **Small Improvements**: Minor enhancements that don't add new features
- **Documentation Updates**: Updating documentation (unless breaking)
- **UI/UX Tweaks**: Small UI improvements, styling updates
- **Performance Improvements**: Optimizations without feature changes
- **Code Quality**: Refactoring that doesn't change functionality
- **Dependency Updates**: Updating dependencies (unless they introduce breaking changes)

**Examples:**
- Fixing calculation errors
- Fixing UI rendering issues
- Improving error messages
- Optimizing queries or data processing
- Fixing typos or documentation errors

## Version Files

Versions are stored in multiple locations for consistency:

1. **`package.json`** (root): Main project version
2. **`VERSION.txt`**: Simple text file for quick access

## Workflow Process

### On Feature Branch

1. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
2. **Bump Version**: Run appropriate version bump command
   - `npm run version:patch` - For bug fixes
   - `npm run version:minor` - For new features
   - `npm run version:major` - For breaking changes
3. **Commit Changes**: Version bump is automatically validated in pre-commit hook
4. **Push Branch**: Create PR (version bump validation runs in CI)

### Manual Version Control

To manually set a version (e.g., for hotfixes):

```bash
# Set specific version
npm run version:set 1.2.3

# Bump major
npm run version:major

# Bump minor
npm run version:minor

# Bump patch
npm run version:patch
```

## Mandatory Version Bump

**CRITICAL**: All feature branches **MUST** have a version bump that is ahead of the main branch version.

- ✅ **Required**: Version bump is validated in pre-commit hook
- ✅ **Required**: Version bump is validated in PR workflow
- ❌ **Cannot be bypassed**: Version bump is mandatory for all PRs
- ❌ **Cannot skip**: Even documentation-only PRs need version bump

### How Version Bump Validation Works

1. **Pre-commit Hook**: Validates branch version > main branch version
2. **PR Workflow**: Validates incoming branch version > base branch version
3. **Blocking**: Commit/PR is blocked if version is not ahead

### Fixing Version Bump Issues

If version bump validation fails:

```bash
# 1. Ensure branch is up to date
git fetch origin main
git merge origin/main

# 2. Bump version (choose appropriate)
npm run version:patch   # For bug fixes
npm run version:minor   # For features
npm run version:major  # For breaking changes

# 3. Commit version bump
git add package.json VERSION.txt
git commit -m "chore: Bump version to <NEW_VERSION>"

# 4. Push and try again
git push
```

## Version Display

The current version can be accessed:

- **package.json**: `require('./package.json').version`
- **VERSION.txt**: Read file directly
- **Build-time**: Version can be injected at build time

## Best Practices

1. **Always Bump Version**: Every PR must have a version bump
2. **Choose Appropriate Bump**: Use PATCH for fixes, MINOR for features, MAJOR for breaking changes
3. **Commit Version Separately**: Consider committing version bump in separate commit
4. **Tag Releases**: Create git tags for releases: `git tag v1.2.3`
5. **Document Changes**: Update CHANGELOG.md with version changes

## Examples

### Example 1: Bug Fix
- PR: Fix price calculation error
- Bump: PATCH (0.1.0 → 0.1.1)
- Command: `npm run version:patch`

### Example 2: New Feature
- PR: Add favorites functionality
- Bump: MINOR (0.1.0 → 0.2.0)
- Command: `npm run version:minor`

### Example 3: Breaking Change
- PR: Refactor data storage format (requires migration)
- Bump: MAJOR (0.1.0 → 1.0.0)
- Command: `npm run version:major`

## Questions or Issues?

If unsure about version bump type:
- Default to PATCH for fixes
- Default to MINOR for features
- Only use MAJOR for confirmed breaking changes
- Ask for review if uncertain

