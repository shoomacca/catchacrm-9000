/**
 * CHRONOS - Test Script
 *
 * Purpose: Test Chronos scheduler without waiting for scheduled times
 * Usage: node scripts/test-chronos.js
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n╔═══════════════════════════════════════════════════════════════════╗');
console.log('║                  CHRONOS - TEST SCRIPT                            ║');
console.log('╚═══════════════════════════════════════════════════════════════════╝\n');

console.log('This test will run all Chronos phases immediately:\n');
console.log('  1. ARCHITECT mode (review)');
console.log('  2. BUILDER mode (execution)');
console.log('  3. End of Day (cleanup)\n');

console.log('⚠️  Note: This uses --once flag to run all phases sequentially\n');
console.log('Press Ctrl+C within 5 seconds to cancel...\n');

setTimeout(() => {
  console.log('🚀 Starting Chronos test...\n');

  const chronosScript = path.resolve(__dirname, 'chronos.js');

  try {
    execSync(`node "${chronosScript}" --once`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ Chronos test complete!');
    console.log('\n📊 Check logs at: .antigravity/logs/\n');
  } catch (error) {
    console.error('\n❌ Chronos test failed:', error.message);
    process.exit(1);
  }
}, 5000);
