# SESSION A1: Settings Persistence + Email Send + Templates

**Objective:** Move settings from localStorage to Supabase, enable email sending from CRM, and connect template tables to UI.

**Estimated Time:** 3-4 hours (Claude Code session)

---

## CONTEXT (Read First)

**Project:** CatchaCRM 9000 - Multi-tenant CRM for trades/field service
**Current State:**
- ✅ Google OAuth tokens stored per-user (gmail_oauth_tokens table)
- ✅ EmailComposer component exists but uses hardcoded templates
- ✅ SMSComposer component exists but uses hardcoded templates
- ❌ Settings stored in localStorage (lost on cache clear)
- ❌ No email send function from CRM
- ❌ No email history on contact/account detail pages

**Tables Available:**
- `crm_settings` (organization-level settings)
- `company_settings` (alternative settings table)
- `email_templates` (for EmailComposer)
- `sms_templates` (for SMSComposer)
- `org_email_accounts` (per-user Gmail integration)
- `communications` (email/SMS/call history)

**Supabase Edge Functions Directory:** `supabase/functions/`

**Tech Stack:** React 19, TypeScript, Supabase, Tailwind CSS

---

## TASKS

### TASK 1: Migrate Settings to Supabase (2 hours)

**Current Behavior:**
- Settings stored in `localStorage` under key `crm_settings`
- Lost when user clears browser cache or switches devices
- No sync across team members in same org

**Target Behavior:**
- Settings stored in Supabase `crm_settings` table (org-scoped)
- Synced across all devices and team members
- Falls back to localStorage only in demo mode

**Files to Modify:**

1. **Create Settings Service** (`src/services/settingsService.ts`)
```typescript
import { supabase } from './supabaseClient';

interface CRMSettings {
  orgId: string;
  companyName: string;
  enabledModules: {
    sales: boolean;
    financials: boolean;
    fieldServices: boolean;
    operations: boolean;
    logistics: boolean;
    marketing: boolean;
  };
  defaultCurrency: string;
  timezone: string;
  dateFormat: string;
  fiscalYearStart: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  // ... other settings from current localStorage structure
}

export async function loadSettings(orgId: string): Promise<CRMSettings | null> {
  // Try Supabase first
  const { data, error } = await supabase
    .from('crm_settings')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (data) return data.settings;

  // Fallback to localStorage for demo mode
  const localSettings = localStorage.getItem('crm_settings');
  return localSettings ? JSON.parse(localSettings) : null;
}

export async function saveSettings(orgId: string, settings: CRMSettings): Promise<void> {
  // Save to Supabase
  const { error } = await supabase
    .from('crm_settings')
    .upsert({
      org_id: orgId,
      settings: settings,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;

  // Also save to localStorage as backup
  localStorage.setItem('crm_settings', JSON.stringify(settings));
}
```

2. **Update CRMContext.tsx** (`src/context/CRMContext.tsx`)
- Add `loadSettings()` call in `useEffect` after org loaded
- Replace `localStorage.getItem('crm_settings')` with `loadSettings(orgId)`
- Replace `localStorage.setItem('crm_settings', ...)` with `saveSettings(orgId, settings)`

3. **Update SettingsView.tsx** (`src/pages/SettingsView.tsx`)
- On save button click, call `settingsService.saveSettings()` instead of localStorage
- Show toast notification: "Settings saved successfully"
- Handle errors with toast: "Failed to save settings"

**Verification:**
- [ ] Settings persist after clearing browser cache
- [ ] Settings sync across different browser tabs
- [ ] Demo mode still works with localStorage fallback
- [ ] No console errors on settings save

---

### TASK 2: Build Gmail Send Edge Function (1 hour)

**Current State:**
- Gmail OAuth tokens exist in `org_email_accounts` table
- No send function implemented

**Target:**
- Create Supabase Edge Function to send emails via Gmail API
- Log sent emails in `communications` table

