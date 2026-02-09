/**
 * Audit - Pre-Ship Quality Checks
 * Run automated checks before production deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * Run a command and capture output
 */
function runCommand(cmd, description) {
  console.log(`\nRunning: ${description}`);
  console.log(`Command: ${cmd}`);
  console.log('-'.repeat(40));

  try {
    const output = execSync(cmd, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000 // 2 minutes
    });
    console.log(output || '(no output)');
    return { success: true, output };
  } catch (error) {
    console.error('FAILED:', error.message);
    if (error.stdout) console.log(error.stdout);
    if (error.stderr) console.error(error.stderr);
    return { success: false, error: error.message };
  }
}

/**
 * Check if file exists
 */
function fileExists(filepath) {
  return fs.existsSync(filepath);
}

/**
 * Run all audits
 */
function runAudit() {
  console.log('='.repeat(50));
  console.log('NEW GENESIS PRE-SHIP AUDIT');
  console.log('='.repeat(50));
  console.log(`Date: ${new Date().toISOString()}`);

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // 1. Check package.json exists
  if (!fileExists('package.json')) {
    results.failed.push('package.json not found');
    console.error('\nCRITICAL: No package.json - is this a Node project?');
    printResults(results);
    process.exit(1);
  }
  results.passed.push('package.json exists');

  // 2. Build check
  const buildCheck = runCommand('npm run build', 'Build');
  if (buildCheck.success) {
    results.passed.push('Build passes');
  } else {
    results.failed.push('Build failed');
  }

  // 3. TypeScript check
  const tsCheck = runCommand('npm run typecheck 2>/dev/null || npx tsc --noEmit 2>/dev/null || echo "No typecheck"', 'TypeScript');
  if (tsCheck.success && !tsCheck.output?.includes('error')) {
    results.passed.push('TypeScript check passes');
  } else if (tsCheck.output?.includes('No typecheck')) {
    results.warnings.push('No TypeScript check configured');
  } else {
    results.failed.push('TypeScript errors found');
  }

  // 4. Lint check
  const lintCheck = runCommand('npm run lint 2>/dev/null || echo "No lint"', 'Lint');
  if (lintCheck.success && !lintCheck.output?.includes('error')) {
    results.passed.push('Lint passes');
  } else if (lintCheck.output?.includes('No lint')) {
    results.warnings.push('No lint configured');
  } else {
    results.warnings.push('Lint warnings found');
  }

  // 5. Test check
  const testCheck = runCommand('npm test 2>/dev/null || echo "No tests"', 'Tests');
  if (testCheck.success && !testCheck.output?.includes('failed')) {
    results.passed.push('Tests pass');
  } else if (testCheck.output?.includes('No tests')) {
    results.warnings.push('No tests configured');
  } else {
    results.failed.push('Tests failed');
  }

  // 6. Check for console.log in production code
  console.log('\nChecking for console.log statements...');
  try {
    const consoleLogCount = execSync('grep -r "console.log" --include="*.ts" --include="*.tsx" app/ lib/ src/ 2>/dev/null | wc -l', { encoding: 'utf8' });
    const count = parseInt(consoleLogCount.trim(), 10);
    if (count > 0) {
      results.warnings.push(`${count} console.log statements found (remove for production)`);
    } else {
      results.passed.push('No console.log in production code');
    }
  } catch {
    // No app/lib/src folders or grep failed
    results.passed.push('Console.log check skipped (no source folders)');
  }

  // 7. Check environment variables
  if (fileExists('.env.example') || fileExists('.env.local.example')) {
    results.passed.push('.env.example exists');
  } else {
    results.warnings.push('.env.example missing - document your environment variables');
  }

  // 8. Check for .env in git (should not be committed)
  try {
    const gitCheck = execSync('git ls-files .env .env.local 2>/dev/null', { encoding: 'utf8' });
    if (gitCheck.trim()) {
      results.failed.push('.env files are tracked in git (SECURITY RISK)');
    } else {
      results.passed.push('.env files not in git');
    }
  } catch {
    results.passed.push('Git check skipped');
  }

  // Print results
  printResults(results);

  // Exit with appropriate code
  if (results.failed.length > 0) {
    console.log('\nAUDIT FAILED - Fix issues before shipping');
    process.exit(1);
  } else if (results.warnings.length > 0) {
    console.log('\nAUDIT PASSED WITH WARNINGS - Review before shipping');
    process.exit(0);
  } else {
    console.log('\nAUDIT PASSED - Ready to ship!');
    process.exit(0);
  }
}

/**
 * Print formatted results
 */
function printResults(results) {
  console.log('\n' + '='.repeat(50));
  console.log('AUDIT RESULTS');
  console.log('='.repeat(50));

  console.log('\nPASSED:');
  results.passed.forEach(p => console.log(`  [x] ${p}`));

  if (results.warnings.length > 0) {
    console.log('\nWARNINGS:');
    results.warnings.forEach(w => console.log(`  [!] ${w}`));
  }

  if (results.failed.length > 0) {
    console.log('\nFAILED:');
    results.failed.forEach(f => console.log(`  [ ] ${f}`));
  }

  console.log('\n' + '='.repeat(50));
  console.log(`SUMMARY: ${results.passed.length} passed, ${results.warnings.length} warnings, ${results.failed.length} failed`);
  console.log('='.repeat(50));
}

// Run
runAudit();
