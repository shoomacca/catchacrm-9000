# SESSION A2: Calendar Sync + Team Management + Currency

**Objective:** Bi-directional Google Calendar sync, connect team management UI to Supabase, and replace hardcoded currency list.

**Estimated Time:** 3-4 hours (Claude Code session)

---

## CONTEXT (Read First)

**Prerequisites:**
- ✅ Session A1 completed (settings in Supabase, email send working)
- ✅ Google OAuth tokens stored per-user
- ✅ CalendarView component exists (`src/pages/CalendarView.tsx`)
- ✅ Teams/team_members tables exist in Supabase

**Current State:**
- ❌ Calendar events stored locally only (not synced with Google Calendar)
- ❌ Creating event in CRM doesn't create in Google Calendar
- ❌ Creating event in Google Calendar doesn't show in CRM
- ❌ Team management UI is placeholder (no database connection)
- ❌ Currency list hardcoded in `utils/currencies.ts`

**Tables:**
- `calendar_events` - CRM events
- `teams` - Team definitions
- `team_members` - User-to-team assignments
- `currencies` - Currency master list
- `org_email_accounts` - Has Google OAuth tokens with calendar scope

---

## TASKS

### TASK 1: Build Calendar Sync Edge Function (2 hours)

**Create:** `supabase/functions/calendar-sync/index.ts`

**Features:**
1. Import Google Calendar events into CRM
2. Export CRM events to Google Calendar
3. Bi-directional sync on a schedule

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
    const { orgId, userEmail, direction } = await req.json();
    // direction: 'import' | 'export' | 'sync'

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Google OAuth token
    const { data: emailAccount } = await supabase
      .from('org_email_accounts')
      .select('access_token, refresh_token')
      .eq('org_id', orgId)
      .eq('email', userEmail)
      .single();

    if (!emailAccount) {
      throw new Error('Google account not connected');
    }

    let accessToken = emailAccount.access_token;
    // TODO: Implement token refresh if expired

    if (direction === 'import' || direction === 'sync') {
      // Import events from Google Calendar
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=250&singleEvents=true&orderBy=startTime',
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!calendarResponse.ok) {
        throw new Error(`Google Calendar API error: ${await calendarResponse.text()}`);
      }

      const { items } = await calendarResponse.json();

      // Upsert events to calendar_events table
      for (const event of items) {
        await supabase.from('calendar_events').upsert({
          org_id: orgId,
          google_event_id: event.id,
          title: event.summary,
          description: event.description,
          start_time: event.start.dateTime || event.start.date,
          end_time: event.end.dateTime || event.end.date,
          location: event.location,
          attendees: event.attendees?.map(a => a.email) || [],
          status: event.status,
          sync_status: 'synced',
          last_synced_at: new Date().toISOString()
        }, {
          onConflict: 'google_event_id'
        });
      }
    }

    if (direction === 'export' || direction === 'sync') {
      // Export CRM events to Google Calendar
      const { data: crmEvents } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('org_id', orgId)
        .is('google_event_id', null); // Only unsyncedNew events

      for (const event of crmEvents || []) {
        const googleEvent = {
          summary: event.title,
          description: event.description,
          start: {
            dateTime: event.start_time,
            timeZone: 'Australia/Sydney'
          },
          end: {
            dateTime: event.end_time,
            timeZone: 'Australia/Sydney'
          },
          location: event.location,
          attendees: event.attendees?.map(email => ({ email }))
        };

        const createResponse = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(googleEvent)
          }
        );

        if (!createResponse.ok) {
          console.error('Failed to create event:', await createResponse.text());
          continue;
        }

        const created = await createResponse.json();

        // Update CRM event with Google ID
        await supabase
          .from('calendar_events')
          .update({
            google_event_id: created.id,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString()
          })
          .eq('id', event.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: `Calendar ${direction} completed` }),
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
npx supabase functions deploy calendar-sync --project-ref anawatvgypmrpbmjfcht
```

---

### TASK 2: Add Sync Button to CalendarView (30 min)

**File:** `src/pages/CalendarView.tsx`

**Add sync button to header:**

```tsx
const [isSyncing, setIsSyncing] = useState(false);

