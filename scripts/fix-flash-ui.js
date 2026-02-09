const fs = require('fs');
const path = require('path');

// Files to fix
const files = [
  'src/pages/ZonesPage.tsx',
  'src/pages/InventoryPage.tsx',
  'src/pages/PurchaseOrdersPage.tsx',
  'src/pages/WarehousePage.tsx',
  'src/pages/ProcurementPage.tsx',
  'src/pages/JobMarketplacePage.tsx',
];

// Replacements to make
const replacements = [
  { from: /rounded-\[35px\]/g, to: 'rounded-2xl' },
  { from: /rounded-\[25px\]/g, to: 'rounded-2xl' },
  { from: /rounded-\[20px\]/g, to: 'rounded-xl' },
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  replacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed ${file}`);
  } else {
    console.log(`- No changes needed for ${file}`);
  }
});

console.log('\nFlash UI border-radius fixes complete!');
