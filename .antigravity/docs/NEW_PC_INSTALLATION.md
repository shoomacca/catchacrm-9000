# NEW GENESIS v8.2 - New PC Installation Guide

**Version:** 8.2 (OpenCode Edition)
**Last Updated:** 2026-01-14
**Estimated Time:** 10-15 minutes

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Method 1: Automated Installation (Recommended)](#method-1-automated-installation-recommended)
4. [Method 2: Manual Installation](#method-2-manual-installation)
5. [Post-Installation Setup](#post-installation-setup)
6. [Troubleshooting](#troubleshooting)
7. [Verification](#verification)

---

## Prerequisites

Before installing NEW GENESIS, ensure you have:

### Required Software

1. **Git** (Version 2.30+)
   - Download: https://git-scm.com/
   - Verify: `git --version`

2. **Node.js** (Version 18+)
   - Download: https://nodejs.org/ (LTS version recommended)
   - Verify: `node --version`

3. **npm** (Comes with Node.js)
   - Verify: `npm --version`

4. **PowerShell** (Version 5.1+ or PowerShell 7+)
   - Windows 10/11: Already installed
   - Verify: `$PSVersionTable.PSVersion`

### Optional Software

5. **OpenCode** (Recommended for AntiGravity)
   - Website: https://opencode.ai/
   - Or use Claude Code from Anthropic

6. **VS Code** (Optional, for editing)
   - Download: https://code.visualstudio.com/

---

## Installation Methods

Choose one of these methods:

| Method | Time | Difficulty | Best For |
|--------|------|------------|----------|
| **Automated** | 5 min | Easy | Most users |
| **Manual** | 15 min | Medium | Advanced users or troubleshooting |

---

## Method 1: Automated Installation (Recommended)

### Step 1: Get the Installation Files

**Option A: Download from source**
```powershell
# If you have the files already
cd "path\to\antigravity\8.2_140126"
```

**Option B: Clone from repository (if available)**
```powershell
git clone https://github.com/your-org/antigravity-genesis.git
cd antigravity-genesis
```

### Step 2: Run the Installer

```powershell
# Navigate to the scripts folder
cd "C:\path\to\8.2_140126\scripts"

# Run the fixed installer
.\Install-AntiGravity-Fixed.ps1
```

**Note:** If you get a "script not digitally signed" error, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3: Follow the Prompts

The installer will:
1. ✅ Check prerequisites (Git, Node.js, npm)
2. ✅ Create directory structure at `C:\Users\<You>\.antigravity`
3. ✅ Copy all template files
4. ✅ Install the `ng` command
5. ✅ Set environment variables
6. ✅ Ask to reload PowerShell profile

**What to expect:**
```
╔══════════════════════════════════════════════════════╗
║      NEW GENESIS v8.2 INSTALLER              ║
║      OpenCode Edition                                ║
╚══════════════════════════════════════════════════════╝

This will install NEW GENESIS to:
  C:\Users\YourName\.antigravity

══════════════════════════════════════════════════════
  Checking Prerequisites
══════════════════════════════════════════════════════

✓ Git installed: git version 2.43.0
✓ Node.js installed: v20.10.0
✓ npm installed: v10.2.3

══════════════════════════════════════════════════════
  Creating Directory Structure
══════════════════════════════════════════════════════

✓ Created: .antigravity
✓ Created: _MASTER_TEMPLATES
...

Installation complete! 🎉
```

### Step 4: Reload PowerShell Profile

When prompted, type `Y` to reload your profile:
```
Would you like to reload your PowerShell profile now?
(This activates the 'ng' command) (Y/n): Y

✓ Profile reloaded! 'ng' command is ready.

Try it: ng "Test project"
```

**Or manually:**
```powershell
. $PROFILE
```

### Step 5: Test the Installation

```powershell
# Test the ng command exists
Get-Command ng

# Try creating a test project (you can cancel)
ng "Test SaaS project"
```

---

## Method 2: Manual Installation

If the automated installer doesn't work, follow these manual steps:

### Step 1: Create Directory Structure

```powershell
# Define installation path
$installPath = "$env:USERPROFILE\.antigravity"

# Create directories
New-Item -ItemType Directory -Path "$installPath\_MASTER_TEMPLATES\version_history\8.2_140126" -Force
New-Item -ItemType Directory -Path "$installPath\_MASTER_TEMPLATES\core" -Force
New-Item -ItemType Directory -Path "$installPath\_MASTER_TEMPLATES\roles" -Force
New-Item -ItemType Directory -Path "$installPath\_MASTER_TEMPLATES\scripts" -Force
New-Item -ItemType Directory -Path "$installPath\_MASTER_TEMPLATES\docs" -Force
New-Item -ItemType Directory -Path "$installPath\_MASTER_TEMPLATES\workflows" -Force
New-Item -ItemType Directory -Path "$installPath\projects" -Force

Write-Host "✓ Directory structure created" -ForegroundColor Green
```

### Step 2: Copy Template Files

```powershell
# Set source path (where you have the 8.2_140126 folder)
$sourcePath = "C:\path\to\your\8.2_140126"

# Copy everything to version_history
Copy-Item -Path "$sourcePath\*" -Destination "$installPath\_MASTER_TEMPLATES\version_history\8.2_140126\" -Recurse -Force

# Copy to master root for easy access
$itemsToCopy = @("core", "roles", "scripts", "docs", "workflows", 
                 "CLAUDE.md", "README.md", "CHANGELOG.md", "AGENTS.md", 
                 "OPENCODE.md", "OPENCODE_README.md", "opencode.json")

foreach ($item in $itemsToCopy) {
    $src = "$sourcePath\$item"
    $dest = "$installPath\_MASTER_TEMPLATES\$item"
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dest -Recurse -Force
        Write-Host "✓ Copied: $item" -ForegroundColor Green
    }
}
```

### Step 3: Install ng Command

```powershell
# Create PowerShell profile if it doesn't exist
if (-not (Test-Path $PROFILE)) {
    New-Item -Path $PROFILE -ItemType File -Force
}

# Read the ng function
$ngFunction = Get-Content "$installPath\_MASTER_TEMPLATES\scripts\ng-function.ps1" -Raw

# Append to profile
Add-Content -Path $PROFILE -Value "`n`n# ============================================================================"
Add-Content -Path $PROFILE -Value "# NEW GENESIS v8.2 - Installed $(Get-Date -Format 'yyyy-MM-dd')"
Add-Content -Path $PROFILE -Value "# ============================================================================"
Add-Content -Path $PROFILE -Value $ngFunction

Write-Host "✓ ng command installed" -ForegroundColor Green
```

### Step 4: Set Environment Variables

```powershell
# Set environment variables (User level)
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_HOME", $installPath, "User")
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_TEMPLATES", "$installPath\_MASTER_TEMPLATES", "User")
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_PROJECTS", "$installPath\projects", "User")

Write-Host "✓ Environment variables set" -ForegroundColor Green
```

### Step 5: Reload Profile

```powershell
. $PROFILE
Write-Host "✓ Profile reloaded - ng command ready!" -ForegroundColor Green
```

---

## Post-Installation Setup

### 1. Configure API Keys (Optional but Recommended)

For Indiana automation (GitHub, Linear, Vercel integration):

```powershell
# GitHub Personal Access Token
# Get from: https://github.com/settings/tokens
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_YourTokenHere", "User")

# Linear API Key
# Get from: https://linear.app/settings/api
[Environment]::SetEnvironmentVariable("LINEAR_API_KEY", "lin_api_YourKeyHere", "User")

# Vercel API Token
# Get from: https://vercel.com/account/tokens
[Environment]::SetEnvironmentVariable("VERCEL_TOKEN", "YourTokenHere", "User")

# n8n Webhook URL (if using MCP)
[Environment]::SetEnvironmentVariable("N8N_WEBHOOK_URL", "https://your-n8n.com/webhook/...", "User")
```

**To verify:**
```powershell
$env:GITHUB_TOKEN
$env:LINEAR_API_KEY
```

### 2. Configure Git (If Not Already Done)

```powershell
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Recommended settings
git config --global init.defaultBranch main
git config --global core.autocrlf true  # Windows

# Verify
git config --list
```

### 3. Copy .gitignore Template

Always copy the .gitignore template to new projects:

```powershell
# Example for a new project
cd "$env:ANTIGRAVITY_PROJECTS\my-project"
Copy-Item "$env:ANTIGRAVITY_TEMPLATES\core\.gitignore.template" ".gitignore"
```

This prevents committing:
- Temporary files (tmpclaude-*)
- Environment variables (.env)
- API keys
- node_modules/

---

## Troubleshooting

### Issue 1: "Script not digitally signed"

**Error:**
```
File cannot be loaded because running scripts is disabled on this system
```

**Solution:**
```powershell
# Allow running scripts for current user
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then try again
.\Install-AntiGravity-Fixed.ps1
```

### Issue 2: "ng command not found"

**Solution:**
```powershell
# Check if function exists in profile
Get-Content $PROFILE | Select-String "New-Gravity"

# If not found, reload profile
. $PROFILE

# If still not found, reinstall
cd "$env:ANTIGRAVITY_TEMPLATES\scripts"
.\Install-AntiGravity-Fixed.ps1 -Force
```

### Issue 3: "Cannot find path" errors

**Solution:**
```powershell
# Check if directories exist
Test-Path "$env:ANTIGRAVITY_HOME"
Test-Path "$env:ANTIGRAVITY_TEMPLATES"

# If false, reinstall
.\Install-AntiGravity-Fixed.ps1
```

### Issue 4: Parser errors in script

**Solution:**
Use the fixed version:
```powershell
cd "C:\path\to\8.2_140126\scripts"
.\Install-AntiGravity-Fixed.ps1  # Use the -Fixed version
```

### Issue 5: Environment variables not working

**Solution:**
```powershell
# Restart PowerShell to load environment variables
# Or set them manually:
$env:ANTIGRAVITY_HOME = "$env:USERPROFILE\.antigravity"
$env:ANTIGRAVITY_TEMPLATES = "$env:ANTIGRAVITY_HOME\_MASTER_TEMPLATES"
$env:ANTIGRAVITY_PROJECTS = "$env:ANTIGRAVITY_HOME\projects"
```

### Issue 6: Git Bash shows errors

**Note:** AntiGravity is designed for PowerShell, not Git Bash.

**Solution:**
Use PowerShell for AntiGravity commands. If you must use Git Bash:
```bash
# Use forward slashes
cd /c/Users/YourName/.antigravity

# Call PowerShell for ng command
powershell.exe -Command "ng 'Your project'"
```

---

## Verification

### Quick Verification Checklist

Run these commands to verify installation:

```powershell
# 1. Check directories exist
Test-Path "$env:ANTIGRAVITY_HOME"  # Should return: True
Test-Path "$env:ANTIGRAVITY_TEMPLATES"  # Should return: True

# 2. Check environment variables
$env:ANTIGRAVITY_HOME
$env:ANTIGRAVITY_TEMPLATES
$env:ANTIGRAVITY_PROJECTS

# 3. Check ng command exists
Get-Command ng  # Should show: CommandType: Function

# 4. List template files
ls "$env:ANTIGRAVITY_TEMPLATES\core"  # Should show 7+ files

# 5. List role files
ls "$env:ANTIGRAVITY_TEMPLATES\roles"  # Should show 7 ROLE_*.md files

# 6. Check scripts
ls "$env:ANTIGRAVITY_TEMPLATES\scripts"  # Should show indiana*.js files
```

### Full System Check

```powershell
# Run this comprehensive check
function Test-AntiGravityInstallation {
    Write-Host "AntiGravity Installation Check" -ForegroundColor Cyan
    Write-Host ""
    
    $checks = @(
        @{Name="ANTIGRAVITY_HOME"; Test={Test-Path $env:ANTIGRAVITY_HOME}},
        @{Name="ANTIGRAVITY_TEMPLATES"; Test={Test-Path $env:ANTIGRAVITY_TEMPLATES}},
        @{Name="Core templates"; Test={(ls "$env:ANTIGRAVITY_TEMPLATES\core" -ErrorAction SilentlyContinue).Count -ge 7}},
        @{Name="Role definitions"; Test={(ls "$env:ANTIGRAVITY_TEMPLATES\roles\ROLE_*.md" -ErrorAction SilentlyContinue).Count -eq 7}},
        @{Name="Scripts"; Test={(ls "$env:ANTIGRAVITY_TEMPLATES\scripts\indiana*.js" -ErrorAction SilentlyContinue).Count -eq 3}},
        @{Name="ng command"; Test={Get-Command ng -ErrorAction SilentlyContinue}},
        @{Name="Git"; Test={git --version 2>$null}},
        @{Name="Node.js"; Test={node --version 2>$null}},
        @{Name="npm"; Test={npm --version 2>$null}}
    )
    
    $passed = 0
    $failed = 0
    
    foreach ($check in $checks) {
        $result = & $check.Test
        if ($result) {
            Write-Host "✓ $($check.Name)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "✗ $($check.Name)" -ForegroundColor Red
            $failed++
        }
    }
    
    Write-Host ""
    Write-Host "Results: $passed passed, $failed failed" -ForegroundColor $(if ($failed -eq 0) {"Green"} else {"Yellow"})
    
    if ($failed -eq 0) {
        Write-Host "🎉 Installation verified successfully!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Some checks failed. See troubleshooting section." -ForegroundColor Yellow
    }
}

# Run the check
Test-AntiGravityInstallation
```

**Expected output:**
```
AntiGravity Installation Check

✓ ANTIGRAVITY_HOME
✓ ANTIGRAVITY_TEMPLATES
✓ Core templates
✓ Role definitions
✓ Scripts
✓ ng command
✓ Git
✓ Node.js
✓ npm

Results: 9 passed, 0 failed
🎉 Installation verified successfully!
```

---

## Next Steps

After successful installation:

### 1. Read the Documentation

```powershell
cd "$env:ANTIGRAVITY_TEMPLATES"

# Quick start
cat OPENCODE_README.md

# Complete guide
cat OPENCODE_SETUP.md

# Command reference
cat QUICK_REFERENCE_OPENCODE.md

# Agent system
cat AGENTS.md
```

### 2. Create Your First Project

```powershell
# Start OpenCode or Claude Code
opencode  # or: claude

# In the terminal, type:
ng "Build a SaaS for time tracking with teams"

# Answer the Matrix questions
# @Manager will guide you through project setup
```

### 3. Explore the Templates

```powershell
# View template structure
ls "$env:ANTIGRAVITY_TEMPLATES"

# Core template files
ls "$env:ANTIGRAVITY_TEMPLATES\core"

# Agent role definitions
ls "$env:ANTIGRAVITY_TEMPLATES\roles"

# Example MCP workflows
ls "$env:ANTIGRAVITY_TEMPLATES\workflows"
```

### 4. Configure Your Workflow

```powershell
# Add cleanup alias to profile
Add-Content $PROFILE "`nSet-Alias clean-ag '$env:ANTIGRAVITY_TEMPLATES\scripts\Clean-TempFiles.ps1'"

# Reload profile
. $PROFILE

# Now you can run: clean-ag -All
```

---

## Uninstallation (If Needed)

To remove AntiGravity:

```powershell
# 1. Remove directory
Remove-Item "$env:USERPROFILE\.antigravity" -Recurse -Force

# 2. Remove environment variables
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_HOME", $null, "User")
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_TEMPLATES", $null, "User")
[Environment]::SetEnvironmentVariable("ANTIGRAVITY_PROJECTS", $null, "User")

# 3. Remove ng command from profile (manual)
notepad $PROFILE
# Delete the "NEW GENESIS" section
```

---

## Summary

**Quick Installation:**
```powershell
cd "path\to\8.2_140126\scripts"
.\Install-AntiGravity-Fixed.ps1
```

**Verification:**
```powershell
Test-Path "$env:ANTIGRAVITY_HOME"
Get-Command ng
```

**First Project:**
```powershell
opencode
ng "Your project idea"
```

**Get Help:**
```powershell
cat "$env:ANTIGRAVITY_TEMPLATES\OPENCODE_README.md"
```

---

## Support

**Documentation:**
- `OPENCODE_README.md` - Getting started
- `OPENCODE_SETUP.md` - Configuration
- `AGENTS.md` - Agent system overview
- `docs/AGENT_RULES.md` - All 15 archetypes

**Common Issues:**
- See [Troubleshooting](#troubleshooting) section above
- Check `CHANGELOG.md` for known issues

**Community:**
- GitHub Issues: (your repository URL)
- Documentation: https://opencode.ai/docs

---

**Installation Time:** 5-15 minutes
**Difficulty:** Easy
**Ready to build:** Immediately after installation! 🚀

Happy building with NEW GENESIS v8.2! 🎉
