# Chronos - Genesis Autonomous Scheduler

**Version:** 1.1
**File:** `scripts/chronos.js`
**Purpose:** Time-based orchestration of Genesis workflow

---

## Overview

Chronos is the autonomous scheduler that runs your Genesis team on a daily schedule:

- **09:00 AM** - ARCHITECT mode (Planning & Review)
- **10:00 AM** - BUILDER mode (Execution Loop)
- **06:00 PM** - End of Day (Cleanup & Summary)

**Use case:** Set it and forget it. Chronos runs your development team autonomously, executing shards during business hours and stopping at end of day.

---

## How It Works

### Daily Workflow

```
09:00 - ARCHITECT MODE
  ↓
  Chronos spawns: node genesis.js --mode=ARCHITECT --review-only
  ↓
  Genesis reviews current status:
  - Lists pending shards
  - Shows next 5 shards to execute
  - Reports any failed shards
  ↓
  Exits (no execution, just planning)

10:00 - BUILDER MODE
  ↓
  Chronos kills ARCHITECT (if still running)
  Chronos spawns: node genesis.js --mode=BUILDER
  ↓
  Genesis executes shards:
  - Agents call start_shard → Linear "In Progress"
  - Agents build features
  - Agents call complete_shard → Linear "Done"
  - Continues until 6pm or all shards complete
  ↓
  Runs until 18:00 (or earlier if complete)

18:00 - END OF DAY
  ↓
  Chronos kills all running processes
  Generates daily summary report
  System enters standby mode
  ↓
  Waits until 09:00 next day
```

---

## Installation

### 1. Install Dependencies

```bash
cd C:/Users/Corsa/.antigravity/new_genesis
npm install
```

This installs `node-schedule` dependency.

---

### 2. Configure Schedule (Optional)

Default schedule:
- ARCHITECT: 09:00 AM daily
- BUILDER: 10:00 AM daily
- EOD: 06:00 PM daily

**To customize:**

```bash
# Set custom times via environment variables
export CHRONOS_ARCHITECT_TIME="0 8 * * *"   # 8:00 AM
export CHRONOS_BUILDER_TIME="0 9 * * *"     # 9:00 AM
export CHRONOS_EOD_TIME="0 17 * * *"        # 5:00 PM

# Or edit chronos.js directly:
const ARCHITECT_TIME = '0 9 * * *'; // Cron format
```

**Cron format:**
```
┌───────────── minute (0 - 59)
│ ┌───────────── hour (0 - 23)
│ │ ┌───────────── day of month (1 - 31)
│ │ │ ┌───────────── month (1 - 12)
│ │ │ │ ┌───────────── day of week (0 - 6)
│ │ │ │ │
* * * * *

Examples:
0 9 * * *        - Every day at 9:00 AM
0 9 * * 1-5      - Weekdays only at 9:00 AM
30 10 * * *      - Every day at 10:30 AM
0 18 * * 1,3,5   - Monday, Wednesday, Friday at 6:00 PM
```

---

## Usage

### Start Chronos (Daemon Mode)

```bash
# Start and keep running
node scripts/chronos.js

# Or use npm script
npm run chronos
```

**Output:**
```
╔═══════════════════════════════════════════════════════════════════╗
║                         CHRONOS v1.1                              ║
║              Genesis Autonomous Scheduler                         ║
╚═══════════════════════════════════════════════════════════════════╝

📅 Scheduled Jobs:
   09:00 - ARCHITECT mode (Planning & Review)
   10:00 - BUILDER mode (Execution Loop)
   18:00 - End of Day (Cleanup & Summary)

🚀 Chronos starting...
   Mode: SCHEDULED
   Log directory: .antigravity/logs
   PID file: .antigravity/chronos.pid

✅ Chronos is now running. Press Ctrl+C to stop.

📊 Next scheduled events:
   ARCHITECT: 2026-01-22 9:00
   BUILDER: 2026-01-22 10:00
   EOD: 2026-01-22 18:00
```

Chronos will now run in the background until you stop it.

---

### Run Once (Test Mode)

```bash
# Execute all phases immediately (for testing)
node scripts/chronos.js --once

# Or use npm script
npm run chronos:once
```

**What happens:**
1. ARCHITECT mode runs immediately
2. 5 seconds later, BUILDER mode runs
3. 10 seconds later, End of Day runs
4. Chronos exits

**Use case:** Testing the workflow without waiting for scheduled times.

---

### Dry Run (Preview Mode)

```bash
# Show what would happen without actually doing it
node scripts/chronos.js --dry-run

# Or use npm script
npm run chronos:dry
```

**What happens:**
- Chronos schedules jobs
- Logs what it would do at each time
- Doesn't spawn actual processes
- Useful for testing schedule configuration

