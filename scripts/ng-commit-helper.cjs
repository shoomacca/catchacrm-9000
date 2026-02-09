
/**
 * ng-commit-helper.js
 * Helper to format commit messages according to Genesis conventions
 *
 * Usage: node scripts/ng-commit-helper.js [type] [task-id] [description]
 * Example: node scripts/ng-commit-helper.js feat M5-01 "Add SMS provider setup docs"
 */

const readline = require('readline');

const COMMIT_TYPES = {
  feat: 'New feature',
  fix: 'Bug fix',
  docs: 'Documentation',
  test: 'Tests',
  refactor: 'Code refactoring',
  style: 'Code style/formatting',
  chore: 'Maintenance tasks'
};

const CO_AUTHORED_BY = 'Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>';

function parseArgs() {
  const args = process.argv.slice(2);

  if (args.length >= 3) {
    return {
      type: args[0],
      taskId: args[1],
      description: args.slice(2).join(' ')
    };
  }

  return null;
}

function validateCommitType(type) {
  return Object.keys(COMMIT_TYPES).includes(type);
}

function formatCommitMessage(type, taskId, description) {
  return `${type}(${taskId}): ${description}\n\n${CO_AUTHORED_BY}`;
}

function promptUser() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n' + '='.repeat(80));
  console.log('  NEW GENESIS - COMMIT MESSAGE HELPER');
  console.log('='.repeat(80) + '\n');

  console.log('Available commit types:');
  Object.entries(COMMIT_TYPES).forEach(([key, desc]) => {
    console.log(`  ${key.padEnd(10)} - ${desc}`);
  });
  console.log('');

  return new Promise((resolve) => {
    rl.question('Commit type (feat/fix/docs/etc): ', (type) => {
      if (!validateCommitType(type)) {
        console.log(`❌ Invalid type: ${type}`);
        rl.close();
        process.exit(1);
      }

      rl.question('Task ID (e.g., M5-01, ANT-566): ', (taskId) => {
        rl.question('Description (short, imperative): ', (description) => {
          rl.close();
          resolve({ type, taskId, description });
        });
      });
    });
  });
}

async function main() {
  let commitData = parseArgs();

  if (!commitData) {
    commitData = await promptUser();
  } else if (!validateCommitType(commitData.type)) {
    console.error(`❌ Invalid commit type: ${commitData.type}`);
    console.log(`\nValid types: ${Object.keys(COMMIT_TYPES).join(', ')}`);
    process.exit(1);
  }

  const message = formatCommitMessage(
    commitData.type,
    commitData.taskId,
    commitData.description
  );

  console.log('\n' + '='.repeat(80));
  console.log('📝 FORMATTED COMMIT MESSAGE:');
  console.log('='.repeat(80) + '\n');
  console.log(message);
  console.log('\n' + '='.repeat(80) + '\n');

  console.log('💡 To commit with this message, run:\n');
  console.log(
    `   git commit -m "${commitData.type}(${commitData.taskId}): ${commitData.description}" -m "${CO_AUTHORED_BY}"`
  );
  console.log('\n' + '='.repeat(80) + '\n');

  const fs = require('fs');
  const path = require('path');
  const commitMsgFile = path.join(__dirname, '..', '.git', 'COMMIT_EDITMSG_PREVIEW');

  try {
    fs.writeFileSync(commitMsgFile, message);
    console.log(`✅ Message saved to: ${commitMsgFile}\n`);
  } catch (err) {
    // Git directory might not exist, ignore
  }
}

if (require.main === module) {
  main();
}

module.exports = { formatCommitMessage };
