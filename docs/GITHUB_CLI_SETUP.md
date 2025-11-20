# GitHub CLI Setup Guide

## Installation

### Windows

**Option 1: Using winget (Recommended)**
```powershell
winget install --id GitHub.cli
```

**Option 2: Using Chocolatey**
```powershell
choco install gh
```

**Option 3: Using Scoop**
```powershell
scoop install gh
```

**Option 4: Manual Download**
1. Download from: https://cli.github.com/
2. Run the installer
3. Restart your terminal

### macOS

```bash
brew install gh
```

### Linux

```bash
# Debian/Ubuntu
sudo apt install gh

# Fedora
sudo dnf install gh

# Arch
sudo pacman -S github-cli
```

## Authentication

After installation, authenticate with GitHub:

```bash
gh auth login
```

This will guide you through:
1. **GitHub.com** or **GitHub Enterprise Server**
2. **HTTPS** or **SSH** protocol
3. **Browser** or **Token** authentication

### Recommended: Browser Authentication

1. Run `gh auth login`
2. Choose "GitHub.com"
3. Choose "HTTPS"
4. Choose "Login with a web browser"
5. Copy the code shown
6. Press Enter to open browser
7. Paste the code in the browser
8. Authorize GitHub CLI

### Alternative: Token Authentication

1. Run `gh auth login`
2. Choose "GitHub.com"
3. Choose "HTTPS"
4. Choose "Paste an authentication token"
5. Go to: https://github.com/settings/tokens
6. Generate a new token with `repo` scope
7. Paste the token

## Verify Installation

```bash
gh auth status
```

Should show:
```
✓ Logged in to github.com as <your-username>
```

## Usage

### Create Pull Request

```bash
gh pr create --title "Your PR Title" --body "PR description"
```

### List Pull Requests

```bash
gh pr list
```

### View Pull Request

```bash
gh pr view <number>
```

### Update PR Description

```bash
gh pr edit <number> --body "New description"
```

## For This Project

After authentication, I can help you:
- Create pull requests
- Update PR descriptions
- Manage PRs
- Review PR status

