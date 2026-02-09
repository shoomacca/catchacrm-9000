
/**
 * CHRONOS - Genesis Autonomous Scheduler
 *
 * Purpose: Time-based orchestration of Genesis workflow
 * Schedule:
 *   09:00 - ARCHITECT mode (Planning & Review)
 *   10:00 - BUILDER mode (Execution Loop)
 *   18:00 - End of Day (Kill processes, generate reports)
 *
 * Usage:
 *   node scripts/chronos.js
 *   node scripts/chronos.js --dry-run
 *   node scripts/chronos.js --once (run all phases immediately)
 */

const schedule = require('node-schedule');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
const GENESIS_SCRIPT = path.resolve(__dirname, 'genesis.js');
const SCRIBE_SCRIPT = path.resolve(__dirname, 'scribe.js');
const LOG_DIR = path.join(__dirname, '..', '.antigravity', 'logs');
const PID_FILE = path.join(__dirname, '..', '.antigravity', 'chronos.pid');

// Schedule times (24-hour format)
const ARCHITECT_TIME = process.env.CHRONOS_ARCHITECT_TIME || '0 9 * * *'; // 9:00 AM daily
const BUILDER_TIME = process.env.CHRONOS_BUILDER_TIME || '0 10 * * *'; // 10:00 AM daily
const EOD_TIME = process.env.CHRONOS_EOD_TIME || '0 18 * * *'; // 6:00 PM daily

// Modes
const DRY_RUN = process.argv.includes('--dry-run');
const RUN_ONCE = process.argv.includes('--once');
// ---------------------

let activeProcesses = new Map(); // pid -> { type, startTime, logFile }

function ensureDirExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function log(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}`;
  console.log(logMessage);

  // Write to log file
  ensureDirExists(LOG_DIR);
  const logFile = path.join(LOG_DIR, `chronos_${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logMessage + '\n');
}

function savePid() {
  ensureDirExists(path.dirname(PID_FILE));
  fs.writeFileSync(PID_FILE, process.pid.toString());
  log(`Chronos started with PID ${process.pid}`);
}