---

### Stop Chronos

**Method 1: Ctrl+C**
```bash
# In the terminal running Chronos
Press Ctrl+C
```

**Method 2: Kill by PID**
```bash
# Find PID
cat .antigravity/chronos.pid

# Kill process
kill <PID>
```

**Method 3: Kill by name**
```bash
# Unix/Mac
pkill -f chronos.js

# Windows
taskkill /IM node.exe /F
```

**Graceful shutdown:**
- Chronos catches SIGINT/SIGTERM
- Kills all active Genesis processes
- Cleans up PID file
- Exits cleanly

---

## Modes Explained

### ARCHITECT Mode (09:00)

**Purpose:** Review progress and plan next steps

**Command:** `node genesis.js --mode=ARCHITECT --review-only`

**What it does:**
```
╔═══════════════════════════════════════════════════════════════════╗
║                    ARCHITECT MODE - 09:00                         ║
║                 Planning & Review Phase                           ║
╚═══════════════════════════════════════════════════════════════════╝

📋 ARCHITECT MODE - Review Only

📊 Current Status:
   Pending shards: 23
   Completed shards: 12
   Failed shards: 0

📝 Next 5 shards to execute:
   1. M03/M03_01_API.md
   2. M03/M03_02_UI.md
   3. M03/M03_03_TESTS.md
   4. M04/M04_01_DEPLOY.md
   5. M04/M04_02_MONITOR.md

✅ ARCHITECT review complete
   To execute: Run genesis.js without --mode or --review-only
```

**Benefits:**
- Quick morning overview of project status
- See what's coming next
- Identify blockers before execution starts
- Human can intervene if needed

---

### BUILDER Mode (10:00)

**Purpose:** Execute pending shards autonomously

**Command:** `node genesis.js --mode=BUILDER`

**What it does:**
- Normal Genesis execution
- Spawns agents with MCP Gateway
- Executes shards sequentially
- Updates Linear in real-time
- Triggers Scribe on milestone completion
- Runs until all shards complete or 6pm (whichever comes first)

**Output:**
```
╔═══════════════════════════════════════════════════════════════════╗
║                    BUILDER MODE - 10:00                           ║
║                 Execution Phase                                   ║
╚═══════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════╗
║                    GENESIS ORCHESTRATOR v1.1                      ║
║                     BUILDER (Execution)                           ║
╚═══════════════════════════════════════════════════════════════════╝

[Normal Genesis execution starts]
[Agents execute shards throughout the day]
[Continues until 6pm or completion]
```

---

### End of Day (18:00)

**Purpose:** Graceful shutdown and summary generation

**What it does:**
1. Kills all running Genesis/agent processes
2. Generates daily summary report
3. Saves to `.antigravity/logs/daily_summary_YYYY-MM-DD.md`
4. System enters standby mode
5. Waits until next morning (9am)

**Output:**
```
╔═══════════════════════════════════════════════════════════════════╗
║                    END OF DAY - 18:00                             ║
║                 Cleanup & Summary                                 ║
╚═══════════════════════════════════════════════════════════════════╝

🛑 Killing all active Genesis processes...
✅ Killed 1 process(es)

📊 Generating daily summary...
✅ Daily summary saved to: .antigravity/logs/daily_summary_2026-01-22.md

✅ End of Day complete. System in standby until tomorrow.
```

---

## Logging

### Log Directory

All logs saved to: `.antigravity/logs/`

**Structure:**
```
.antigravity/logs/
├── chronos_2026-01-22.log              # Chronos scheduler log
├── genesis_architect_2026-01-22T09-00-00.log  # ARCHITECT mode log
├── genesis_builder_2026-01-22T10-00-00.log    # BUILDER mode log
└── daily_summary_2026-01-22.md         # End of day summary
```

---

### Log Format

**Chronos log:**
```
[2026-01-22T09:00:00.000Z] [INFO] ⏰ ARCHITECT time triggered
[2026-01-22T09:00:02.123Z] [INFO] 🚀 Spawning Genesis in ARCHITECT mode...
[2026-01-22T09:00:02.456Z] [INFO] ✅ Genesis ARCHITECT spawned (PID: 12345)
[2026-01-22T09:00:15.789Z] [INFO] ✅ Genesis ARCHITECT completed successfully
[2026-01-22T10:00:00.000Z] [INFO] ⏰ BUILDER time triggered
[2026-01-22T10:00:02.123Z] [INFO] 🚀 Spawning Genesis in BUILDER mode...
```

---

### Daily Summary

**File:** `.antigravity/logs/daily_summary_2026-01-22.md`