**Create:** `supabase/functions/gmail-send/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, body, fromEmail, orgId, entityType, entityId } = await req.json();

    // Get Gmail OAuth token for this user's email account
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: emailAccount } = await supabase
      .from('org_email_accounts')
      .select('access_token, refresh_token, email')
      .eq('org_id', orgId)
      .eq('email', fromEmail)
      .single();

    if (!emailAccount) {
      throw new Error('Email account not found or not authorized');
    }

    // Refresh token if needed (check if expired)
    let accessToken = emailAccount.access_token;
    // TODO: Implement token refresh logic

    // Send email via Gmail API
    const emailContent = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].join('\n');

    const encodedEmail = btoa(emailContent).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const gmailResponse = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail })
    });

    if (!gmailResponse.ok) {
      throw new Error(`Gmail API error: ${await gmailResponse.text()}`);
    }

    const result = await gmailResponse.json();

    // Log email in communications table
    await supabase.from('communications').insert({
      org_id: orgId,
      type: 'email',
      direction: 'outbound',
      subject: subject,
      body: body,
      to_email: to,
      from_email: fromEmail,
      entity_type: entityType,
      entity_id: entityId,
      gmail_message_id: result.id,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

**Deploy:**
```bash
cd C:\Users\Corse\.antigravity\catchacrm_flash_integrated
npx supabase functions deploy gmail-send --project-ref anawatvgypmrpbmjfcht
```

---

### TASK 3: Connect EmailComposer to Edge Function (30 min)

**File:** `src/components/EmailComposer.tsx`

**Changes:**
1. Add send handler:
```typescript
const handleSend = async () => {
  try {
    const response = await supabase.functions.invoke('gmail-send', {
      body: {
        to: to,
        subject: subject,
        body: body,
        fromEmail: selectedEmailAccount, // from org_email_accounts
        orgId: orgId,
        entityType: entityType, // 'contact', 'account', 'lead', etc.
        entityId: entityId
      }
    });

    if (response.error) throw response.error;

    toast.success('Email sent successfully');
    onClose();
    // Refresh communications list if on detail page
  } catch (error) {
    toast.error(`Failed to send email: ${error.message}`);
  }
};
```

2. Add email account selector:
```typescript
const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
const [selectedEmailAccount, setSelectedEmailAccount] = useState<string>('');

useEffect(() => {
  loadEmailAccounts();
}, [orgId]);

async function loadEmailAccounts() {
  const { data } = await supabase
    .from('org_email_accounts')
    .select('email, provider')
    .eq('org_id', orgId);

  setEmailAccounts(data || []);
  if (data?.[0]) setSelectedEmailAccount(data[0].email);
}
```

3. Add account selector to UI:
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">From</label>
  <select
    value={selectedEmailAccount}
    onChange={(e) => setSelectedEmailAccount(e.target.value)}
    className="w-full px-3 py-2 border rounded-lg"
  >
    {emailAccounts.map(account => (
      <option key={account.email} value={account.email}>
        {account.email} ({account.provider})
      </option>
    ))}
  </select>
</div>
```

**Verification:**
- [ ] Email sends successfully when clicking "Send" button
- [ ] Email appears in Gmail Sent folder
- [ ] Email logged in `communications` table
- [ ] Toast notification shown on success/error

---

### TASK 4: Connect Email Templates Table (30 min)

**File:** `src/components/EmailComposer.tsx`

**Current:** Hardcoded templates array in component
**Target:** Load from `email_templates` table

**Changes:**

1. Load templates from Supabase:
```typescript
const [templates, setTemplates] = useState<EmailTemplate[]>([]);

useEffect(() => {
  loadTemplates();
}, [orgId]);

async function loadTemplates() {
  const { data } = await supabase
    .from('email_templates')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  setTemplates(data || []);
}
```

2. Template selector:
```tsx
<div className="mb-4">
  <label className="block text-sm font-medium mb-1">Template</label>
  <select
    onChange={(e) => {
      const template = templates.find(t => t.id === e.target.value);
      if (template) {
        setSubject(template.subject);
        setBody(template.body);
      }
    }}
    className="w-full px-3 py-2 border rounded-lg"
  >
    <option value="">-- Select Template --</option>
    {templates.map(template => (
      <option key={template.id} value={template.id}>
        {template.name}
      </option>
    ))}
  </select>
</div>
```

3. **Seed Default Templates:**