function removePid() {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

function getRunningProcesses() {
  const pids = Array.from(activeProcesses.keys());
  return pids;
}

function killProcess(pid, signal = 'SIGTERM') {
  try {
    process.kill(pid, signal);
    log(`Sent ${signal} to process ${pid}`);
    return true;
  } catch (error) {
    log(`Failed to kill process ${pid}: ${error.message}`, 'WARN');
    return false;
  }
}

function killAllProcesses() {
  log('🛑 Killing all active Genesis processes...');

  const pids = getRunningProcesses();

  if (pids.length === 0) {
    log('No active processes to kill');
    return;
  }

  pids.forEach((pid) => {
    const info = activeProcesses.get(pid);
    log(`Killing ${info.type} process (PID: ${pid})`);

    killProcess(pid, 'SIGTERM');

    // Force kill after 5 seconds if still running
    setTimeout(() => {
      try {
        process.kill(pid, 0); // Check if process still exists
        log(`Process ${pid} still running, sending SIGKILL`, 'WARN');
        killProcess(pid, 'SIGKILL');
      } catch {
        // Process already dead
      }
    }, 5000);

    activeProcesses.delete(pid);
  });

  log(`✅ Killed ${pids.length} process(es)`);
}

function spawnGenesis(mode, args = []) {
  const logFile = path.join(
    LOG_DIR,
    `genesis_${mode.toLowerCase()}_${new Date().toISOString().replace(/:/g, '-')}.log`
  );

  log(`🚀 Spawning Genesis in ${mode} mode...`);
  log(`   Log file: ${logFile}`);

  if (DRY_RUN) {
    log('[DRY RUN] Would spawn: node genesis.js --mode=' + mode, 'INFO');
    return;
  }

  const genesisArgs = ['--mode', mode, ...args];
  const genesisProcess = spawn('node', [GENESIS_SCRIPT, ...genesisArgs], {
    cwd: path.dirname(GENESIS_SCRIPT),
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  const logStream = fs.createWriteStream(logFile, { flags: 'a' });

  genesisProcess.stdout.pipe(logStream);
  genesisProcess.stderr.pipe(logStream);

  genesisProcess.stdout.on('data', (data) => {
    process.stdout.write(`[${mode}] ${data}`);
  });

  genesisProcess.stderr.on('data', (data) => {
    process.stderr.write(`[${mode}] ${data}`);
  });

  activeProcesses.set(genesisProcess.pid, {
    type: mode,
    startTime: new Date(),
    logFile,
    process: genesisProcess
  });

  genesisProcess.on('exit', (code) => {
    activeProcesses.delete(genesisProcess.pid);

    if (code === 0) {
      log(`✅ Genesis ${mode} completed successfully`);
    } else {
      log(`❌ Genesis ${mode} exited with code ${code}`, 'ERROR');
    }
  });

  genesisProcess.on('error', (error) => {
    log(`❌ Genesis ${mode} error: ${error.message}`, 'ERROR');
    activeProcesses.delete(genesisProcess.pid);
  });

  log(`✅ Genesis ${mode} spawned (PID: ${genesisProcess.pid})`);
}

function generateDailySummary() {
  log('📊 Generating daily summary...');

  const summaryFile = path.join(
    LOG_DIR,
    `daily_summary_${new Date().toISOString().split('T')[0]}.md`
  );

  const summary = `# Genesis Daily Summary - ${new Date().toLocaleDateString()}

## Sessions

### ARCHITECT (09:00)
- Planning and review phase
- Status: [Check logs]

### BUILDER (10:00)
- Execution phase
- Status: [Check logs]

### End of Day (18:00)
- All processes stopped
- Summary generated

## Logs
- Log directory: ${LOG_DIR}
- Check individual session logs for details

---
Generated by Chronos at ${new Date().toISOString()}
`;

  fs.writeFileSync(summaryFile, summary);
  log(`✅ Daily summary saved to: ${summaryFile}`);
}

// ============================================================================
//                            SCHEDULED JOBS
// ============================================================================

function scheduleArchitectMode() {
  log(`📅 Scheduling ARCHITECT mode for ${ARCHITECT_TIME}`);

  if (RUN_ONCE) {
    runArchitectMode();
    return;
  }

  schedule.scheduleJob(ARCHITECT_TIME, () => {
    log('⏰ ARCHITECT time triggered');
    runArchitectMode();
  });
}

function scheduleBuilderMode() {
  log(`📅 Scheduling BUILDER mode for ${BUILDER_TIME}`);

  if (RUN_ONCE) {
    setTimeout(() => runBuilderMode(), 5000); // 5 seconds after architect
    return;
  }

  schedule.scheduleJob(BUILDER_TIME, () => {
    log('⏰ BUILDER time triggered');
    runBuilderMode();
  });
}

function scheduleEndOfDay() {
  log(`📅 Scheduling End of Day for ${EOD_TIME}`);

  if (RUN_ONCE) {
    setTimeout(() => runEndOfDay(), 10000); // 10 seconds after builder
    return;
  }

  schedule.scheduleJob(EOD_TIME, () => {
    log('⏰ End of Day triggered');
    runEndOfDay();
  });
}

// ============================================================================
//                            MODE EXECUTORS
// ============================================================================

function runArchitectMode() {
  log('╔═══════════════════════════════════════════════════════════════════╗');
  log('║                    ARCHITECT MODE - 09:00                         ║');
  log('║                 Planning & Review Phase                           ║');
  log('╚═══════════════════════════════════════════════════════════════════╝');

  // Kill any existing processes first
  killAllProcesses();

  // Wait for cleanup
  setTimeout(() => {
    // ARCHITECT mode: Review progress, plan next steps
    // Run genesis.js in review mode (doesn't execute, just reports)
    spawnGenesis('ARCHITECT', ['--review-only']);
  }, 2000);
}

function runBuilderMode() {
  log('╔═══════════════════════════════════════════════════════════════════╗');
  log('║                    BUILDER MODE - 10:00                           ║');
  log('║                 Execution Phase                                   ║');
  log('╚═══════════════════════════════════════════════════════════════════╝');

  // Kill any existing ARCHITECT processes
  killAllProcesses();

  // Wait for cleanup
  setTimeout(() => {
    // BUILDER mode: Execute pending shards
    // Run genesis.js in normal execution mode
    spawnGenesis('BUILDER');
  }, 2000);
}

function runEndOfDay() {
  log('╔═══════════════════════════════════════════════════════════════════╗');
  log('║                    END OF DAY - 18:00                             ║');
  log('║                 Cleanup & Summary                                 ║');
  log('╚═══════════════════════════════════════════════════════════════════╝');

  // Kill all running processes
  killAllProcesses();

  // Generate daily summary
  setTimeout(() => {
    generateDailySummary();
    log('✅ End of Day complete. System in standby until tomorrow.');

    if (RUN_ONCE) {
      log('🏁 Run-once mode complete. Exiting...');
      setTimeout(() => {
        removePid();
        process.exit(0);
      }, 1000);
    }
  }, 3000);
}

// ============================================================================
//                            MAIN EXECUTION
// ============================================================================

function displayBanner() {
  console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║                         CHRONOS v1.1                              ║');
  console.log('║              Genesis Autonomous Scheduler                         ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝\n');
}

function displaySchedule() {
  console.log('📅 Scheduled Jobs:');
  console.log(`   09:00 - ARCHITECT mode (Planning & Review)`);
  console.log(`   10:00 - BUILDER mode (Execution Loop)`);
  console.log(`   18:00 - End of Day (Cleanup & Summary)`);
  console.log('');

  if (DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No processes will be spawned\n');
  }

  if (RUN_ONCE) {
    console.log('⚡ RUN ONCE MODE - All phases will execute immediately\n');
  }
}

function setupGracefulShutdown() {
  const shutdown = (signal) => {
    log(`\n⚠️  Received ${signal}, shutting down gracefully...`);
    killAllProcesses();

    setTimeout(() => {
      log('✅ Chronos shutdown complete');
      removePid();
      process.exit(0);
    }, 2000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

function checkExistingInstance() {
  if (fs.existsSync(PID_FILE)) {
    const existingPid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));

    try {
      process.kill(existingPid, 0); // Check if process exists
      log(`❌ Chronos is already running (PID: ${existingPid})`, 'ERROR');
      log('   To stop it: kill ${existingPid}');
      log('   Or remove: ${PID_FILE}');
      process.exit(1);
    } catch {
      // Process doesn't exist, remove stale PID file
      log('⚠️  Removing stale PID file', 'WARN');
      removePid();
    }
  }
}

async function main() {
  displayBanner();

  if (!RUN_ONCE) {
    checkExistingInstance();
  }

  ensureDirExists(LOG_DIR);
  savePid();
  setupGracefulShutdown();

  log('🚀 Chronos starting...');
  log(`   Mode: ${DRY_RUN ? 'DRY RUN' : RUN_ONCE ? 'RUN ONCE' : 'SCHEDULED'}`);
  log(`   Log directory: ${LOG_DIR}`);
  log(`   PID file: ${PID_FILE}`);
  log('');

  displaySchedule();

  // Schedule all jobs
  scheduleArchitectMode();
  scheduleBuilderMode();
  scheduleEndOfDay();

  if (!RUN_ONCE) {
    log('✅ Chronos is now running. Press Ctrl+C to stop.\n');
    log('📊 Next scheduled events:');
    log(`   ARCHITECT: ${new Date().toLocaleDateString()} ${ARCHITECT_TIME.split(' ')[1]}:00`);
    log(`   BUILDER: ${new Date().toLocaleDateString()} ${BUILDER_TIME.split(' ')[1]}:00`);
    log(`   EOD: ${new Date().toLocaleDateString()} ${EOD_TIME.split(' ')[1]}:00\n`);
  }
}

main().catch((error) => {
  log(`💥 Chronos crashed: ${error.message}`, 'ERROR');
  removePid();
  process.exit(1);
});