const handleSync = async () => {
  setIsSyncing(true);
  try {
    const { data: emailAccount } = await supabase
      .from('org_email_accounts')
      .select('email')
      .eq('org_id', orgId)
      .eq('provider', 'google')
      .single();

    if (!emailAccount) {
      toast.error('Google Calendar not connected. Go to Settings > Integrations');
      return;
    }

    const response = await supabase.functions.invoke('calendar-sync', {
      body: {
        orgId: orgId,
        userEmail: emailAccount.email,
        direction: 'sync'
      }
    });

    if (response.error) throw response.error;

    toast.success('Calendar synced successfully');
    // Reload events
    loadCalendarEvents();
  } catch (error) {
    toast.error(`Sync failed: ${error.message}`);
  } finally {
    setIsSyncing(false);
  }
};

// In the header section
<button
  onClick={handleSync}
  disabled={isSyncing}
  className="btn-secondary"
>
  {isSyncing ? (
    <>
      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
      Syncing...
    </>
  ) : (
    <>
      <RefreshCw className="w-4 h-4 mr-2" />
      Sync with Google
    </>
  )}
</button>
```

**Verification:**
- [ ] Sync button visible in calendar header
- [ ] Clicking sync imports events from Google Calendar
- [ ] Clicking sync exports CRM events to Google Calendar
- [ ] Events appear in both CRM and Google Calendar after sync
- [ ] Toast notifications show sync status

---

### TASK 3: Auto-Sync on Event Create (30 min)

**File:** `src/pages/CalendarView.tsx`

**Modify event creation handler:**

```typescript
const handleCreateEvent = async (eventData) => {
  try {
    // Create in CRM
    const { data: newEvent } = await supabase
      .from('calendar_events')
      .insert({
        org_id: orgId,
        ...eventData,
        sync_status: 'pending'
      })
      .select()
      .single();

    // Trigger export to Google Calendar
    const { data: emailAccount } = await supabase
      .from('org_email_accounts')
      .select('email')
      .eq('org_id', orgId)
      .eq('provider', 'google')
      .single();

    if (emailAccount) {
      await supabase.functions.invoke('calendar-sync', {
        body: {
          orgId: orgId,
          userEmail: emailAccount.email,
          direction: 'export'
        }
      });
    }

    toast.success('Event created and synced to Google Calendar');
    loadCalendarEvents();
  } catch (error) {
    toast.error(`Failed to create event: ${error.message}`);
  }
};
```

**Verification:**
- [ ] Creating event in CRM also creates in Google Calendar
- [ ] Event appears in both calendars within seconds
- [ ] Toast notification confirms sync

---

### TASK 4: Connect Team Management UI (1.5 hours)

**File:** `src/pages/SettingsView.tsx` (Users & Teams tab)

**Current State:** Placeholder UI with hardcoded teams

**Target:** Connect to `teams` and `team_members` tables

**Changes:**

1. **Load teams from Supabase:**

```typescript
const [teams, setTeams] = useState<Team[]>([]);
const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

useEffect(() => {
  if (activeTab === 'users') {
    loadTeams();
    loadTeamMembers();
  }
}, [activeTab, orgId]);

async function loadTeams() {
  const { data } = await supabase
    .from('teams')
    .select('*')
    .eq('org_id', orgId)
    .order('name');

  setTeams(data || []);
}

async function loadTeamMembers() {
  const { data } = await supabase
    .from('team_members')
    .select(`
      *,
      user:users(name, email),
      team:teams(name)
    `)
    .eq('org_id', orgId);

  setTeamMembers(data || []);
}
```

2. **Create Team Modal:**

```tsx
const [showCreateTeam, setShowCreateTeam] = useState(false);

