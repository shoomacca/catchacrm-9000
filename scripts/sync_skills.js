/**
 * Sync Skills - Ensure skills resources exist
 */

const fs = require('fs');
const path = require('path');

const planningDir = path.join('.', '.planning');
const skillsDir = path.join(planningDir, 'skills');
const skillsFile = path.join(skillsDir, 'SKILLS.md');
const resourcesFile = path.join(planningDir, 'docs', 'RESOURCES.md');
const assetsDir = path.join('.', 'public', 'assets');
const iconsDir = path.join('.', 'public', 'icons', 'itshover');
const sourcesFile = path.join(assetsDir, '_sources.md');

const skillsContent = `# Skills and Design Resources

This project uses curated skills and UI resources. Prefer these sources before generic libraries.

## UI Icons (Primary)
- itshover icons: https://www.itshover.com/icons
  - Use for SaaS, websites, and app UIs.
  - Download icons and store locally in \`public/icons/itshover/\`.
  - Keep a short \`ICON_SOURCES.md\` entry per project with icon names and URLs.

## UI Components
- 21st.dev community components: https://21st.dev/community/components
- MagicUI (via MCP): https://magicui.design/docs/mcp
  - Use for polished UI sections, hero blocks, and motion-ready components.

## Media Conversion
- ezgif video to webp: https://ezgif.com/video-to-webp
  - Use for converting short demo videos to WebP.
  - Store outputs in \`public/media/\` with a size and fps note.

## Automation (n8n)
- n8n MCP: https://github.com/vredrick/n8n-mcp
- n8n skills library: https://github.com/czlonkowski/n8n-skills
  - Use these for automation milestones and workflow patterns.

## Design System Source
- itshover: https://github.com/itshover/itshover
  - Prefer tokens, iconography, and layout conventions when building web/SaaS UIs.

## Usage Rules
1. Always check license/usage terms before shipping.
2. Cache external assets locally (no hotlinking in production).
3. Record sources in \`DECISIONS.md\` when adopting a component or icon set.
`;

const resourcesContent = `# Resource Index

## Skills
- \`.planning/skills/SKILLS.md\`

## UI Libraries
- itshover icons: https://www.itshover.com/icons
- 21st.dev components: https://21st.dev/community/components
- MagicUI MCP: https://magicui.design/docs/mcp

## Automation
- n8n MCP: https://github.com/vredrick/n8n-mcp
- n8n skills: https://github.com/czlonkowski/n8n-skills

## Media
- Ezgif (video to WebP): https://ezgif.com/video-to-webp
`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function writeIfMissing(filePath, content) {
  if (fs.existsSync(filePath)) return false;
  fs.writeFileSync(filePath, content);
  return true;
}

function syncSkills() {
  ensureDir(skillsDir);
  ensureDir(path.join(planningDir, 'docs'));
  ensureDir(assetsDir);
  ensureDir(iconsDir);

  const created = [];
  if (writeIfMissing(skillsFile, skillsContent)) created.push(skillsFile);
  if (writeIfMissing(resourcesFile, resourcesContent)) created.push(resourcesFile);
  if (writeIfMissing(sourcesFile, '# Asset Sources\n\n- [asset]: [source url]\n')) created.push(sourcesFile);

  if (created.length) {
    console.log('Skills synced:');
    created.forEach(f => console.log(`- ${f}`));
  } else {
    console.log('Skills already present.');
  }
}

syncSkills();
