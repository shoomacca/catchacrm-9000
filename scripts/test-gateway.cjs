
/**
 * NEW GENESIS Gateway Test Script
 *
 * Purpose: Verify n8n webhook connection
 * Usage: node scripts/test-gateway.js [action] [linearHandle] [notes]
 *
 * Examples:
 *   node scripts/test-gateway.js start_shard ANT-001
 *   node scripts/test-gateway.js complete_shard ANT-001 "Setup complete"
 */

const WEBHOOK_URL = process.env.GENESIS_WEBHOOK_URL || 'https://ai.bsbsbs.au/webhook/genesis-update';

async function testWebhook() {
  const args = process.argv.slice(2);

  // Parse command line arguments
  const action = args[0] || 'start_shard';
  const linearHandle = args[1] || 'ANT-001';
  const notes = args[2] || `Test ${action} from test-gateway.js`;

  // Validate action
  if (!['start_shard', 'complete_shard'].includes(action)) {
    console.error('❌ Invalid action. Must be "start_shard" or "complete_shard"');
    process.exit(1);
  }

  // Build payload
  const payload = {
    action,
    linearHandle,
    notes,
    timestamp: new Date().toISOString(),
    source: 'test-gateway.js'
  };

  console.log('🔧 Testing n8n Gateway Connection\n');
  console.log('Webhook URL:', WEBHOOK_URL);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('\n📡 Sending request...\n');

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('📊 Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Webhook failed:', errorText);
      process.exit(1);
    }

    const result = await response.json().catch(() => null);

    if (result) {
      console.log('✅ Response Body:', JSON.stringify(result, null, 2));
    } else {
      console.log('✅ Webhook accepted (no JSON response)');
    }

    console.log('\n✨ Test successful!');
    console.log(`\nLinear task ${linearHandle} should now be marked as "${action === 'start_shard' ? 'In Progress' : 'Done'}"`);

  } catch (error) {
    console.error('❌ Request failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check network connection');
    console.error('  2. Verify webhook URL is correct');
    console.error('  3. Check n8n workflow is active');
    console.error('  4. Verify webhook endpoint exists');
    process.exit(1);
  }
}

// Run test
testWebhook();