Create `scripts/seed-email-templates.sql`:
```sql
INSERT INTO email_templates (org_id, name, subject, body, category) VALUES
('00000000-0000-0000-0000-000000000001', 'Welcome Email', 'Welcome to {{company_name}}!', '<p>Hi {{contact_name}},</p><p>Thank you for choosing {{company_name}}. We look forward to working with you!</p>', 'General'),
('00000000-0000-0000-0000-000000000001', 'Quote Follow-up', 'Following up on Quote #{{quote_number}}', '<p>Hi {{contact_name}},</p><p>I wanted to follow up on the quote we sent you on {{quote_date}}. Do you have any questions?</p>', 'Sales'),
('00000000-0000-0000-0000-000000000001', 'Invoice Reminder', 'Invoice #{{invoice_number}} Payment Reminder', '<p>Hi {{contact_name}},</p><p>This is a friendly reminder that Invoice #{{invoice_number}} for ${{amount}} is due on {{due_date}}.</p>', 'Financial'),
('00000000-0000-0000-0000-000000000001', 'Job Scheduled', 'Job Scheduled for {{job_date}}', '<p>Hi {{contact_name}},</p><p>Your job has been scheduled for {{job_date}} at {{job_time}}. Our crew will arrive during this time window.</p>', 'Field Service');
```

Run in Supabase SQL Editor.

**Verification:**
- [ ] Template dropdown populates from database
- [ ] Selecting template fills subject and body fields
- [ ] Variable placeholders like {{contact_name}} visible in template
- [ ] Can still manually edit subject/body after selecting template

---

### TASK 5: Connect SMS Templates Table (30 min)

**File:** `src/components/SMSComposer.tsx`

**Same pattern as EmailComposer:**

1. Load templates:
```typescript
const [templates, setTemplates] = useState<SMSTemplate[]>([]);

useEffect(() => {
  loadTemplates();
}, [orgId]);

async function loadTemplates() {
  const { data } = await supabase
    .from('sms_templates')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  setTemplates(data || []);
}
```

2. Template selector UI
3. Seed default templates

**Seed SQL:**
```sql
INSERT INTO sms_templates (org_id, name, body, category) VALUES
('00000000-0000-0000-0000-000000000001', 'Appointment Reminder', 'Hi {{contact_name}}, reminder: Your appointment is scheduled for {{date}} at {{time}}. Reply CONFIRM to confirm.', 'Field Service'),
('00000000-0000-0000-0000-000000000001', 'Quote Sent', 'Hi {{contact_name}}, we sent you a quote for {{service}}. View it here: {{quote_link}}', 'Sales'),
('00000000-0000-0000-0000-000000000001', 'Payment Received', 'Thank you for your payment of ${{amount}}! Your receipt: {{receipt_link}}', 'Financial');
```

**Verification:**
- [ ] Template dropdown works
- [ ] Selecting template fills message body
- [ ] Can still manually edit message

---

### TASK 6: Add EMAIL Tab to Detail Pages (45 min)

**Files to Modify:**
- `src/pages/ContactsPage.tsx` (detail view)
- `src/pages/AccountsPage.tsx` (detail view)
- `src/pages/LeadsPage.tsx` (detail view)

**Add EMAIL Tab:**

```tsx
// In detail modal/view, add tab to existing tabs array
const tabs = [
  { id: 'details', label: 'Details', icon: FileText },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'email', label: 'Email', icon: Mail },  // NEW
  { id: 'sms', label: 'SMS', icon: MessageSquare },
  { id: 'notes', label: 'Notes', icon: FileText }
];

// Add tab content
{activeTab === 'email' && (
  <div className="space-y-4">
    <button
      onClick={() => setShowEmailComposer(true)}
      className="btn-primary"
    >
      <Mail className="w-4 h-4 mr-2" />
      Compose Email
    </button>

    <div className="space-y-3">
      {emailHistory.map(email => (
        <div key={email.id} className="border rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-medium">{email.subject}</div>
              <div className="text-sm text-gray-500">
                {email.direction === 'outbound' ? 'To' : 'From'}: {email.direction === 'outbound' ? email.to_email : email.from_email}
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(email.sent_at).toLocaleString()}
            </div>
          </div>
          <div className="text-sm prose" dangerouslySetInnerHTML={{ __html: email.body }} />
        </div>
      ))}
    </div>

    {emailHistory.length === 0 && (
      <div className="text-center text-gray-400 py-8">
        No email history yet
      </div>
    )}
  </div>
)}
```

