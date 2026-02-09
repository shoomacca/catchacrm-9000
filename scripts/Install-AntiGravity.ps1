param(
    [string]$InstallPath = "$env:USERPROFILE\.antigravity",
    [switch]$SkipNgCommand,
    [switch]$Force
)

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "======================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "[->] $Text" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Text)
    Write-Host "[X] $Text" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $allGood = $true
    
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            Write-Success "Git installed: $gitVersion"
        } else {
            throw "Git not found"
        }
    } catch {
        Write-ErrorMsg "Git not found. Install from: https://git-scm.com/"
        $allGood = $false
    }
    
    try {
        $nodeVersion = node --version 2>$null
        if ($nodeVersion) {
            Write-Success "Node.js installed: $nodeVersion"
        } else {
            throw "Node not found"
        }
    } catch {
        Write-ErrorMsg "Node.js not found. Install from: https://nodejs.org/"
        $allGood = $false
    }
    
    try {
        $npmVersion = npm --version 2>$null
        if ($npmVersion) {
            Write-Success "npm installed: v$npmVersion"
        } else {
            throw "npm not found"
        }
    } catch {
        Write-ErrorMsg "npm not found. Install Node.js from: https://nodejs.org/"
        $allGood = $false
    }
    
    Write-Host ""
    return $allGood
}

function New-DirectoryStructure {
    Write-Header "Creating Directory Structure"
    
    Write-Info "Installation path: $InstallPath"
    Write-Host ""
    
    $directories = @(
        "$InstallPath",
        "$InstallPath\_MASTER_TEMPLATES",
        "$InstallPath\_MASTER_TEMPLATES\version_history",
        "$InstallPath\_MASTER_TEMPLATES\version_history\1.0_190126",
        "$InstallPath\_MASTER_TEMPLATES\core",
        "$InstallPath\_MASTER_TEMPLATES\roles",
        "$InstallPath\_MASTER_TEMPLATES\scripts",
        "$InstallPath\_MASTER_TEMPLATES\docs",
        "$InstallPath\_MASTER_TEMPLATES\workflows",
        "$InstallPath\projects"
    )
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Success "Created: $(Split-Path $dir -Leaf)"
        } else {
            Write-Info "Exists: $(Split-Path $dir -Leaf)"
        }
    }
    
    Write-Host ""
}

function Copy-TemplateFiles {
    Write-Header "Copying Template Files"
    
    $sourcePath = $PSScriptRoot
    if ($sourcePath -match "scripts$") {
        $sourcePath = Split-Path $sourcePath -Parent
    }
    
    Write-Info "Source: $sourcePath"
    Write-Info "Destination: $InstallPath"
    Write-Host ""
    
    if (-not (Test-Path $sourcePath)) {
        Write-ErrorMsg "Source path not found: $sourcePath"
        return $false
    }
    
    $destVersion = "$InstallPath\_MASTER_TEMPLATES\version_history\1.0_190126"
    try {
        Write-Info "Copying all files to version_history/8.2_140126..."
        Copy-Item -Path "$sourcePath\*" -Destination $destVersion -Recurse -Force -ErrorAction Stop
        Write-Success "Copied to: $destVersion"
    } catch {
        Write-ErrorMsg "Copy failed: $_"
        return $false
    }
    
    Write-Host ""
    Write-Info "Creating shortcuts in master templates root..."
    
    $itemsToCopy = @(
        @{Type="File"; Name="CLAUDE.md"},
        @{Type="File"; Name="README.md"},
        @{Type="File"; Name="CHANGELOG.md"},
        @{Type="File"; Name="AGENTS.md"},
        @{Type="File"; Name="OPENCODE.md"},
        @{Type="File"; Name="OPENCODE_README.md"},
        @{Type="File"; Name="OPENCODE_SETUP.md"},
        @{Type="File"; Name="QUICK_REFERENCE_OPENCODE.md"},
        @{Type="File"; Name="opencode.json"},
        @{Type="File"; Name="MCP_STATUS.md"},
        @{Type="Folder"; Name="core"},
        @{Type="Folder"; Name="roles"},
        @{Type="Folder"; Name="scripts"},
        @{Type="Folder"; Name="docs"},
        @{Type="Folder"; Name="workflows"},
        @{Type="Folder"; Name="rules"},
        @{Type="Folder"; Name="hooks"},
        @{Type="Folder"; Name="commands"},
        @{Type="Folder"; Name="skills"},
        @{Type="Folder"; Name="plugins"}
    )
    
    foreach ($item in $itemsToCopy) {
        $srcPath = Join-Path $destVersion $item.Name
        $dstPath = Join-Path "$InstallPath\_MASTER_TEMPLATES" $item.Name
        
        if (Test-Path $srcPath) {
            if ($item.Type -eq "Folder") {
                Copy-Item -Path $srcPath -Destination $dstPath -Recurse -Force -ErrorAction SilentlyContinue
            } else {
                Copy-Item -Path $srcPath -Destination $dstPath -Force -ErrorAction SilentlyContinue
            }
            Write-Success "Copied: $($item.Name)"
        }
    }
    
    Write-Host ""
    Write-Success "Template files ready!"
    return $true
}

