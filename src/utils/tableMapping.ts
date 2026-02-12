/**
 * Table Mapping Utility
 *
 * Maps frontend EntityType (camelCase) to Supabase table names (snake_case).
 * Used by CRMContext when persisting to Supabase.
 */

import { EntityType } from '../types';

export const TABLE_MAP: Record<EntityType, string> = {
  leads: 'leads',
  deals: 'deals',
  accounts: 'accounts',
  contacts: 'contacts',
  tasks: 'tasks',
  tickets: 'tickets',
  campaigns: 'campaigns',
  users: 'users',
  calendarEvents: 'calendar_events',
  invoices: 'invoices',
  quotes: 'quotes',
  products: 'products',
  services: 'services',
  subscriptions: 'subscriptions',
  documents: 'documents',
  communications: 'communications',
  conversations: 'conversations',
  chatMessages: 'chat_messages',
  crews: 'crews',
  jobs: 'jobs',
  zones: 'zones',
  equipment: 'equipment',
  inventoryItems: 'inventory_items',
  purchaseOrders: 'purchase_orders',
  bankTransactions: 'bank_transactions',
  expenses: 'expenses',
  reviews: 'reviews',
  referralRewards: 'referral_rewards',
  inboundForms: 'inbound_forms',
  chatWidgets: 'chat_widgets',
  calculators: 'calculators',
  automationWorkflows: 'automation_workflows',
  webhooks: 'webhooks',
  industryTemplates: 'industry_templates',
  currencies: 'currencies',
  payments: 'payments',
  warehouses: 'warehouses',
  roles: 'roles',
  tacticalQueue: 'tactical_queue',
  warehouseLocations: 'warehouse_locations',
  dispatchAlerts: 'dispatch_alerts',
  rfqs: 'rfqs',
  supplierQuotes: 'supplier_quotes',
};

/**
 * Get the Supabase table name for a given EntityType.
 * Falls back to the entityType as-is if not found in mapping.
 */
export const getTableName = (entityType: EntityType): string =>
  TABLE_MAP[entityType] || entityType;

/**
 * Get EntityType from a Supabase table name.
 * Used for reverse mapping when receiving data from Supabase.
 */
export const getEntityType = (tableName: string): EntityType | null => {
  const entry = Object.entries(TABLE_MAP).find(([_, table]) => table === tableName);
  return entry ? (entry[0] as EntityType) : null;
};

export default TABLE_MAP;
