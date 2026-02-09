const fs = require('fs');

// Read types.ts
const typesContent = fs.readFileSync('src/types.ts', 'utf8');

// Parse interfaces
const lines = typesContent.split('\n');
const interfaces = {};
const typeAliases = {};
let currentInterface = null;
let currentFields = [];
let braceCount = 0;
let interfaceExtends = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Check for type alias
  const typeMatch = line.match(/^export type (\w+)\s*=\s*(.+)/);
  if (typeMatch && !line.includes('{')) {
    typeAliases[typeMatch[1]] = typeMatch[2].replace(/;$/, '').trim();
    continue;
  }

  // Check for interface start
  const interfaceMatch = line.match(/^export interface (\w+)(?:\s+extends\s+(\w+))?/);
  if (interfaceMatch) {
    currentInterface = interfaceMatch[1];
    interfaceExtends = interfaceMatch[2] || null;
    currentFields = [];
    braceCount = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;
    if (braceCount === 0 && line.includes('{') && line.includes('}')) {
      // Single line interface
      interfaces[currentInterface] = { fields: [], extends: interfaceExtends };
      currentInterface = null;
    }
    continue;
  }

  if (currentInterface) {
    // Count braces
    braceCount += (line.match(/{/g) || []).length;
    braceCount -= (line.match(/}/g) || []).length;

    // Extract field - handle various formats
    const fieldMatch = line.match(/^\s+(\w+)(\?)?:\s*(.+?);?\s*(?:\/\/.*)?$/);
    if (fieldMatch && !line.trim().startsWith('//')) {
      const fieldName = fieldMatch[1];
      const optional = fieldMatch[2] === '?';
      let fieldType = fieldMatch[3].replace(/;$/, '').trim();

      // Clean up complex types for display
      if (fieldType.length > 60) {
        fieldType = fieldType.substring(0, 57) + '...';
      }

      currentFields.push({
        name: fieldName,
        type: fieldType,
        optional: optional
      });
    }

    // End of interface
    if (braceCount === 0) {
      interfaces[currentInterface] = {
        fields: currentFields,
        extends: interfaceExtends
      };
      currentInterface = null;
      interfaceExtends = null;
    }
  }
}

// Generate markdown
let output = '# UI TYPES SCHEMA - COMPLETE AUDIT\n';
output += `Generated: ${new Date().toISOString()}\n`;
output += `Source: src/types.ts\n\n`;

output += `## Summary\n`;
output += `Total Interfaces: ${Object.keys(interfaces).length}\n`;
output += `Total Type Aliases: ${Object.keys(typeAliases).length}\n\n`;

// Group interfaces by category
const coreEntities = ['User', 'Account', 'Contact', 'Lead', 'Deal'];
const salesEntities = ['Campaign', 'Quote', 'Invoice', 'Subscription'];
const serviceEntities = ['Task', 'Ticket', 'Job', 'Crew', 'Zone', 'Equipment'];
const productEntities = ['Product', 'Service', 'InventoryItem', 'PurchaseOrder', 'Warehouse'];
const financialEntities = ['BankTransaction', 'Expense', 'Payment'];
const communicationEntities = ['Communication', 'CalendarEvent', 'Document', 'Review'];
const marketingEntities = ['ReferralReward', 'InboundForm', 'ChatWidget', 'Calculator'];
const systemEntities = ['AutomationWorkflow', 'Webhook', 'IndustryTemplate', 'AuditLog', 'Notification'];

const categories = [
  { name: 'Core Entities', items: coreEntities },
  { name: 'Sales & Revenue', items: salesEntities },
  { name: 'Service & Operations', items: serviceEntities },
  { name: 'Products & Inventory', items: productEntities },
  { name: 'Financial', items: financialEntities },
  { name: 'Communication & Docs', items: communicationEntities },
  { name: 'Marketing & Inbound', items: marketingEntities },
  { name: 'System & Automation', items: systemEntities },
];

output += `## Table of Contents\n\n`;

let sectionNum = 1;
const processedInterfaces = new Set();

for (const cat of categories) {
  output += `### ${cat.name}\n`;
  for (const name of cat.items) {
    if (interfaces[name]) {
      output += `- [${name}](#${sectionNum}-${name.toLowerCase()})\n`;
      sectionNum++;
    }
  }
  output += '\n';
}

// Add remaining interfaces
const remaining = Object.keys(interfaces).filter(name =>
  !categories.some(cat => cat.items.includes(name))
);

if (remaining.length > 0) {
  output += `### Other Interfaces\n`;
  for (const name of remaining.slice(0, 30)) {
    output += `- ${name}\n`;
  }
  if (remaining.length > 30) {
    output += `- ... and ${remaining.length - 30} more\n`;
  }
  output += '\n';
}

output += `---\n\n`;

// Output each interface in detail
sectionNum = 1;

for (const cat of categories) {
  output += `# ${cat.name}\n\n`;

  for (const name of cat.items) {
    const iface = interfaces[name];
    if (!iface) continue;

    processedInterfaces.add(name);

    output += `## ${sectionNum}. ${name}\n`;
    if (iface.extends) {
      output += `Extends: \`${iface.extends}\`\n`;
    }
    output += `Fields: ${iface.fields.length}\n\n`;

    if (iface.fields.length > 0) {
      output += `| # | Field | Type | Required |\n`;
      output += `|---|-------|------|----------|\n`;

      let fieldNum = 1;
      for (const field of iface.fields) {
        const required = field.optional ? '○' : '●';
        output += `| ${fieldNum} | ${field.name} | \`${field.type}\` | ${required} |\n`;
        fieldNum++;
      }
    } else {
      output += `*No fields defined (may extend another interface)*\n`;
    }

    output += `\n`;
    sectionNum++;
  }
}

// Output remaining interfaces
output += `# Other Interfaces\n\n`;

for (const name of remaining) {
  const iface = interfaces[name];

  output += `## ${sectionNum}. ${name}\n`;
  if (iface.extends) {
    output += `Extends: \`${iface.extends}\`\n`;
  }
  output += `Fields: ${iface.fields.length}\n\n`;

  if (iface.fields.length > 0) {
    output += `| # | Field | Type | Required |\n`;
    output += `|---|-------|------|----------|\n`;

    let fieldNum = 1;
    for (const field of iface.fields) {
      const required = field.optional ? '○' : '●';
      output += `| ${fieldNum} | ${field.name} | \`${field.type}\` | ${required} |\n`;
      fieldNum++;
    }
  }

  output += `\n`;
  sectionNum++;
}

// Output type aliases
output += `---\n\n`;
output += `# Type Aliases\n\n`;
output += `| Type | Definition |\n`;
output += `|------|------------|\n`;

for (const [name, def] of Object.entries(typeAliases)) {
  const shortDef = def.length > 80 ? def.substring(0, 77) + '...' : def;
  output += `| ${name} | \`${shortDef}\` |\n`;
}

// Write to file
fs.writeFileSync('UI_TYPES_FULL.md', output);
console.log('Written to UI_TYPES_FULL.md');
console.log(`Total interfaces: ${Object.keys(interfaces).length}`);
console.log(`Total type aliases: ${Object.keys(typeAliases).length}`);

// Also output a summary of field counts
console.log('\nField counts by entity:');
for (const cat of categories) {
  for (const name of cat.items) {
    if (interfaces[name]) {
      console.log(`  ${name}: ${interfaces[name].fields.length} fields`);
    }
  }
}
