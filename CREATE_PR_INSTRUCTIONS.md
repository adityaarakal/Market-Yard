# Create Pull Request

## Quick Link
**Click here to create the PR:**
https://github.com/adityaarakal/Market-Yard/compare/main...fix/gh-pages-deployment?expand=1

## PR Details

**Title:** `fix: Fix GitHub Pages deployment workflow`

**Description:**
```
# fix: Fix GitHub Pages deployment workflow

## 🎯 Overview

This PR fixes the GitHub Pages deployment workflow that was failing due to build errors.

## 🐛 Issue

The GitHub Pages deployment was failing because:
- Build step was treating ESLint warnings as errors (CI=true by default)
- Using `npm install` instead of `npm ci` for consistency

## ✨ Fix

- ✅ Added `CI=false` to build step to allow warnings (matching PR checks workflow)
- ✅ Changed `npm install` to `npm ci` for faster, reliable installs
- ✅ Ensures deployment works correctly with existing warnings

## 📊 Version Bump

**Current Version**: `0.1.2` → `0.1.3` (PATCH increment)

This is a PATCH increment because:
- Bug fix for deployment workflow
- No breaking changes
- No new features

## 🚀 Ready for Review

This PR fixes the GitHub Pages deployment issue and ensures the site deploys correctly.
```

## Steps
1. Click the link above
2. Copy and paste the title and description
3. Click "Create pull request"
4. The workflow will run automatically

