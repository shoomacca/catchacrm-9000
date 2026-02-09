# ============================================================================
# ANTIGRAVITY GENESIS - TEMP FILE CLEANER
# ============================================================================
# Removes temporary Claude files (tmpclaude-*) from the system
# Version: 8.2
# Last Updated: 2026-01-14
# ============================================================================

param(
    [string]$Path,
    [switch]$DryRun,
    [switch]$Recursive,
    [switch]$All
)

function Write-Header {
    param([string]$Text)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Success {
    param([string]$Text)
    Write-Host "✓ $Text" -ForegroundColor Green
}

function Write-Info {
    param([string]$Text)
    Write-Host "→ $Text" -ForegroundColor Yellow
}

function Write-Warning-Custom {
    param([string]$Text)
    Write-Host "⚠ $Text" -ForegroundColor Yellow
}

function Get-TempClaudeFiles {
    param(
        [string]$SearchPath,
        [bool]$SearchRecursive
    )
    
    if ($SearchRecursive) {
        return Get-ChildItem -Path $SearchPath -Filter "tmpclaude-*" -Recurse -File -ErrorAction SilentlyContinue
    } else {
        return Get-ChildItem -Path $SearchPath -Filter "tmpclaude-*" -File -ErrorAction SilentlyContinue
    }
}

function Remove-TempFiles {
    param(
        [string]$SearchPath,
        [bool]$IsDryRun,
        [bool]$IsRecursive
    )
    
    Write-Info "Searching for temp Claude files in: $SearchPath"
    if ($IsRecursive) {
        Write-Info "Recursive search enabled"
    }
    Write-Host ""
    
    $tempFiles = Get-TempClaudeFiles -SearchPath $SearchPath -SearchRecursive $IsRecursive
    
    if ($tempFiles.Count -eq 0) {
        Write-Success "No temp Claude files found! Directory is clean."
        return 0
    }
    
    Write-Warning-Custom "Found $($tempFiles.Count) temp Claude file(s):"
    Write-Host ""
    
    $totalSize = 0
    foreach ($file in $tempFiles) {
        $size = $file.Length
        $totalSize += $size
        $sizeKB = [math]::Round($size / 1KB, 2)
        Write-Host "  • $($file.FullName) ($sizeKB KB)" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "Total size: $([math]::Round($totalSize / 1KB, 2)) KB" -ForegroundColor Cyan
    Write-Host ""
    
    if ($IsDryRun) {
        Write-Info "DRY RUN - No files will be deleted"
        Write-Info "Run without -DryRun flag to actually delete these files"
        return $tempFiles.Count
    }
    
    # Confirm deletion
    $confirm = Read-Host "Delete these $($tempFiles.Count) file(s)? (Y/n)"
    if ($confirm -eq "n" -or $confirm -eq "N") {
        Write-Info "Deletion cancelled"
        return 0
    }
    
    # Delete files
    $deleted = 0
    foreach ($file in $tempFiles) {
        try {
            Remove-Item -Path $file.FullName -Force
            Write-Success "Deleted: $($file.Name)"
            $deleted++
        } catch {
            Write-Host "✗ Failed to delete: $($file.Name) - $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Success "Deleted $deleted of $($tempFiles.Count) file(s)"
    
    return $deleted
}

function Clean-AntiGravitySystem {
    Write-Header "AntiGravity Temp File Cleaner"
    
    $antigravityHome = $env:ANTIGRAVITY_HOME
    if (-not $antigravityHome -or -not (Test-Path $antigravityHome)) {
        $antigravityHome = "$env:USERPROFILE\.antigravity"
    }
    
    Write-Info "AntiGravity Home: $antigravityHome"
    Write-Host ""
    
    $searchPaths = @(
        "$antigravityHome\_MASTER_TEMPLATES\version_history\8.2_140126",
        "$antigravityHome\projects"
    )
    
    $totalDeleted = 0
    
    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            Write-Host "Cleaning: $searchPath" -ForegroundColor Cyan
            $deleted = Remove-TempFiles -SearchPath $searchPath -IsDryRun $DryRun -IsRecursive $true
            $totalDeleted += $deleted
            Write-Host ""
        }
    }
    
    if ($totalDeleted -eq 0 -and -not $DryRun) {
        Write-Success "System is clean! No temp files found."
    } else {
        Write-Success "Cleanup complete! Total files processed: $totalDeleted"
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ANTIGRAVITY TEMP FILE CLEANER           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Determine what to clean
if ($Path) {
    # Clean specific path
    if (-not (Test-Path $Path)) {
        Write-Host "✗ Path not found: $Path" -ForegroundColor Red
        exit 1
    }
    
    Write-Header "Cleaning Specific Path"
    Remove-TempFiles -SearchPath $Path -IsDryRun $DryRun -IsRecursive $Recursive
    
} elseif ($All) {
    # Clean entire AntiGravity system
    Clean-AntiGravitySystem
    
} else {
    # Clean current directory
    Write-Header "Cleaning Current Directory"
    Remove-TempFiles -SearchPath (Get-Location) -IsDryRun $DryRun -IsRecursive $Recursive
}

Write-Host ""
Write-Info "Tip: Add -DryRun flag to preview without deleting"
Write-Info "Tip: Add -Recursive flag to search subdirectories"
Write-Info "Tip: Add -All flag to clean entire AntiGravity system"
Write-Host ""

# ============================================================================
# USAGE EXAMPLES
# ============================================================================
<#
.SYNOPSIS
    Removes temporary Claude files (tmpclaude-*) from AntiGravity system

.DESCRIPTION
    This script finds and removes temporary files created by Claude Code
    that sometimes get left behind in the AntiGravity directory structure.

.PARAMETER Path
    Specific path to clean. If not specified, cleans current directory.

.PARAMETER DryRun
    Preview what would be deleted without actually deleting.

.PARAMETER Recursive
    Search subdirectories recursively.

.PARAMETER All
    Clean entire AntiGravity system (templates + projects).

.EXAMPLE
    # Preview temp files in current directory
    .\Clean-TempFiles.ps1 -DryRun

.EXAMPLE
    # Clean current directory
    .\Clean-TempFiles.ps1

.EXAMPLE
    # Clean current directory and subdirectories
    .\Clean-TempFiles.ps1 -Recursive

.EXAMPLE
    # Clean specific path
    .\Clean-TempFiles.ps1 -Path "C:\Users\Corse\.antigravity\_MASTER_TEMPLATES"

.EXAMPLE
    # Clean entire AntiGravity system
    .\Clean-TempFiles.ps1 -All

.EXAMPLE
    # Preview cleaning entire system (safe)
    .\Clean-TempFiles.ps1 -All -DryRun

.NOTES
    Version: 8.2
    Safe to run - always confirms before deleting
#>