function Install-NgCommand {
    Write-Header "Installing ng Command"
    
    if ($SkipNgCommand) {
        Write-Info "Skipping ng command installation (-SkipNgCommand flag used)"
        return
    }
    
    if (-not (Test-Path $PROFILE)) {
        Write-Info "Creating PowerShell profile: $PROFILE"
        New-Item -Path $PROFILE -ItemType File -Force | Out-Null
    }
    
    $profileContent = Get-Content $PROFILE -Raw -ErrorAction SilentlyContinue
    
    if ($profileContent -match "function New-Gravity" -and -not $Force) {
        Write-Success "ng command already installed!"
        Write-Info "Use -Force to reinstall"
        Write-Host ""
        return
    }
    
    $ngFunctionPath = "$InstallPath\_MASTER_TEMPLATES\scripts\ng-function.ps1"
    
    if (-not (Test-Path $ngFunctionPath)) {
        Write-ErrorMsg "ng-function.ps1 not found at: $ngFunctionPath"
        return
    }
    
    $ngFunction = Get-Content $ngFunctionPath -Raw
    
    Write-Info "Adding ng command to PowerShell profile..."
    Add-Content -Path $PROFILE -Value "`n`n# ============================================================================"
    Add-Content -Path $PROFILE -Value "# ANTIGRAVITY GENESIS v1.0 - Installed $(Get-Date -Format 'yyyy-MM-dd')"
    Add-Content -Path $PROFILE -Value "# ============================================================================"
    Add-Content -Path $PROFILE -Value $ngFunction
    
    Write-Success "ng command installed!"
    Write-Host ""
}

function Set-EnvironmentVariables {
    Write-Header "Setting Environment Variables"
    
    [Environment]::SetEnvironmentVariable("ANTIGRAVITY_HOME", $InstallPath, "User")
    Write-Success "ANTIGRAVITY_HOME = $InstallPath"
    
    $templatesPath = "$InstallPath\_MASTER_TEMPLATES"
    [Environment]::SetEnvironmentVariable("ANTIGRAVITY_TEMPLATES", $templatesPath, "User")
    Write-Success "ANTIGRAVITY_TEMPLATES = $templatesPath"
    
    $projectsPath = "$InstallPath\projects"
    [Environment]::SetEnvironmentVariable("ANTIGRAVITY_PROJECTS", $projectsPath, "User")
    Write-Success "ANTIGRAVITY_PROJECTS = $projectsPath"
    
    Write-Host ""
    Write-Info "Environment variables will be available in new PowerShell sessions"
    Write-Host ""
}

function Show-NextSteps {
    Write-Header "Installation Complete!"
    
    Write-Host "AntiGravity Genesis v1.0 is now installed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Installation Location:" -ForegroundColor Cyan
    Write-Host "   $InstallPath" -ForegroundColor White
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "   1. Reload PowerShell profile:" -ForegroundColor Yellow
    Write-Host "      . `$PROFILE" -ForegroundColor White
    Write-Host ""
    Write-Host "   2. Test the ng command:" -ForegroundColor Yellow
    Write-Host "      ng `"Build a SaaS for time tracking`"" -ForegroundColor White
    Write-Host ""
    Write-Host "   3. Read the documentation:" -ForegroundColor Yellow
    Write-Host "      cd `"$InstallPath\_MASTER_TEMPLATES`"" -ForegroundColor White
    Write-Host "      cat OPENCODE_README.md" -ForegroundColor White
    Write-Host ""
    Write-Host "Quick Reference:" -ForegroundColor Cyan
    Write-Host "   Templates: $InstallPath\_MASTER_TEMPLATES" -ForegroundColor White
    Write-Host "   Projects:  $InstallPath\projects" -ForegroundColor White
    Write-Host "   Version:   1.0 (Shatter Protocol)" -ForegroundColor White
    Write-Host ""
    Write-Host "Ready to build!" -ForegroundColor Green
    Write-Host ""
}

Clear-Host
Write-Host ""
Write-Host "+======================================================+" -ForegroundColor Cyan
Write-Host "|                                                      |" -ForegroundColor Cyan
Write-Host "|      ANTIGRAVITY GENESIS v1.0 INSTALLER              |" -ForegroundColor Cyan
Write-Host "|      Shatter Protocol                                |" -ForegroundColor Cyan
Write-Host "|                                                      |" -ForegroundColor Cyan
Write-Host "+======================================================+" -ForegroundColor Cyan
Write-Host ""
Write-Host "This will install AntiGravity Genesis to:" -ForegroundColor Yellow
Write-Host "  $InstallPath" -ForegroundColor White
Write-Host ""

if ((Test-Path $InstallPath) -and -not $Force) {
    Write-Host "WARNING: Installation directory already exists!" -ForegroundColor Yellow
    Write-Host ""
    $confirm = Read-Host "Continue anyway? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Installation cancelled." -ForegroundColor Gray
        exit 0
    }
}

$prereqsOk = Test-Prerequisites
if (-not $prereqsOk) {
    Write-Host ""
    Write-ErrorMsg "Prerequisites not met. Please install required software and try again."
    Write-Host ""
    Write-Host "Required software:" -ForegroundColor Yellow
    Write-Host "  - Git: https://git-scm.com/" -ForegroundColor White
    Write-Host "  - Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host ""
    exit 1
}

New-DirectoryStructure

$copySuccess = Copy-TemplateFiles
if (-not $copySuccess) {
    Write-ErrorMsg "Failed to copy template files. Installation aborted."
    exit 1
}

Install-NgCommand

Set-EnvironmentVariables

Show-NextSteps

Write-Host "Would you like to reload your PowerShell profile now?" -ForegroundColor Yellow
$reloadProfile = Read-Host "(This activates the ng command) (Y/n)"
if ($reloadProfile -ne "n" -and $reloadProfile -ne "N") {
    . $PROFILE
    Write-Success "Profile reloaded! ng command is ready."
    Write-Host ""
    Write-Host "Try it: ng `"Test project`"" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
