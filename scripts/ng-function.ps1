function New-Gravity {
    param(
        [string]$IdeaInput,
        [string]$ProjectName,
        [string]$Role = "manager"
    )

    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host "  ANTIGRAVITY GENESIS v1.0" -ForegroundColor White
    Write-Host "  Turn Ideas Into Production" -ForegroundColor Gray
    Write-Host "==================================================" -ForegroundColor Cyan
    Write-Host ""

    if ($ProjectName) {
        $ProjectPath = "$HOME\.antigravity\projects\$ProjectName"
        if (-not (Test-Path $ProjectPath)) {
            Write-Host "Error: Project '$ProjectName' not found at $ProjectPath" -ForegroundColor Red
            return
        }

        Write-Host "Continuing project: $ProjectName" -ForegroundColor Green
        Write-Host "Role: @$Role" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Select Development Environment:" -ForegroundColor White
        Write-Host "  [1] Claude Code - Sonnet 4.5 (Recommended)" -ForegroundColor Cyan
        Write-Host "  [2] OpenCode - Multi-LLM (GPT-4, Gemini, DeepSeek)" -ForegroundColor Cyan
        Write-Host ""
        $envChoice = Read-Host "Enter choice (1-2)"

        Set-Location $ProjectPath

        if ($envChoice -eq "1") {
            if (-not (Test-Path ".claudecode-config.json")) {
                $claudeConfig = @{ model = "claude-sonnet-4-5"; temperature = 0.7; maxTokens = 8000 } | ConvertTo-Json -Depth 10
                Set-Content -Path ".claudecode-config.json" -Value $claudeConfig
            }
            claude
        } else {
            if (-not (Test-Path "opencode.json")) {
                $opencodeConfig = @{ model = "openai/gpt-5.2-codex" } | ConvertTo-Json -Depth 10
                Set-Content -Path "opencode.json" -Value $opencodeConfig
            }

            if (Test-Path "ng-handoff.js") {
                Invoke-Expression "node ng-handoff.js $Role opencode"
                Start-Sleep -Seconds 2
            }

            $model = switch ($Role) {
                "manager" { "gpt-4-codex-5.2" }
                "consultant" { "gpt-4-codex-5.2" }
                "developer" { "qwen-3-next-80b" }
                "automator" { "gemini-2.0-flash-thinking" }
                default { "gpt-4-codex-5.2" }
            }

            opencode --model $model
        }
        return
    }

    Write-Host "Project: " -NoNewline -ForegroundColor White
    if ($IdeaInput) {
        Write-Host "$IdeaInput" -ForegroundColor Cyan
    } else {
        Write-Host "New Project (Interview Mode)" -ForegroundColor Cyan
    }
    Write-Host "Status: Initializing..." -ForegroundColor Gray
    Write-Host ""

    Write-Host "Select Development Environment:" -ForegroundColor White
    Write-Host "  [1] Claude Code - Sonnet 4.5 (Recommended for complex projects)" -ForegroundColor Cyan
    Write-Host "  [2] OpenCode - Multi-LLM support (GPT-4, Gemini, DeepSeek)" -ForegroundColor Cyan
    Write-Host ""
    $envChoice = Read-Host "Enter choice (1-2)"

    if ($envChoice -eq "1") {
        Write-Host "Environment: Claude Code" -ForegroundColor Green
        Write-Host "Launching Claude Code..." -ForegroundColor Yellow
        if ($IdeaInput) {
            Write-Host "  ng `"$IdeaInput`"" -ForegroundColor Cyan
        } else {
            Write-Host "  ng" -ForegroundColor Cyan
        }
        Start-Sleep -Seconds 1
        claude
    } else {
        Write-Host "Environment: OpenCode (Multi-LLM)" -ForegroundColor Green
        Write-Host "Launching OpenCode for @Manager interview..." -ForegroundColor Yellow

        $templatePath = "$HOME\.antigravity\new_genesis_pro"
        if ($IdeaInput) {
            $clipText = "ANTIGRAVITY GENESIS v1.0 - I want to build: $IdeaInput - Please act as @Manager and: 1. Read AGENT_RULES.md to classify my project 2. Read ROLE_MANAGER.md for the interview process 3. Ask me all the Matrix questions 4. Create the project folder structure 5. Fill context/BRIEF.md completely 6. Fill context/STACK.md 7. Create PLAN.md (milestones only) 8. Create shards in .antigravity/shards 9. Initialize status/progress.json 10. Run node indiana.js - IMPORTANT: Tell me the project name when done so I can cd into it."
        } else {
            $clipText = "ANTIGRAVITY GENESIS v1.0 - Please act as @Manager and: 1. Ask me what I want to build 2. Read AGENT_RULES.md to classify my project 3. Read ROLE_MANAGER.md for the interview process 4. Ask me all the Matrix questions 5. Create the project folder structure 6. Fill context/BRIEF.md completely 7. Fill context/STACK.md 8. Create PLAN.md (milestones only) 9. Create shards in .antigravity/shards 10. Initialize status/progress.json 11. Run node indiana.js - IMPORTANT: Tell me the project name when done so I can cd into it."
        }

        Set-Clipboard -Value $clipText

        $agentRules = "$HOME\.antigravity\new_genesis_pro\docs\AGENT_RULES.md"
        $roleManager = "$HOME\.antigravity\new_genesis_pro\roles\ROLE_MANAGER.md"

        opencode --model gpt-4-codex-5.2 --read $agentRules --read $roleManager
    }
}

function ng:plan {
    param([string]$ProjectName)
    if (-not $ProjectName) { Write-Host "Provide -ProjectName" -ForegroundColor Yellow; return }
    $ProjectPath = "$HOME\.antigravity\projects\$ProjectName"
    Set-Location $ProjectPath
    Write-Host "Shard planning runs via @Manager in CLI." -ForegroundColor Gray
}

function ng:execute {
    param([string]$ProjectName)
    if (-not $ProjectName) { Write-Host "Provide -ProjectName" -ForegroundColor Yellow; return }
    $ProjectPath = "$HOME\.antigravity\projects\$ProjectName"
    node "$HOME\.antigravity\new_genesis_pro\scripts\genesis.js"
}

function ng:complete {
    param([string]$ShardId, [string]$ProjectName)
    if (-not $ShardId -or -not $ProjectName) { Write-Host "Usage: ng:complete -ProjectName name -ShardId M01_01" -ForegroundColor Yellow; return }
    $ProjectPath = "$HOME\.antigravity\projects\$ProjectName"
    Set-Location $ProjectPath
    node "$HOME\.antigravity\new_genesis_pro\scripts\genesis_complete.js" $ShardId
}

function ng:worktree {
    param([string]$ShardFile, [string]$ProjectName)
    if (-not $ShardFile -or -not $ProjectName) { Write-Host "Usage: ng:worktree -ProjectName name -ShardFile M01/M01_01_SCHEMA.md" -ForegroundColor Yellow; return }
    $ProjectPath = "$HOME\.antigravity\projects\$ProjectName"
    Set-Location $ProjectPath
    node "$HOME\.antigravity\new_genesis_pro\scripts\ng-worktree.js" $ShardFile
}

function ng:worktree-merge {
    param([string]$ShardFile, [string]$ProjectName)
    if (-not $ShardFile -or -not $ProjectName) { Write-Host "Usage: ng:worktree-merge -ProjectName name -ShardFile M01/M01_01_SCHEMA.md" -ForegroundColor Yellow; return }
    $ProjectPath = "$HOME\.antigravity\projects\$ProjectName"
    Set-Location $ProjectPath
    node "$HOME\.antigravity\new_genesis_pro\scripts\ng-worktree-merge.js" $ShardFile
}

Set-Alias -Name ng -Value New-Gravity
