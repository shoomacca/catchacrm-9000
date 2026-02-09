# Skills and Design Resources

This project uses curated skills and UI resources. Prefer these sources before generic libraries.

## UI Icons (Primary)
- itshover icons: https://www.itshover.com/icons
  - Use for SaaS, websites, and app UIs.
  - Download icons and store locally in `public/icons/itshover/`.
  - Keep a short `ICON_SOURCES.md` entry per project with icon names and URLs.

## UI Components
- 21st.dev community components: https://21st.dev/community/components
- MagicUI (via MCP): https://magicui.design/docs/mcp
  - Use for polished UI sections, hero blocks, and motion-ready components.

## Media Conversion
- ezgif video to webp: https://ezgif.com/video-to-webp
  - Use for converting short demo videos to WebP.
  - Store outputs in `public/media/` with a size and fps note.

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
3. Record sources in `DECISIONS.md` when adopting a component or icon set.
