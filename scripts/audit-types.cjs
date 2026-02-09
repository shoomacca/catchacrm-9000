const fs = require('fs');

// Read types.ts
const typesContent = fs.readFileSync('src/types.ts', 'utf8');

// Extract all interfaces manually by parsing
const lines = typesContent.split('\n');
const interfaces = {};
let currentInterface = null;
let currentFields = [];
let braceCount = 0;

for (const line of lines) {
  // Check for interface start
  const interfaceMatch = line.match(/export interface (\w+)/);
  if (interfaceMatch && line.includes('{')) {
    currentInterface = interfaceMatch[1];
    currentFields = [];
    braceCount = 1;
    continue;
  }

  if (currentInterface) {
    // Count braces
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    // Extract field
    const fieldMatch = line.match(/^\s*(\w+)(\?)?:\s*(.+?);?\s*(?:\/\/.*)?$/);
    if (fieldMatch) {
      currentFields.push({
        name: fieldMatch[1],
        optional: fieldMatch[2] === '?',
        type: fieldMatch[3].replace(/;$/, '').trim()
      });
    }

    // End of interface
    if (braceCount === 0) {
      interfaces[currentInterface] = currentFields;
      currentInterface = null;
    }
  }
}

let output = '# UI TYPES AUDIT (src/types.ts)\n';
output += 'Generated: ' + new Date().toISOString() + '\n';
output += 'Interfaces: ' + Object.keys(interfaces).length + '\n\n';

// Focus on main entity types
const mainEntities = ['User', 'Account', 'Contact', 'Lead', 'Deal', 'Task', 'CalendarEvent', 'Campaign', 'Communication', 'Ticket', 'Product', 'Service', 'Quote', 'Invoice', 'Job', 'Crew', 'Zone', 'Equipment', 'InventoryItem', 'PurchaseOrder', 'BankTransaction', 'Expense', 'Review', 'Warehouse', 'Subscription', 'Document', 'AuditLog'];

for (const entity of mainEntities) {
  if (interfaces[entity]) {
    output += '## ' + entity + ' (' + interfaces[entity].length + ' fields)\n';
    output += '| Field | Type | Required |\n';
    output += '|-------|------|----------|\n';

    for (const f of interfaces[entity]) {
      const typeStr = f.type.length > 40 ? f.type.substring(0, 37) + '...' : f.type;
      output += '| ' + f.name + ' | ' + typeStr + ' | ' + (f.optional ? 'NO' : 'YES') + ' |\n';
    }
    output += '\n';
  }
}

fs.writeFileSync('UI_TYPES_AUDIT.md', output);
console.log('Written to UI_TYPES_AUDIT.md');
console.log('Extracted ' + Object.keys(interfaces).length + ' interfaces');