```markdown
# Genesis Daily Summary - 1/22/2026

## Sessions

### ARCHITECT (09:00)
- Planning and review phase
- Status: Complete
- Duration: 15 seconds

### BUILDER (10:00)
- Execution phase
- Status: Running
- Shards completed: 12
- Duration: 8 hours

### End of Day (18:00)
- All processes stopped
- Summary generated

## Logs
- Log directory: .antigravity/logs
- Check individual session logs for details

---
Generated by Chronos at 2026-01-22T18:00:05.123Z
```

---

## Process Management

### PID File

Chronos creates: `.antigravity/chronos.pid`

**Purpose:**
- Prevent multiple Chronos instances
- Allow external scripts to find Chronos
- Enable monitoring and control

**Usage:**
```bash
# Check if Chronos is running
if [ -f .antigravity/chronos.pid ]; then
  PID=$(cat .antigravity/chronos.pid)
  if kill -0 $PID 2>/dev/null; then
    echo "Chronos is running (PID: $PID)"
  else
    echo "Stale PID file, Chronos not running"
  fi
fi

# Stop Chronos from script
if [ -f .antigravity/chronos.pid ]; then
  kill $(cat .antigravity/chronos.pid)
fi
```

---

### Active Process Tracking

Chronos tracks all spawned processes:

```javascript
activeProcesses = {
  12345: {
    type: 'ARCHITECT',
    startTime: '2026-01-22T09:00:00Z',
    logFile: '.antigravity/logs/genesis_architect_...',
    process: <ChildProcess>
  },
  12346: {
    type: 'BUILDER',
    startTime: '2026-01-22T10:00:00Z',
    logFile: '.antigravity/logs/genesis_builder_...',
    process: <ChildProcess>
  }
}
```

**On End of Day:**
- Sends SIGTERM to all processes
- Waits 5 seconds
- Sends SIGKILL if still running
- Clears tracking map

---

## Error Handling

### Genesis Process Fails

**Scenario:** BUILDER mode crashes at 2pm

**What happens:**
```
[14:23:45] [ERROR] ❌ Genesis BUILDER exited with code 1

[Chronos logs error but continues running]
[Next day at 10am, BUILDER mode tries again]
```

**Behavior:**
- Chronos logs the error
- Does NOT retry automatically
- Waits until next scheduled time
- Human can check logs and fix issue

---

### Chronos Crashes

**Scenario:** Chronos process crashes

**Recovery:**
```bash
# Chronos isn't running, restart it
node scripts/chronos.js
```

**Prevention:**
- Chronos has try/catch around all operations
- Graceful shutdown on signals
- PID file prevents multiple instances

---

### System Reboot

**Scenario:** Server/machine reboots

**What happens:**
- Chronos stops (not daemonized)
- PID file becomes stale
- Genesis processes killed by OS

**Recovery:**
```bash
# Remove stale PID file (if exists)
rm .antigravity/chronos.pid

# Restart Chronos
node scripts/chronos.js
```

**TODO (future):**
- Add systemd service file
- Add auto-restart on reboot
- Add process monitoring

---

## Integration with v1.1

### Chronos + The Hands + The Engine + The Scribe

```
Chronos (Scheduler)
  ↓
  09:00 - Spawns Genesis in ARCHITECT mode
    ↓
    Genesis reviews status (no MCP tools used)
    ↓
    Exits
  ↓
  10:00 - Spawns Genesis in BUILDER mode
    ↓
    Genesis loads shards
    ↓
    For each shard:
      ↓
      Spawns agent with MCP Gateway attached
      ↓
      Agent calls start_shard → Linear "In Progress"
      ↓
      Agent executes work
      ↓
      Agent calls complete_shard → Linear "Done"
    ↓
    When milestone completes:
      ↓
      Scribe auto-triggers
      ↓
      Reads git log
      ↓
      Calls LLM to summarize
      ↓
      Posts to Slack/Telegram
  ↓
  18:00 - End of Day
    ↓
    Kills all processes
    ↓
    Generates summary
```

**Result:** Fully autonomous development team that:
- Plans at 9am
- Executes 10am-6pm
- Updates Linear in real-time
- Posts release notes to Slack
- Stops at 6pm
- Repeats daily

---

## Production Deployment

### Run as Background Service (Unix/Mac)

**Using nohup:**
```bash
nohup node scripts/chronos.js > chronos.out 2>&1 &
echo $! > chronos_bg.pid
```

**Using screen:**
```bash
screen -S chronos
node scripts/chronos.js
# Press Ctrl+A, then D to detach
```

**Using tmux:**
```bash
tmux new -s chronos
node scripts/chronos.js
# Press Ctrl+B, then D to detach
```

---

### Run as Systemd Service (Linux)

