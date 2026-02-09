import { EntityType, AuditReport, AuditFailure, Lead, Account, Contact, Deal, Communication, Task, Document, Ticket, Campaign, Subscription, Invoice, CRMSettings, User } from '../types';

/**
 * CRM Audit Engine v4.0 (Root-Cause Enabled)
 * Performs deep structural and relational analysis on the current CRM state.
 */

export interface AuditContextState {
  leads: Lead[];
  deals: Deal[];
  accounts: Account[];
  contacts: Contact[];
  tasks: Task[];
  campaigns: Campaign[];
  tickets: Ticket[];
  invoices: Invoice[];
  subscriptions: Subscription[];
  documents: Document[];
  communications: Communication[];
  users: User[];
  settings: CRMSettings;
  currentUserId: string;
  currentUser?: User;
}

export interface AuditHelpers {
  getCommunicationsForEntity: (type: EntityType, id: string) => Communication[];
  canAccessRecord: (record: any) => boolean;
}

export const runAudit = (
  state: AuditContextState,
  helpers: AuditHelpers,
  currentRouteContext: { path: string; params: Record<string, string | undefined> }
): AuditReport => {
  const failures: AuditFailure[] = [];
  const timestamp = new Date().toISOString();

  // 1. Collection Counts
  const collections: Record<string, number> = {
    leads: state.leads.length,
    deals: state.deals.length,
    accounts: state.accounts.length,
    contacts: state.contacts.length,
    tasks: state.tasks.length,
    tickets: state.tickets.length,
    campaigns: state.campaigns.length,
    communications: state.communications.length,
    documents: state.documents.length,
    invoices: state.invoices.length,
    subscriptions: state.subscriptions.length,
    users: state.users.length,
  };

  // 2. Settings Health
  const settingsChecks: Record<string, { ok: boolean; issues: string[] }> = {};
  const requiredDictionaries: (keyof CRMSettings)[] = [
    'leadStatuses', 'leadSources', 'dealStages', 'ticketStatuses', 'taskStatuses', 'industries'
  ];

  requiredDictionaries.forEach(key => {
    const list = state.settings[key] as any[];
    const ok = Array.isArray(list) && list.length > 0;
    settingsChecks[key as string] = {
      ok,
      issues: ok ? [] : [`Dictionary '${key}' is empty or undefined.`]
    };
    if (!ok) {
      failures.push({
        failureCode: 'SETTINGS_WIPE',
        entityType: 'settings',
        recordId: key as string,
        expected: 'Populated Dictionary',
        actual: 'Empty or Undefined',
        likelyCause: 'Settings object was overwritten with an incomplete payload or missing required keys in localStorage.',
        whereToLook: 'CRMContext.tsx / seedInitialData or restoreDefaultSettings'
      });
    }
  });

  const brandingOk = !!state.settings.branding?.name;
  settingsChecks.branding = { ok: brandingOk, issues: brandingOk ? [] : ['Organization name is missing.'] };
  if (!brandingOk) {
    failures.push({
      failureCode: 'SETTINGS_WIPE',
      entityType: 'settings',
      recordId: 'branding',
      expected: 'Defined branding name',
      actual: 'Undefined',
      likelyCause: 'Branding key missing from settings object used during initialization.',
      whereToLook: 'types.ts / CRMSettings definition'
    });
  }

  // 3. Relationship Integrity
  const orphans: { parentType: string; parentId: string; childId: string; childType: string }[] = [];
  const casingIssues: string[] = [];

  const checkPolymorphicRelation = (record: any, childType: string) => {
    const rType = record.relatedToType as string;
    const rId = record.relatedToId;
    
    // Pattern: Relationship key mismatch
    if (!rId && (record as any).relatedEntityId) {
      failures.push({
        failureCode: 'RELATION_KEY_MISMATCH',
        entityType: childType,
        recordId: record.id,
        expected: 'relatedToId',
        actual: 'relatedEntityId',
        likelyCause: 'Developer used legacy key name or incorrect property mapping during upsert.',
        whereToLook: 'RecordModal.tsx / handleSubmit'
      });
      return;
    }

    if (!rType || !rId) return;

    // Pattern: Relationship casing mismatch
    if (rType[0] === rType[0].toUpperCase()) {
      failures.push({
        failureCode: 'RELATION_CASING_MISMATCH',
        entityType: childType,
        recordId: record.id,
        expected: rType.toLowerCase(),
        actual: rType,
        likelyCause: 'Polymorphic type passed as capitalized string instead of lowercase EntityType alias.',
        whereToLook: 'types.ts / EntityType usage in DetailView'
      });
    }

    // Pattern: Orphan reference
    const targetCollection = (state as any)[rType.toLowerCase()];
    if (!targetCollection) {
      orphans.push({ parentType: rType, parentId: rId, childId: record.id, childType });
      failures.push({
        failureCode: 'ORPHAN_REFERENCE',
        entityType: childType,
        recordId: record.id,
        expected: `Valid parent of type ${rType}`,
        actual: `Broken reference to ${rId}`,
        likelyCause: 'Parent record deleted without cascading or seed order violation.',
        whereToLook: 'CRMContext.tsx / deleteRecord'
      });
      return;
    }

    const parentExists = targetCollection.some((p: any) => p.id === rId);
    if (!parentExists) {
      orphans.push({ parentType: rType, parentId: rId, childId: record.id, childType });
      failures.push({
        failureCode: 'ORPHAN_REFERENCE',
        entityType: childType,
        recordId: record.id,
        expected: `Exists parent ${rId}`,
        actual: 'Not Found in collection',
        likelyCause: 'The referenced ID does not exist in the memory state.',
        whereToLook: 'utils/seedData.ts / generateArtifacts'
      });
    }
  };

  state.communications.forEach(c => checkPolymorphicRelation(c, 'communications'));
  state.tasks.forEach(t => checkPolymorphicRelation(t, 'tasks'));
  state.documents.forEach(d => checkPolymorphicRelation(d, 'documents'));

  // 4. Selector Integrity (Selector Bypass Detection)
  const discrepancies: { name: string; expected: number; actual: number; id: string }[] = [];
  const sampleEntities = [...state.leads, ...state.accounts].slice(0, 5);
  sampleEntities.forEach(ent => {
    const type = state.leads.includes(ent as Lead) ? 'leads' : 'accounts';
    const rawMatchCount = state.communications.filter(c => c.relatedToId === ent.id && c.relatedToType === type).length;
    const selectorResult = helpers.getCommunicationsForEntity(type as EntityType, ent.id);
    const actual = selectorResult ? selectorResult.length : 0;
    
    if (rawMatchCount !== actual) {
      discrepancies.push({ name: 'getCommunicationsForEntity', expected: rawMatchCount, actual, id: ent.id });
      failures.push({
        failureCode: 'SELECTOR_BYPASS',
        entityType: 'communications',
        recordId: ent.id,
        expected: `${rawMatchCount} records`,
        actual: `${actual} records`,
        likelyCause: 'The helper function uses incorrect filter logic or key names, causing records present in raw state to be ignored.',
        whereToLook: 'CRMContext.tsx / getCommunicationsForEntity'
      });
    }
  });

  // 5. Reset Sanity Check
  const isDefaultSettings = state.settings.branding.name === 'CatchaCRM';
  const hasEntities = state.leads.length > 0 || state.accounts.length > 0;
  
  if (isDefaultSettings && !hasEntities && localStorage.getItem('catchacrm_db_v3')) {
    // This looks like a partially failed reset where settings were cleared but seed didn't run?
    // Or vice-versa.
  }

  // 6. Tab Coverage (Sampling)
  const tabCoverage: Record<string, { id: string; name: string; tabs: Record<string, number> }[]> = {};
  const typesToSample: EntityType[] = ['leads', 'accounts', 'deals'];
  
  typesToSample.forEach(t => {
    const items = (state as any)[t].slice(0, 5);
    tabCoverage[t] = items.map((item: any) => {
      const counts: Record<string, number> = {
        COMMS: state.communications.filter(c => c.relatedToId === item.id && c.relatedToType === t).length,
        TASKS: state.tasks.filter(tk => tk.relatedToId === item.id && tk.relatedToType === t).length,
        DOCS: state.documents.filter(d => d.relatedToId === item.id && d.relatedToType === t).length,
        TICKETS: state.tickets.filter(tk => tk.accountId === item.id || tk.relatedToId === item.id).length,
      };
      return { id: item.id, name: item.name || item.company, tabs: counts };
    });
  });

  // 7. Persona Filter Impact
  const impactByCollection: Record<string, { total: number; visible: number; hidden: number }> = {};
  const collectionsToTest: EntityType[] = ['leads', 'deals', 'accounts', 'tickets'];
  
  let totalHidden = 0;
  collectionsToTest.forEach(type => {
    const raw = (state as any)[type] as any[];
    const permitted = raw.filter(r => helpers.canAccessRecord(r));
    const hidden = raw.length - permitted.length;
    totalHidden += hidden;
    impactByCollection[type] = {
      total: raw.length,
      visible: permitted.length,
      hidden
    };
  });

  // 8. Seed Integrity
  const seedIssues: string[] = [];
  if (state.users.length < 3) seedIssues.push('User count suspiciously low for a seeded environment.');
  if (state.leads.length === 0) seedIssues.push('Missing leads in bootstrap state.');
  
  const seedIntegrityStatus = seedIssues.length === 0 ? 'pristine' : 'modified';

  // Final Summary
  const totalChecks = requiredDictionaries.length + 2 + discrepancies.length + orphans.length + (totalHidden > 0 ? 1 : 0);
  const passedCount = totalChecks - failures.length;

  return {
    summary: {
      totalChecks,
      passed: Math.max(0, passedCount),
      failed: failures.length,
      integrityScore: Math.round((passedCount / totalChecks) * 100)
    },
    collections,
    settings: {
      health: failures.some(f => f.failureCode === 'SETTINGS_WIPE') ? 'unhealthy' : 'healthy',
      checks: settingsChecks
    },
    relationships: {
      orphanCount: orphans.length,
      orphans,
      casingIssues
    },
    selectors: {
      discrepancies
    },
    tabCoverage,
    personaFilters: {
      totalHidden,
      activeUser: state.currentUser?.name || state.currentUserId,
      activeRole: state.currentUser?.role || 'unknown',
      impactByCollection
    },
    seedIntegrity: {
      status: seedIntegrityStatus,
      issues: seedIssues
    },
    failures,
    timestamp
  };
};
