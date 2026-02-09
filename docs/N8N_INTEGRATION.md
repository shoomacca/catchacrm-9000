# n8n Integration Documentation

**Created:** 2026-01-24
**Status:** M02_03 - Documented (No existing workflows to migrate)

---

## Current State

**Legacy CatchaCRM does NOT currently use n8n workflows.**

All automation and integrations are either:
- Built directly in the app
- Handled by external services
- Not yet implemented

---

## n8n Instance Details

| Property | Value |
|----------|-------|
| **URL** | https://ai.bsbsbs.au |
| **Status** | Active and available |
| **Total Workflows** | 100+ (none CatchaCRM-specific) |
| **Purpose** | Ready for future CatchaCRM automation needs |

---

## Planned Future Integrations

The following n8n workflows are planned for CatchaCRM:

### 1. Professional Email Automation
- **Purpose:** Send branded, templated emails for campaigns
- **Triggers:** Webhook from CRM (contact created, deal closed, etc.)
- **Status:** Not implemented

### 2. Chatbot Integration
- **Purpose:** Customer support chatbot on website
- **Triggers:** Webhook from chat widget
- **Status:** Not implemented

### 3. VoIP Call Logging (Optional)
- **Purpose:** Log calls to CRM automatically
- **Triggers:** VoIP provider webhook
- **Status:** Future consideration

### 4. SMS/WhatsApp Notifications (Optional)
- **Purpose:** Send automated SMS/WhatsApp messages
- **Triggers:** Webhook from CRM
- **Status:** Future consideration

### 5. General Webhook Handler
- **Purpose:** Handle incoming webhooks from external services
- **Triggers:** Various webhook endpoints
- **Status:** Not implemented

---

## Webhook URL Structure

When implementing workflows, use this pattern:

```
https://ai.bsbsbs.au/webhook/catchacrm/[purpose]

Examples:
- https://ai.bsbsbs.au/webhook/catchacrm/email-campaign
- https://ai.bsbsbs.au/webhook/catchacrm/chatbot-message
- https://ai.bsbsbs.au/webhook/catchacrm/contact-created
```

---

## Environment Variables Needed

When n8n workflows are implemented, add these to `.env`:

```bash
# n8n Webhooks
N8N_WEBHOOK_BASE_URL=https://ai.bsbsbs.au/webhook/catchacrm
N8N_API_KEY=<to_be_generated>

# Optional: For specific integrations
N8N_EMAIL_WEBHOOK=<webhook_url>
N8N_CHATBOT_WEBHOOK=<webhook_url>
```

---

## Migration Impact

**M02_03 Result:** ✅ No migration needed

- No existing workflows to export/import
- No webhook URLs to update
- No workflow dependencies to document
- n8n instance is ready for future use

---

## Next Steps

When implementing n8n workflows (likely M05 - Automation + comms integrations):

1. Design workflow in n8n interface
2. Test with sample data
3. Document webhook URL in this file
4. Add webhook URL to `.env`
5. Update DECISIONS.md with workflow details
6. Test integration end-to-end

---

## Related Documentation

- **n8n Skills:** `.antigravity/skills/n8n-travel-automation/README.md` (reference for patterns)
- **MCP Tools:** `.antigravity/docs/MCP_SERVICES.md` (n8n MCP server available)
- **Milestone M05:** Automation + comms integrations (where n8n will be used)

---

**Document Status:** ✅ Complete
**Migration Required:** No
**Prepared By:** @Automator
**Date:** 2026-01-24