**Create service file:** `/etc/systemd/system/chronos.service`

```ini
[Unit]
Description=Genesis Chronos Scheduler
After=network.target

[Service]
Type=simple
User=youruser
WorkingDirectory=/home/youruser/projects/your-project
ExecStart=/usr/bin/node /home/youruser/.antigravity/new_genesis/scripts/chronos.js
Restart=on-failure
RestartSec=10
StandardOutput=append:/var/log/chronos.log
StandardError=append:/var/log/chronos.error.log

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable chronos
sudo systemctl start chronos

# Check status
sudo systemctl status chronos

# View logs
sudo journalctl -u chronos -f
```

---

### Run as Windows Service

**Using node-windows:**

```bash
npm install -g node-windows

# Create service installer
node-windows install chronos.js

# Start service
net start "Genesis Chronos"
```

---

## Testing

### Test 1: Dry Run

```bash
node scripts/chronos.js --dry-run
```

**Expected:**
```
╔═══════════════════════════════════════════════════════════════════╗
║                         CHRONOS v1.1                              ║
║              Genesis Autonomous Scheduler                         ║
╚═══════════════════════════════════════════════════════════════════╝

📅 Scheduled Jobs:
   09:00 - ARCHITECT mode (Planning & Review)
   10:00 - BUILDER mode (Execution Loop)
   18:00 - End of Day (Cleanup & Summary)

⚠️  DRY RUN MODE - No processes will be spawned

[Chronos runs but doesn't spawn processes]
```

---

### Test 2: Run Once

```bash
node scripts/chronos.js --once
```

**Expected:**
```
[ARCHITECT mode runs]
[5 seconds later, BUILDER mode runs]
[10 seconds later, End of Day runs]
[Chronos exits]
```

---

### Test 3: Manual Test Script

```bash
node scripts/test-chronos.js
```

Runs `--once` mode with countdown timer.

---

## Troubleshooting

### "Chronos is already running"

**Problem:** Another Chronos instance exists

**Solution:**
```bash
# Check PID
cat .antigravity/chronos.pid

# Kill it
kill $(cat .antigravity/chronos.pid)

# Or remove stale PID file
rm .antigravity/chronos.pid

# Restart
node scripts/chronos.js
```

---

### Processes not being killed at EOD

**Problem:** Genesis processes survive 6pm shutdown

**Solution:**
- Check logs: `.antigravity/logs/chronos_*.log`
- Verify Chronos has permission to kill processes
- Manually kill: `pkill -f genesis.js`

---

### Schedule not triggering

**Problem:** 9am arrives, nothing happens

**Solution:**
- Check Chronos is still running: `ps aux | grep chronos`
- Check system time is correct: `date`
- Check cron format: `0 9 * * *` means 9:00 AM
- Check logs for errors

---

## Advanced Configuration

### Custom Schedule (Weekdays Only)

```javascript
// In chronos.js, change:
const ARCHITECT_TIME = '0 9 * * 1-5';  // Monday-Friday only
const BUILDER_TIME = '0 10 * * 1-5';
const EOD_TIME = '0 18 * * 1-5';
```

---

### Multiple Sessions Per Day

```javascript
// Morning session
const MORNING_ARCHITECT = '0 9 * * *';
const MORNING_BUILDER = '0 10 * * *';

// Afternoon session
const AFTERNOON_ARCHITECT = '0 14 * * *';
const AFTERNOON_BUILDER = '0 15 * * *';

// EOD
const EOD_TIME = '0 18 * * *';
```

---

### Environment-Specific Schedules

```bash
# Development (fast cycles)
export CHRONOS_ARCHITECT_TIME="*/30 * * * *"  # Every 30 minutes
export CHRONOS_BUILDER_TIME="*/30 * * * *"    # Continuous
export CHRONOS_EOD_TIME="0 17 * * *"          # 5pm

# Production (once daily)
export CHRONOS_ARCHITECT_TIME="0 9 * * *"     # 9am
export CHRONOS_BUILDER_TIME="0 10 * * *"      # 10am
export CHRONOS_EOD_TIME="0 18 * * *"          # 6pm
```

---

## Success Criteria

Chronos is working correctly when:

- ✅ Starts without errors
- ✅ Creates PID file
- ✅ ARCHITECT mode runs at 9am
- ✅ BUILDER mode runs at 10am
- ✅ End of Day runs at 6pm
- ✅ Processes are killed cleanly
- ✅ Logs are generated
- ✅ Daily summary created
- ✅ Graceful shutdown on Ctrl+C

---

**CHRONOS v1.1** - Autonomous scheduling for Genesis.

**Key Innovation:** Set it once, runs forever. Your AI team works business hours automatically.