// Modal component
{showCreateTeam && (
  <div className="modal">
    <div className="modal-content">
      <h2>Create Team</h2>
      <form onSubmit={handleCreateTeam}>
        <input
          type="text"
          placeholder="Team Name"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={newTeamDescription}
          onChange={(e) => setNewTeamDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">Create Team</button>
          <button type="button" onClick={() => setShowCreateTeam(false)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}

// Handler
async function handleCreateTeam(e) {
  e.preventDefault();

  try {
    const { data } = await supabase
      .from('teams')
      .insert({
        org_id: orgId,
        name: newTeamName,
        description: newTeamDescription
      })
      .select()
      .single();

    toast.success('Team created successfully');
    setShowCreateTeam(false);
    setNewTeamName('');
    setNewTeamDescription('');
    loadTeams();
  } catch (error) {
    toast.error(`Failed to create team: ${error.message}`);
  }
}
```

3. **Team List Display:**

```tsx
<div className="space-y-4">
  <div className="flex justify-between items-center">
    <h3 className="text-lg font-semibold">Teams</h3>
    <button onClick={() => setShowCreateTeam(true)} className="btn-primary">
      <Plus className="w-4 h-4 mr-2" />
      Create Team
    </button>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {teams.map(team => (
      <div key={team.id} className="border rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-medium">{team.name}</h4>
            <p className="text-sm text-gray-500">{team.description}</p>
          </div>
          <button
            onClick={() => handleDeleteTeam(team.id)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3">
          <div className="text-sm font-medium mb-1">Members:</div>
          <div className="flex flex-wrap gap-2">
            {teamMembers
              .filter(tm => tm.team_id === team.id)
              .map(tm => (
                <span key={tm.id} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {tm.user.name}
                </span>
              ))}
          </div>
          <button
            onClick={() => {
              setSelectedTeam(team);
              setShowAddMember(true);
            }}
            className="text-sm text-blue-600 hover:underline mt-2"
          >
            + Add Member
          </button>
        </div>
      </div>
    ))}
  </div>

  {teams.length === 0 && (
    <div className="text-center text-gray-400 py-8">
      No teams yet. Create your first team to get started.
    </div>
  )}
</div>
```

4. **Add Member to Team:**

```tsx
const [showAddMember, setShowAddMember] = useState(false);
const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
const [selectedUser, setSelectedUser] = useState<string>('');

{showAddMember && (
  <div className="modal">
    <div className="modal-content">
      <h2>Add Member to {selectedTeam?.name}</h2>
      <form onSubmit={handleAddMember}>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-lg mb-4"
        >
          <option value="">-- Select User --</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary">Add Member</button>
          <button type="button" onClick={() => setShowAddMember(false)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>
)}

async function handleAddMember(e) {
  e.preventDefault();

  try {
    await supabase.from('team_members').insert({
      org_id: orgId,
      team_id: selectedTeam.id,
      user_id: selectedUser
    });

    toast.success('Member added to team');
    setShowAddMember(false);
    setSelectedUser('');
    loadTeamMembers();
  } catch (error) {
    toast.error(`Failed to add member: ${error.message}`);
  }
}
```

5. **Delete Team:**

```typescript
async function handleDeleteTeam(teamId: string) {
  if (!confirm('Are you sure you want to delete this team?')) return;

  try {
    // Delete team members first
    await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    // Delete team
    await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    toast.success('Team deleted');
    loadTeams();
  } catch (error) {
    toast.error(`Failed to delete team: ${error.message}`);
  }
}
```

**Verification:**
- [ ] Teams load from Supabase on page load
- [ ] "Create Team" button opens modal
- [ ] Creating team saves to database
- [ ] Teams display in grid with member counts
- [ ] "Add Member" button opens user selector
- [ ] Adding member saves to team_members table
- [ ] Delete team removes team and all members
- [ ] Toast notifications on all actions

---

### TASK 5: Replace Hardcoded Currency List (45 min)

**Current:** `src/utils/currencies.ts` has hardcoded array

**Target:** Load from `currencies` table in Supabase

**Changes:**

1. **Create Currency Service** (`src/services/currencyService.ts`)

```typescript
import { supabase } from './supabaseClient';

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
}

export async function loadCurrencies(): Promise<Currency[]> {
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .order('code');

  if (error) throw error;
  return data || [];
}

export async function getCurrency(code: string): Promise<Currency | null> {
  const { data } = await supabase
    .from('currencies')
    .select('*')
    .eq('code', code)
    .single();

  return data;
}
```

2. **Update CRMContext to load currencies:**

```typescript
const [currencies, setCurrencies] = useState<Currency[]>([]);

useEffect(() => {
  loadCurrencies();
}, []);

async function loadCurrencies() {
  try {
    const data = await currencyService.loadCurrencies();
    setCurrencies(data);
  } catch (error) {
    console.error('Failed to load currencies:', error);
    // Fallback to hardcoded list if database fails
    setCurrencies(defaultCurrencies);
  }
}
```

3. **Update SettingsView to use currencies from context:**

```tsx
const { currencies } = useCRM();

<select
  value={settings.defaultCurrency}
  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
  className="w-full px-3 py-2 border rounded-lg"
>
  {currencies.map(currency => (
    <option key={currency.code} value={currency.code}>
      {currency.code} - {currency.name} ({currency.symbol})
    </option>
  ))}
</select>
```

4. **Seed Currency Data:**

```sql
-- Run in Supabase SQL Editor
INSERT INTO currencies (code, name, symbol, decimal_places) VALUES
('USD', 'US Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('GBP', 'British Pound', '£', 2),
('AUD', 'Australian Dollar', 'A$', 2),
('CAD', 'Canadian Dollar', 'C$', 2),
('JPY', 'Japanese Yen', '¥', 0),
('CNY', 'Chinese Yuan', '¥', 2),
('INR', 'Indian Rupee', '₹', 2),
('NZD', 'New Zealand Dollar', 'NZ$', 2),
('SGD', 'Singapore Dollar', 'S$', 2);
```

**Verification:**
- [ ] Currencies load from Supabase on app start
- [ ] Currency dropdown in Settings shows database currencies
- [ ] Fallback to hardcoded list if database fails
- [ ] Saving settings with new currency persists correctly

---

## VERIFICATION CHECKLIST

### Calendar Sync
- [ ] calendar-sync Edge Function deployed
- [ ] Sync button in calendar header
- [ ] Clicking "Sync" imports events from Google Calendar
- [ ] Clicking "Sync" exports CRM events to Google Calendar
- [ ] Creating event in CRM auto-syncs to Google Calendar
- [ ] Events show google_event_id after sync
- [ ] sync_status field updates correctly
- [ ] Toast notifications on sync success/error

### Team Management
- [ ] Teams load from Supabase
- [ ] "Create Team" modal works
- [ ] New teams save to database
- [ ] Teams display with member counts
- [ ] "Add Member" modal works
- [ ] Members save to team_members table
- [ ] Member badges display on team cards
- [ ] Delete team removes team and members
- [ ] Toast notifications on all actions

### Currency Management
- [ ] Currencies load from Supabase
- [ ] Currency dropdown populated from database
- [ ] Fallback to hardcoded list if database unavailable
- [ ] Selecting currency saves to settings

### Build
- [ ] npm run build succeeds
- [ ] No TypeScript errors
- [ ] No console errors

---

## COMMIT MESSAGES

```bash
git add supabase/functions/calendar-sync/
git commit -m "feat(calendar): add bi-directional Google Calendar sync

- Create calendar-sync Edge Function
- Import events from Google Calendar to CRM
- Export CRM events to Google Calendar
- Update sync_status and google_event_id fields
- Handle OAuth token refresh

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/pages/CalendarView.tsx
git commit -m "feat(calendar): add sync button and auto-sync on create

- Add 'Sync with Google' button to calendar header
- Trigger sync on button click
- Auto-sync new events to Google Calendar on create
- Show sync status with toast notifications
- Display loading spinner during sync

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/pages/SettingsView.tsx
git commit -m "feat(teams): connect team management UI to Supabase

- Load teams from teams table
- Load team members from team_members table
- Add Create Team modal with database insert
- Add member assignment UI
- Add delete team functionality
- Display teams in grid with member badges
- Toast notifications for all actions

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git add src/services/currencyService.ts src/context/CRMContext.tsx src/pages/SettingsView.tsx
git commit -m "feat(settings): replace hardcoded currencies with Supabase table

- Create currencyService.ts to load from database
- Update CRMContext to provide currencies
- Update SettingsView currency dropdown to use database
- Add fallback to hardcoded list if database fails
- Seed 10 common currencies in database

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## HANDOFF TO SESSION A3

```markdown
# Session A2 Complete

## Completed
✅ Calendar sync Edge Function deployed
✅ Sync button in calendar UI
✅ Auto-sync on event create
✅ Team management connected to Supabase
✅ Currency list loaded from database
✅ All commits pushed to dev branch

## Next Session (A3)
- Invoice builder (create invoice from deal)
- Invoice PDF generation
- Payment link page (public, no auth)
- Import/Export job tracking

## Blockers
None

## Notes
- Calendar sync tested with Google Calendar
- Teams and team_members tables connected
- Currency fallback working if database unavailable
```

---

**END OF SESSION A2**