**Load Email History:**
```typescript
const [emailHistory, setEmailHistory] = useState([]);

useEffect(() => {
  if (selectedRecord && activeTab === 'email') {
    loadEmailHistory();
  }
}, [selectedRecord, activeTab]);

async function loadEmailHistory() {
  const { data } = await supabase
    .from('communications')
    .select('*')
    .eq('org_id', orgId)
    .eq('entity_type', entityType) // 'contact', 'account', 'lead'
    .eq('entity_id', selectedRecord.id)
    .eq('type', 'email')
    .order('sent_at', { ascending: false });

  setEmailHistory(data || []);
}
```

**Verification:**
- [ ] EMAIL tab visible on contact detail
- [ ] EMAIL tab visible on account detail
- [ ] EMAIL tab visible on lead detail
- [ ] "Compose Email" button opens EmailComposer
- [ ] Sent emails appear in history after sending
- [ ] Email body renders HTML correctly

---

## VERIFICATION CHECKLIST

### Settings Migration
- [ ] Settings save to Supabase `crm_settings` table
- [ ] Settings load from Supabase on login
- [ ] Settings persist after clearing browser cache
- [ ] Settings sync across different tabs
- [ ] Demo mode still works with localStorage fallback

### Email Sending
- [ ] EmailComposer shows email account selector
- [ ] EmailComposer shows template dropdown
- [ ] Selecting template fills subject and body
- [ ] "Send" button sends email via Gmail API
- [ ] Sent email appears in Gmail Sent folder
- [ ] Email logged in `communications` table with correct entity linkage
- [ ] Toast notifications shown on success/error

### SMS Templates
- [ ] SMSComposer shows template dropdown
- [ ] Selecting template fills message body
- [ ] Can edit template after selecting

### Email History
- [ ] EMAIL tab visible on Contact detail
- [ ] EMAIL tab visible on Account detail
- [ ] EMAIL tab visible on Lead detail
- [ ] Email history loads when tab clicked
- [ ] "Compose Email" button opens composer
- [ ] Sent emails appear in history immediately

### Build & Deployment
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] All Edge Functions deployed to Supabase

---

## COMMIT MESSAGES

After each task, commit atomically:

```bash
git add src/services/settingsService.ts src/context/CRMContext.tsx src/pages/SettingsView.tsx
git commit -m "feat(settings): migrate from localStorage to Supabase persistence

- Create settingsService.ts with loadSettings/saveSettings
- Update CRMContext to use Supabase settings
- Update SettingsView save handler
- Add fallback to localStorage for demo mode
- Settings now persist across devices and sessions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add supabase/functions/gmail-send/
git commit -m "feat(email): add Gmail send Edge Function

- Create gmail-send Edge Function using Gmail API
- Use existing OAuth tokens from org_email_accounts
- Log sent emails in communications table
- Return messageId for tracking

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/components/EmailComposer.tsx
git commit -m "feat(email): connect EmailComposer to Gmail send and templates

- Add email account selector dropdown
- Load templates from email_templates table
- Wire Send button to gmail-send Edge Function
- Add toast notifications for success/error
- Log sent emails to communications table

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/components/SMSComposer.tsx scripts/seed-sms-templates.sql
git commit -m "feat(sms): connect SMSComposer to sms_templates table

- Load templates from Supabase instead of hardcoded array
- Add template selector dropdown
- Seed default SMS templates for demo org
- Preserve ability to manually edit message

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/pages/ContactsPage.tsx src/pages/AccountsPage.tsx src/pages/LeadsPage.tsx
git commit -m "feat(email): add EMAIL tab to contact/account/lead detail views

- Add EMAIL tab with compose button and history
- Load email history from communications table
- Filter by entity_type and entity_id
- Display sent/received emails with timestamps
- Render HTML email bodies correctly

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## HANDOFF TO SESSION A2

After completing this session, create handoff document:

```markdown
# Session A1 Complete

## Completed
✅ Settings migrated to Supabase (crm_settings table)
✅ Gmail send Edge Function deployed
✅ EmailComposer connected to templates and send function
✅ SMSComposer connected to templates table
✅ EMAIL tab added to Contact/Account/Lead detail pages
✅ All commits pushed to dev branch

## Next Session (A2)
- Calendar sync with Google Calendar (bi-directional)
- Team management UI (connect teams/team_members tables)
- Currency management (replace hardcoded list with Supabase)
- Calendar event creation from CRM

## Blockers
None

## Notes
- Gmail OAuth tokens already exist and working
- Email templates seeded for demo org
- SMS templates seeded for demo org
```

---

**END OF SESSION A1**
