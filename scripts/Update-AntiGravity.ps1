# ============================================================================
# ANTIGRAVITY GENESIS v1.0 - POWERSHELL UPDATE SCRIPT
# ============================================================================
# This script replaces the old ng function with the v1.0 Shatter Protocol version
# ============================================================================

function Update-AntiGravityCommand {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  AntiGravity Genesis v1.0 - Update" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""

    if (-not (Test-Path $PROFILE)) {
        Write-Error "PowerShell profile not found at: $PROFILE"
        Write-Host "Run Install-AntiGravity.ps1 instead." -ForegroundColor Yellow
        return
    }

    Write-Host "→ Reading current profile..." -ForegroundColor Cyan
    $profileContent = Get-Content $PROFILE -Raw

    if ($profileContent -notmatch "function New-Gravity") {
        Write-Host ""
        Write-Host "✗ AntiGravity 'ng' command not found in profile!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Run Install-AntiGravity.ps1 instead." -ForegroundColor Yellow
        return
    }

    Write-Host "  ✓ Found existing ng function" -ForegroundColor Green

    $backupPath = "$PROFILE.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host ""
    Write-Host "→ Creating backup..." -ForegroundColor Cyan
    Copy-Item $PROFILE $backupPath
    Write-Host "  ✓ Backup saved to: $backupPath" -ForegroundColor Green

    $ngFunctionPath = Join-Path $PSScriptRoot "ng-function.ps1"

    if (-not (Test-Path $ngFunctionPath)) {
        Write-Error "ng-function.ps1 not found at: $ngFunctionPath"
        return
    }

    $newNgFunction = Get-Content $ngFunctionPath -Raw

    Write-Host ""
    Write-Host "→ Removing old ng function..." -ForegroundColor Cyan

    $pattern1 = "(?s)# ============================================================================\s*# ANTIGRAVITY GENESIS.*?Set-Alias -Name ng -Value New-Gravity"
    $pattern2 = "(?s)# ===.*?ANTIGRAVITY.*?Set-Alias -Name ng -Value New-Gravity"
    $pattern3 = "(?s)function New-Gravity\s*\{.*?^Set-Alias -Name ng -Value New-Gravity"

    $newContent = $profileContent

    if ($newContent -match $pattern1) {
        $newContent = $newContent -replace $pattern1, ""
        Write-Host "  ✓ Removed old function (v9+ format)" -ForegroundColor Green
    }
    elseif ($newContent -match $pattern2) {
        $newContent = $newContent -replace $pattern2, ""
        Write-Host "  ✓ Removed old function (older format)" -ForegroundColor Green
    }
    elseif ($newContent -match $pattern3) {
        $newContent = $newContent -replace $pattern3, ""
        Write-Host "  ✓ Removed old function (basic format)" -ForegroundColor Green
    }
    else {
        Write-Host "  ⚠ Could not automatically remove old function" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Manual removal required:" -ForegroundColor Yellow
        Write-Host "  1. Open: $PROFILE" -ForegroundColor White
        Write-Host "  2. Delete the 'function New-Gravity' section" -ForegroundColor White
        Write-Host "  3. Re-run this script" -ForegroundColor White
        Write-Host ""
        Write-Host "Your backup is safe at: $backupPath" -ForegroundColor Gray
        return
    }

    Write-Host ""
    Write-Host "→ Adding new v1.0 function..." -ForegroundColor Cyan

    $newContent = $newContent.TrimEnd() + "`n`n"
    $newContent += "# ============================================================================`n"
    $newContent += "# ANTIGRAVITY GENESIS v1.0 - Updated on $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n"
    $newContent += "# ============================================================================`n"
    $newContent += $newNgFunction

    Set-Content -Path $PROFILE -Value $newContent

    Write-Host "  ✓ New function added" -ForegroundColor Green

    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  ✓ UPDATE COMPLETE!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "To activate the new function, run:" -ForegroundColor Yellow
    Write-Host "  . `$PROFILE" -ForegroundColor White
    Write-Host ""
    Write-Host "Or restart PowerShell." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Your old profile was backed up to:" -ForegroundColor Gray
    Write-Host "  $backupPath" -ForegroundColor White
    Write-Host ""
}

Update-AntiGravityCommand
