
import {
  User, Lead, Account, Contact, Deal, Task, Ticket, Invoice, Product, Service,
  Subscription, Campaign, CalendarEvent, Document, Communication, AuditLog,
  LineItem, EntityType, CommunicationOutcome, Crew, Job, Zone, JobType, JobStatus,
  Equipment, InventoryItem, PurchaseOrder, POStatus, BankTransaction, Expense,
  Review, ReferralReward, InboundForm, ChatWidget, Calculator, ReviewPlatform, CalculatorType, FormField,
  AutomationWorkflow, Webhook, WorkflowTriggerType, WorkflowNodeType, WorkflowActionType, WorkflowTrigger, WorkflowNode,
  IndustryTemplate, LayoutSection, CustomFieldDef
} from '../types';

const pastDate = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const futureDate = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateDemoData = () => {
  const timestamp = new Date().toISOString();

  // ═══════════════════════════════════════════════════════════════════════════
  // THE MATRIX TRILOGY - MOCK DATA THEME
  // Ships = Companies (Accounts)
  // Captains = Directors (Primary Contacts)
  // Crew = Team Members (Additional Contacts)
  // ═══════════════════════════════════════════════════════════════════════════

  // 1. USERS (Zion Command)
  const users: User[] = [
    { id: 'USR-NEO', name: 'Neo Anderson', email: 'neo@zion.io', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'USR-TRINITY', name: 'Trinity', email: 'trinity@zion.io', role: 'manager', team: 'Field Operations', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'USR-MORPHEUS', name: 'Morpheus', email: 'morpheus@zion.io', role: 'manager', team: 'Recruitment', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'USR-NIOBE', name: 'Niobe', email: 'niobe@zion.io', role: 'manager', team: 'Fleet Command', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'USR-LINK', name: 'Link', email: 'link@zion.io', role: 'agent', managerId: 'USR-MORPHEUS', team: 'Operators', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Link', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 2. PRODUCTS (Matrix Technology)
  const products: Product[] = [
    { id: 'PRD-REDPILL', name: 'Red Pill', sku: 'PILL-RED', description: 'Wake up to reality. No going back.', unitPrice: 999999, taxRate: 0, isActive: true, category: 'Awakening', stockLevel: 100, reorderPoint: 20, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'PRD-BLUEPILL', name: 'Blue Pill', sku: 'PILL-BLUE', description: 'Stay in Wonderland. Story ends.', unitPrice: 0, taxRate: 0, isActive: true, category: 'Comfort', stockLevel: 999, reorderPoint: 100, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'PRD-CONSTRUCT', name: 'Construct Program', sku: 'PROG-CON', description: 'Loading program for combat training.', unitPrice: 50000, taxRate: 10, isActive: true, category: 'Training', stockLevel: 50, reorderPoint: 10, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'PRD-HARDLINE', name: 'Hardline Phone', sku: 'HARD-PHONE', description: 'Exit point connection device.', unitPrice: 15000, taxRate: 10, isActive: true, category: 'Equipment', stockLevel: 25, reorderPoint: 5, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'PRD-EMP', name: 'EMP Device', sku: 'WEAP-EMP', description: 'Electromagnetic pulse weapon for Sentinel defense.', unitPrice: 250000, taxRate: 10, isActive: true, category: 'Defense', stockLevel: 10, reorderPoint: 3, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 3. SERVICES (Zion Services)
  const services: Service[] = [
    { id: 'SRV-OPERATOR', name: 'Operator Support', code: 'SVC-OPR', description: 'Real-time Matrix navigation and exit coordination.', billingCycle: 'monthly', unitPrice: 8000, taxRate: 10, isActive: true, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'SRV-TRAINING', name: 'Combat Training Upload', code: 'SVC-TRN', description: 'Kung Fu, weapons, piloting - instant knowledge transfer.', billingCycle: 'one-off', unitPrice: 25000, taxRate: 10, isActive: true, durationHours: 10, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'SRV-SENTINEL', name: 'Sentinel Watch', code: 'SVC-SEN', description: 'Early warning system for machine attacks.', billingCycle: 'yearly', unitPrice: 120000, taxRate: 0, isActive: true, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'SRV-REPAIRS', name: 'Hovercraft Maintenance', code: 'SVC-HOV', description: 'Full ship systems diagnostic and repair.', billingCycle: 'monthly', unitPrice: 15000, taxRate: 10, isActive: true, createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 4. CAMPAIGNS
  const campaigns: Campaign[] = [
    { id: 'CMP-REDPILL', name: 'Red Pill Initiative', type: 'Email', budget: 100000, spent: 78000, revenue: 2500000, revenueGenerated: 2500000, leadsGenerated: 47, status: 'Active', startDate: pastDate(90), endDate: futureDate(30), description: 'Email campaign targeting high-awareness candidates', expectedCPL: 1500, targetAudience: 'Candidates with awareness score > 70', createdAt: pastDate(95), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CMP-ZION', name: 'Defend Zion', type: 'Event', budget: 500000, spent: 425000, revenue: 1200000, revenueGenerated: 1200000, leadsGenerated: 12, status: 'Active', startDate: pastDate(30), endDate: futureDate(60), description: 'Major defense campaign with fleet mobilization', expectedCPL: 35000, targetAudience: 'All active ships', createdAt: pastDate(35), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'CMP-ORACLE', name: 'Oracle Prophecy Tour', type: 'Social', budget: 75000, spent: 75000, revenue: 180000, revenueGenerated: 180000, leadsGenerated: 23, status: 'Completed', startDate: pastDate(120), endDate: pastDate(30), description: 'Social media campaign promoting Oracle consultations', expectedCPL: 3000, targetAudience: 'Spiritual seekers', createdAt: pastDate(125), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CMP-SEARCH', name: 'Matrix Escape Training SEO', type: 'Search', budget: 50000, spent: 28000, revenue: 95000, revenueGenerated: 95000, leadsGenerated: 18, status: 'Active', startDate: pastDate(60), endDate: futureDate(90), description: 'Google Ads targeting "reality questions" searches', expectedCPL: 2500, targetAudience: 'Searchers with existential queries', createdAt: pastDate(65), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'CMP-REFERRAL', name: 'Freed Mind Referral Program', type: 'Referral', budget: 30000, spent: 15500, revenue: 425000, revenueGenerated: 425000, leadsGenerated: 31, status: 'Active', startDate: pastDate(150), description: 'Word-of-mouth program incentivizing freed minds to refer candidates', expectedCPL: 500, targetAudience: 'Existing freed minds with 90+ day tenure', createdAt: pastDate(155), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CMP-WINTER', name: 'Winter Shelter Campaign', type: 'Event', budget: 125000, spent: 0, revenue: 0, revenueGenerated: 0, leadsGenerated: 0, status: 'Planning', startDate: futureDate(45), endDate: futureDate(105), description: 'Cold season relief operations and recruitment', expectedCPL: 8000, targetAudience: 'Homeless populations with high awareness', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
  ];

  // 5. ACCOUNTS (SHIPS - Hovercraft Fleet)
  const accounts: Account[] = [
    {
      id: 'ACC-NEBUCHADNEZZAR',
      name: 'Nebuchadnezzar',
      industry: 'Reconnaissance',
      website: 'nebuchadnezzar.zion',
      employeeCount: 9,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nebuchadnezzar',
      tier: 'Tier A',
      ownerId: 'USR-MORPHEUS',
      status: 'Active',
      createdAt: pastDate(500),
      updatedAt: timestamp,
      createdBy: 'Kernel'
    },
    {
      id: 'ACC-LOGOS',
      name: 'Logos',
      industry: 'Strike Force',
      website: 'logos.zion',
      employeeCount: 4,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Logos',
      tier: 'Tier A',
      ownerId: 'USR-NIOBE',
      status: 'Active',
      createdAt: pastDate(400),
      updatedAt: timestamp,
      createdBy: 'Kernel'
    },
    {
      id: 'ACC-HAMMER',
      name: 'Mjolnir (Hammer)',
      industry: 'Heavy Assault',
      website: 'hammer.zion',
      employeeCount: 12,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hammer',
      tier: 'Tier A',
      ownerId: 'USR-NEO',
      status: 'Active',
      createdAt: pastDate(450),
      updatedAt: timestamp,
      createdBy: 'Kernel'
    },
    {
      id: 'ACC-VIGILANT',
      name: 'Vigilant',
      industry: 'Patrol',
      website: 'vigilant.zion',
      employeeCount: 6,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vigilant',
      tier: 'Tier B',
      ownerId: 'USR-TRINITY',
      status: 'Active',
      createdAt: pastDate(350),
      updatedAt: timestamp,
      createdBy: 'Kernel'
    },
    {
      id: 'ACC-ICARUS',
      name: 'Icarus',
      industry: 'Exploration',
      website: 'icarus.zion',
      employeeCount: 5,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Icarus',
      tier: 'Tier B',
      ownerId: 'USR-LINK',
      status: 'Inactive',
      createdAt: pastDate(300),
      updatedAt: timestamp,
      createdBy: 'Kernel'
    },
  ];

  // 6. CONTACTS (Captains & Crew)
  const contacts: Contact[] = [
    // Nebuchadnezzar Crew
    { id: 'CON-MORPHEUS', name: 'Morpheus', accountId: 'ACC-NEBUCHADNEZZAR', email: 'morpheus@nebuchadnezzar.zion', phone: '+1-ZION-001', title: 'Captain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morpheus', ownerId: 'USR-MORPHEUS', isPrimary: true, createdAt: pastDate(500), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-NEO', name: 'Thomas Anderson (Neo)', accountId: 'ACC-NEBUCHADNEZZAR', email: 'neo@nebuchadnezzar.zion', phone: '+1-ZION-002', title: 'The One', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Neo', ownerId: 'USR-NEO', createdAt: pastDate(100), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-TRINITY', name: 'Trinity', accountId: 'ACC-NEBUCHADNEZZAR', email: 'trinity@nebuchadnezzar.zion', phone: '+1-ZION-003', title: 'First Mate', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trinity', ownerId: 'USR-TRINITY', createdAt: pastDate(450), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-TANK', name: 'Tank', accountId: 'ACC-NEBUCHADNEZZAR', email: 'tank@nebuchadnezzar.zion', phone: '+1-ZION-004', title: 'Operator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tank', ownerId: 'USR-LINK', createdAt: pastDate(480), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-DOZER', name: 'Dozer', accountId: 'ACC-NEBUCHADNEZZAR', email: 'dozer@nebuchadnezzar.zion', phone: '+1-ZION-005', title: 'Pilot', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dozer', ownerId: 'USR-LINK', createdAt: pastDate(480), updatedAt: timestamp, createdBy: 'Kernel' },

    // Logos Crew
    { id: 'CON-NIOBE', name: 'Niobe', accountId: 'ACC-LOGOS', email: 'niobe@logos.zion', phone: '+1-ZION-010', title: 'Captain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Niobe', ownerId: 'USR-NIOBE', isPrimary: true, createdAt: pastDate(400), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-GHOST', name: 'Ghost', accountId: 'ACC-LOGOS', email: 'ghost@logos.zion', phone: '+1-ZION-011', title: 'First Mate', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ghost', ownerId: 'USR-NIOBE', createdAt: pastDate(390), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-SPARKS', name: 'Sparks', accountId: 'ACC-LOGOS', email: 'sparks@logos.zion', phone: '+1-ZION-012', title: 'Operator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sparks', ownerId: 'USR-LINK', createdAt: pastDate(385), updatedAt: timestamp, createdBy: 'Kernel' },

    // Hammer Crew
    { id: 'CON-ROLAND', name: 'Roland', accountId: 'ACC-HAMMER', email: 'roland@hammer.zion', phone: '+1-ZION-020', title: 'Captain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roland', ownerId: 'USR-NEO', isPrimary: true, createdAt: pastDate(450), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-MAGGIE', name: 'Maggie', accountId: 'ACC-HAMMER', email: 'maggie@hammer.zion', phone: '+1-ZION-021', title: 'Medic', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maggie', ownerId: 'USR-NEO', createdAt: pastDate(440), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-AK', name: 'AK', accountId: 'ACC-HAMMER', email: 'ak@hammer.zion', phone: '+1-ZION-022', title: 'Gunner', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AK', ownerId: 'USR-TRINITY', createdAt: pastDate(435), updatedAt: timestamp, createdBy: 'Kernel' },

    // Vigilant Crew
    { id: 'CON-SOREN', name: 'Soren', accountId: 'ACC-VIGILANT', email: 'soren@vigilant.zion', phone: '+1-ZION-030', title: 'Captain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Soren', ownerId: 'USR-TRINITY', isPrimary: true, createdAt: pastDate(350), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CON-BINARY', name: 'Binary', accountId: 'ACC-VIGILANT', email: 'binary@vigilant.zion', phone: '+1-ZION-031', title: 'Operator', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Binary', ownerId: 'USR-LINK', createdAt: pastDate(340), updatedAt: timestamp, createdBy: 'Kernel' },

    // Icarus Crew
    { id: 'CON-AJAX', name: 'Ajax', accountId: 'ACC-ICARUS', email: 'ajax@icarus.zion', phone: '+1-ZION-040', title: 'Captain', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ajax', ownerId: 'USR-LINK', isPrimary: true, createdAt: pastDate(300), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 7. LEADS (Potentials still in the Matrix)
  const leads: Lead[] = [
    { id: 'LEAD-SMITH', name: 'Agent Smith', company: 'Machine City', email: 'smith@matrix.ai', phone: '+1-MACHINE-001', status: 'Nurturing', source: 'Direct', campaignId: 'CMP-REDPILL', estimatedValue: 0, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AgentSmith', score: 15, temperature: 'cold', ownerId: 'USR-NEO', address: { street: '01 Binary Boulevard', suburb: 'Machine Sector', state: 'Core', postcode: '00001', country: 'Machine City' }, lastContactDate: pastDate(45), notes: 'Approach with extreme caution. Former agent, unpredictable.', createdAt: pastDate(60), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'LEAD-MEROVINGIAN', name: 'The Merovingian', company: 'Club Hel', email: 'mero@clubhel.matrix', phone: '+1-MATRIX-002', status: 'Qualified', source: 'Referral', campaignId: 'CMP-ORACLE', estimatedValue: 500000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Merovingian', score: 65, temperature: 'warm', ownerId: 'USR-MORPHEUS', address: { street: '666 Underworld Lane', suburb: 'Le Vrai', state: 'Matrix Core', postcode: 'M6666', country: 'The Matrix' }, lastContactDate: pastDate(8), notes: 'Interested in information exchange. Speaks French when agitated.', createdAt: pastDate(45), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'LEAD-PERSEPHONE', name: 'Persephone', company: 'Club Hel', email: 'persephone@clubhel.matrix', phone: '+1-MATRIX-003', status: 'Qualified', source: 'Referral', campaignId: 'CMP-ORACLE', estimatedValue: 350000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Persephone', score: 78, temperature: 'hot', ownerId: 'USR-TRINITY', address: { street: '666 Underworld Lane', suburb: 'Le Vrai', state: 'Matrix Core', postcode: 'M6666', country: 'The Matrix' }, lastContactDate: pastDate(2), notes: 'Willing to help for the right price - a kiss from Neo.', createdAt: pastDate(30), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'LEAD-SERAPH', name: 'Seraph', company: 'Oracle Security', email: 'seraph@oracle.matrix', phone: '+1-MATRIX-004', status: 'New', source: 'LinkedIn', campaignId: 'CMP-REDPILL', estimatedValue: 200000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seraph', score: 88, temperature: 'hot', ownerId: 'USR-MORPHEUS', address: { street: '108 Teahouse Way', suburb: 'Chinatown', state: 'Downtown', postcode: 'M1008', country: 'The Matrix' }, lastContactDate: pastDate(5), notes: 'Guardian of the Oracle. Tests all visitors through combat.', createdAt: pastDate(7), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'LEAD-KID', name: 'The Kid', company: 'Self-Substantiation', email: 'kid@freed.matrix', phone: '+1-MATRIX-005', status: 'New', source: 'Search', campaignId: 'CMP-REDPILL', estimatedValue: 150000, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=TheKid', score: 92, temperature: 'hot', ownerId: 'USR-NEO', address: { street: '42 Main Street', suburb: 'Residential Zone', state: 'Suburbs', postcode: 'M4242', country: 'The Matrix' }, lastContactDate: pastDate(1), notes: 'Freed himself without red pill. Highly devoted to Neo.', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 8. DEALS (Mission Contracts)
  const deals: Deal[] = [
    { id: 'DEAL-NEB-REFIT', name: 'Nebuchadnezzar Refit Contract', accountId: 'ACC-NEBUCHADNEZZAR', contactId: 'CON-MORPHEUS', amount: 450000, stage: 'Closed Won', probability: 1.0, expectedCloseDate: pastDate(10), assigneeId: 'USR-MORPHEUS', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=NebRefit', campaignId: 'CMP-ZION', createdAt: pastDate(60), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'DEAL-LOGOS-MISSION', name: 'Logos Special Mission', accountId: 'ACC-LOGOS', contactId: 'CON-NIOBE', amount: 280000, stage: 'Negotiation', probability: 0.7, expectedCloseDate: futureDate(15), assigneeId: 'USR-NIOBE', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LogosMission', campaignId: 'CMP-ZION', createdAt: pastDate(30), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'DEAL-HAMMER-WEAPONS', name: 'Hammer Weapons Upgrade', accountId: 'ACC-HAMMER', contactId: 'CON-ROLAND', amount: 620000, stage: 'Proposal', probability: 0.4, expectedCloseDate: futureDate(45), assigneeId: 'USR-NEO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=HammerWeapons', campaignId: 'CMP-ZION', createdAt: pastDate(20), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'DEAL-VIGILANT-PATROL', name: 'Vigilant Extended Patrol', accountId: 'ACC-VIGILANT', contactId: 'CON-SOREN', amount: 175000, stage: 'Discovery', probability: 0.1, expectedCloseDate: futureDate(60), assigneeId: 'USR-TRINITY', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=VigilantPatrol', campaignId: 'CMP-ORACLE', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'DEAL-FLEET-TRAINING', name: 'Fleet-Wide Combat Training', accountId: 'ACC-NEBUCHADNEZZAR', contactId: 'CON-NEO', amount: 850000, stage: 'Negotiation', probability: 0.75, expectedCloseDate: futureDate(20), assigneeId: 'USR-NEO', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=FleetTraining', campaignId: 'CMP-REDPILL', createdAt: pastDate(15), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 9. INVOICES
  const invoices: Invoice[] = [
    { id: 'INV-NEB-001', invoiceNumber: 'INV-2026-0001', accountId: 'ACC-NEBUCHADNEZZAR', dealId: 'DEAL-NEB-REFIT', status: 'Paid', paymentStatus: 'paid', invoiceDate: pastDate(30), issueDate: pastDate(30), dueDate: pastDate(0), lineItems: [{ itemType: 'service', itemId: 'SRV-REPAIRS', description: 'Complete hull restoration', qty: 1, unitPrice: 450000, taxRate: 10, lineTotal: 495000 }], subtotal: 450000, taxTotal: 45000, total: 495000, ownerId: 'USR-MORPHEUS', createdAt: pastDate(30), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-LOGOS-001', invoiceNumber: 'INV-2026-0002', accountId: 'ACC-LOGOS', status: 'Sent', paymentStatus: 'unpaid', invoiceDate: pastDate(15), issueDate: pastDate(15), dueDate: futureDate(15), lineItems: [{ itemType: 'service', itemId: 'SRV-OPERATOR', description: 'Operator Support - Q1', qty: 3, unitPrice: 8000, taxRate: 10, lineTotal: 26400 }], subtotal: 24000, taxTotal: 2400, total: 26400, ownerId: 'USR-NIOBE', createdAt: pastDate(15), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-HAMMER-001', invoiceNumber: 'INV-2026-0003', accountId: 'ACC-HAMMER', status: 'Overdue', paymentStatus: 'unpaid', invoiceDate: pastDate(45), issueDate: pastDate(45), dueDate: pastDate(15), lineItems: [{ itemType: 'product', itemId: 'PRD-EMP', description: 'EMP Device x2', qty: 2, unitPrice: 250000, taxRate: 10, lineTotal: 550000 }], subtotal: 500000, taxTotal: 50000, total: 550000, ownerId: 'USR-NEO', createdAt: pastDate(45), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-VIG-001', invoiceNumber: 'INV-2026-0004', accountId: 'ACC-VIGILANT', status: 'Draft', paymentStatus: 'unpaid', invoiceDate: timestamp, issueDate: timestamp, dueDate: futureDate(30), lineItems: [{ itemType: 'service', itemId: 'SRV-SENTINEL', description: 'Annual Sentinel Watch', qty: 1, unitPrice: 120000, taxRate: 0, lineTotal: 120000 }], subtotal: 120000, taxTotal: 0, total: 120000, ownerId: 'USR-TRINITY', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 9.5 QUOTES
  const quotes: any[] = [
    { id: 'QT-NEB-001', quoteNumber: 'QT-2026-0001', accountId: 'ACC-NEBUCHADNEZZAR', dealId: 'DEAL-NEB-REFIT', status: 'Accepted', validUntil: pastDate(20), issueDate: pastDate(50), lineItems: [{ itemType: 'service', itemId: 'SRV-REPAIRS', description: 'Complete hull restoration', qty: 1, unitPrice: 450000, taxRate: 10, lineTotal: 495000 }], subtotal: 450000, taxTotal: 45000, total: 495000, ownerId: 'USR-MORPHEUS', createdAt: pastDate(50), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'QT-HAMMER-001', quoteNumber: 'QT-2026-0002', accountId: 'ACC-HAMMER', dealId: 'DEAL-HAMMER-WEAPONS', status: 'Sent', validUntil: futureDate(30), issueDate: pastDate(5), lineItems: [{ itemType: 'product', itemId: 'PRD-EMP', description: 'EMP Device x5', qty: 5, unitPrice: 250000, taxRate: 10, lineTotal: 1375000 }, { itemType: 'service', itemId: 'SRV-TRAINING', description: 'Weapons Training', qty: 1, unitPrice: 25000, taxRate: 10, lineTotal: 27500 }], subtotal: 1275000, taxTotal: 127500, total: 1402500, ownerId: 'USR-NEO', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'QT-LOGOS-001', quoteNumber: 'QT-2026-0003', accountId: 'ACC-LOGOS', dealId: 'DEAL-LOGOS-MISSION', status: 'Draft', validUntil: futureDate(45), issueDate: timestamp, lineItems: [{ itemType: 'service', itemId: 'SRV-OPERATOR', description: 'Extended Mission Support', qty: 6, unitPrice: 8000, taxRate: 10, lineTotal: 52800 }], subtotal: 48000, taxTotal: 4800, total: 52800, ownerId: 'USR-NIOBE', createdAt: timestamp, updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'QT-FLEET-001', quoteNumber: 'QT-2026-0004', accountId: 'ACC-NEBUCHADNEZZAR', dealId: 'DEAL-FLEET-TRAINING', status: 'Sent', validUntil: futureDate(20), issueDate: pastDate(10), lineItems: [{ itemType: 'service', itemId: 'SRV-TRAINING', description: 'Fleet-wide Combat Training', qty: 50, unitPrice: 25000, taxRate: 10, lineTotal: 1375000 }, { itemType: 'product', itemId: 'PRD-CONSTRUCT', description: 'Training Programs', qty: 10, unitPrice: 50000, taxRate: 10, lineTotal: 550000 }], subtotal: 1750000, taxTotal: 175000, total: 1925000, ownerId: 'USR-NEO', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'QT-VIG-001', quoteNumber: 'QT-2026-0005', accountId: 'ACC-VIGILANT', dealId: 'DEAL-VIGILANT-PATROL', status: 'Expired', validUntil: pastDate(5), issueDate: pastDate(60), lineItems: [{ itemType: 'service', itemId: 'SRV-SENTINEL', description: 'Sentinel Watch - 6 months', qty: 6, unitPrice: 10000, taxRate: 0, lineTotal: 60000 }], subtotal: 60000, taxTotal: 0, total: 60000, ownerId: 'USR-TRINITY', createdAt: pastDate(60), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 10. SUBSCRIPTIONS
  const subscriptions: Subscription[] = [
    { id: 'SUB-NEB', accountId: 'ACC-NEBUCHADNEZZAR', name: 'Nebuchadnezzar Full Support', status: 'Active', billingCycle: 'monthly', nextBillDate: futureDate(12), startDate: pastDate(180), items: [{ itemType: 'service', itemId: 'SRV-OPERATOR', description: 'Operator Support', qty: 1, unitPrice: 8000, taxRate: 10 }, { itemType: 'service', itemId: 'SRV-REPAIRS', description: 'Maintenance', qty: 1, unitPrice: 15000, taxRate: 10 }], autoGenerateInvoice: true, createdAt: pastDate(180), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'SUB-LOGOS', accountId: 'ACC-LOGOS', name: 'Logos Operations Package', status: 'Active', billingCycle: 'monthly', nextBillDate: futureDate(5), startDate: pastDate(120), items: [{ itemType: 'service', itemId: 'SRV-OPERATOR', description: 'Operator Support', qty: 1, unitPrice: 8000, taxRate: 10 }], autoGenerateInvoice: true, createdAt: pastDate(120), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'SUB-HAMMER', accountId: 'ACC-HAMMER', name: 'Hammer Defense Contract', status: 'Active', billingCycle: 'yearly', nextBillDate: futureDate(90), startDate: pastDate(275), items: [{ itemType: 'service', itemId: 'SRV-SENTINEL', description: 'Sentinel Early Warning', qty: 1, unitPrice: 120000, taxRate: 0 }], autoGenerateInvoice: true, createdAt: pastDate(275), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'SUB-VIG', accountId: 'ACC-VIGILANT', name: 'Vigilant Patrol Support', status: 'Paused', billingCycle: 'monthly', nextBillDate: futureDate(30), startDate: pastDate(90), items: [{ itemType: 'service', itemId: 'SRV-REPAIRS', description: 'Maintenance', qty: 1, unitPrice: 15000, taxRate: 10 }], autoGenerateInvoice: false, createdAt: pastDate(90), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 11. TASKS
  const tasks: Task[] = [
    { id: 'TSK-NEO-TRAIN', title: 'Complete Neo Combat Training', description: 'Upload remaining martial arts programs to Neo.', assigneeId: 'USR-LINK', dueDate: futureDate(2), status: 'In Progress', priority: 'High', relatedToId: 'CON-NEO', relatedToType: 'contacts', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'TSK-ORACLE-VISIT', title: 'Schedule Oracle Meeting', description: 'Arrange meeting with the Oracle for prophecy update.', assigneeId: 'USR-MORPHEUS', dueDate: futureDate(7), status: 'Pending', priority: 'High', relatedToId: 'LEAD-SERAPH', relatedToType: 'leads', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'TSK-LOGOS-CHECK', title: 'Pre-flight Check Logos', description: 'Complete pre-mission systems diagnostic.', assigneeId: 'USR-NIOBE', dueDate: futureDate(1), status: 'Pending', priority: 'Medium', relatedToId: 'ACC-LOGOS', relatedToType: 'accounts', createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'TSK-INVOICE-FOLLOW', title: 'Follow up on Hammer Invoice', description: 'Contact Roland about overdue payment.', assigneeId: 'USR-TRINITY', dueDate: pastDate(2), status: 'Pending', priority: 'Urgent', relatedToId: 'INV-HAMMER-001', relatedToType: 'invoices', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'TSK-TRAINING-PREP', title: 'Prepare Training Constructs', description: 'Load combat simulations for fleet-wide training.', assigneeId: 'USR-LINK', dueDate: futureDate(14), status: 'Pending', priority: 'Medium', relatedToId: 'DEAL-FLEET-TRAINING', relatedToType: 'deals', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'USR-NEO' },
  ];

  // 12. TICKETS (Support Requests)
  const tickets: Ticket[] = [
    { id: 'TKT-001', subject: 'EMP Device Not Charging', requesterId: 'CON-ROLAND', accountId: 'ACC-HAMMER', status: 'Open', priority: 'Urgent', assigneeId: 'USR-LINK', messages: [{ sender: 'Roland', senderId: 'CON-ROLAND', text: 'Our EMP device shows 0% charge and wont power up. Sentinels incoming!', time: pastDate(1), isMe: false, isBot: false }], internalNotes: [], createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'CON-ROLAND' },
    { id: 'TKT-002', subject: 'Operator Console Flickering', requesterId: 'CON-SPARKS', accountId: 'ACC-LOGOS', status: 'In Progress', priority: 'High', assigneeId: 'USR-LINK', messages: [{ sender: 'Sparks', senderId: 'CON-SPARKS', text: 'Main operator console display keeps flickering during Matrix operations.', time: pastDate(3), isMe: false, isBot: false }, { sender: 'Link', senderId: 'USR-LINK', text: 'Running diagnostics now. Can you describe when it started?', time: pastDate(2), isMe: true, isBot: false }], internalNotes: [{ sender: 'Link', senderId: 'USR-LINK', text: 'Likely power coupling issue - ordering replacement part.', time: pastDate(1), isMe: true, isBot: false }], createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'CON-SPARKS' },
    { id: 'TKT-003', subject: 'Training Upload Failed', requesterId: 'CON-BINARY', accountId: 'ACC-VIGILANT', status: 'Open', priority: 'Medium', assigneeId: 'USR-NEO', messages: [{ sender: 'Binary', senderId: 'CON-BINARY', text: 'Kung Fu upload stuck at 47% for crew member. System shows memory buffer error.', time: pastDate(2), isMe: false, isBot: false }], internalNotes: [], createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'CON-BINARY' },
    { id: 'TKT-004', subject: 'Request: Additional Hardlines', requesterId: 'CON-MORPHEUS', accountId: 'ACC-NEBUCHADNEZZAR', status: 'Resolved', priority: 'Low', assigneeId: 'USR-TRINITY', messages: [{ sender: 'Morpheus', senderId: 'CON-MORPHEUS', text: 'We need 3 additional hardline phone locations mapped for downtown extraction zone.', time: pastDate(10), isMe: false, isBot: false }, { sender: 'Trinity', senderId: 'USR-TRINITY', text: 'Mapped and uploaded to your navigation system. Stay safe.', time: pastDate(8), isMe: true, isBot: false }], internalNotes: [], resolvedAt: pastDate(8), createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'CON-MORPHEUS' },
    { id: 'TKT-005', subject: 'Sentinel Detection False Positives', requesterId: 'CON-GHOST', accountId: 'ACC-LOGOS', status: 'Open', priority: 'High', assigneeId: 'USR-NIOBE', messages: [{ sender: 'Ghost', senderId: 'CON-GHOST', text: 'Early warning system triggered 5 false alarms in the past 24 hours. Crew is exhausted from emergency drills.', time: pastDate(0), isMe: false, isBot: false }], internalNotes: [], createdAt: pastDate(0), updatedAt: timestamp, createdBy: 'CON-GHOST' },
  ];

  // 13. COMMUNICATIONS
  const communications: Communication[] = [
    { id: 'COM-001', type: 'Call', subject: 'Prophecy Discussion', content: 'Discussed latest prophecy interpretations with Morpheus. He believes Neo is ready.', direction: 'Outbound', relatedToType: 'contacts', relatedToId: 'CON-MORPHEUS', outcome: 'answered', duration: '45 min', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'COM-002', type: 'Email', subject: 'Mission Briefing: Machine City', content: 'Attached mission parameters for the upcoming Machine City reconnaissance. Review before departure.', direction: 'Outbound', relatedToType: 'accounts', relatedToId: 'ACC-LOGOS', outcome: 'answered', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'COM-003', type: 'Call', subject: 'Overdue Payment Discussion', content: 'Called Roland about the outstanding invoice. He mentioned supply chain issues delaying Zion credits.', direction: 'Outbound', relatedToType: 'contacts', relatedToId: 'CON-ROLAND', outcome: 'answered', duration: '15 min', createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'COM-004', type: 'SMS', subject: 'Exit Point Confirmed', content: 'Hardline at 42nd & Main confirmed operational. 3am extraction window.', direction: 'Outbound', relatedToType: 'leads', relatedToId: 'LEAD-KID', outcome: 'answered', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'COM-005', type: 'Email', subject: 'Red Pill Candidate Assessment', content: 'Seraph shows exceptional awareness. Recommend immediate extraction protocol.', direction: 'Inbound', relatedToType: 'leads', relatedToId: 'LEAD-SERAPH', outcome: 'meeting-booked', createdAt: pastDate(0), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
  ];

  // 13.5 CALENDAR EVENTS
  const calendarEvents: CalendarEvent[] = [
    { id: 'CAL-001', title: 'Oracle Consultation', description: 'Meeting with the Oracle to discuss prophecy and next steps', startTime: futureDate(2), endTime: futureDate(2), type: 'Meeting', location: 'Oracle Teahouse', relatedToType: 'leads', relatedToId: 'LEAD-SERAPH', ownerId: 'USR-NEO', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CAL-002', title: 'Fleet Command Meeting', description: 'Quarterly strategy session with all captains', startTime: futureDate(7), endTime: futureDate(7), type: 'Meeting', location: 'Zion Council Chambers', relatedToType: 'accounts', relatedToId: 'ACC-LOGOS', ownerId: 'USR-NIOBE', createdAt: pastDate(15), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'CAL-003', title: 'Nebuchadnezzar Maintenance', description: 'Scheduled maintenance window - ship offline', startTime: futureDate(14), endTime: futureDate(14), type: 'Internal', location: 'Zion Dock 7', relatedToType: 'accounts', relatedToId: 'ACC-NEBUCHADNEZZAR', ownerId: 'USR-MORPHEUS', createdAt: pastDate(20), updatedAt: timestamp, createdBy: 'USR-LINK' },
    { id: 'CAL-004', title: 'Neo Training Session', description: 'Advanced combat training in the Construct', startTime: futureDate(1), endTime: futureDate(1), type: 'Internal', location: 'Construct Loading Program', relatedToType: 'contacts', relatedToId: 'CON-NEO', ownerId: 'USR-NEO', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CAL-005', title: 'Payment Follow-up Call', description: 'Call Roland about overdue invoice', startTime: futureDate(3), endTime: futureDate(3), type: 'Call', location: 'Phone', relatedToType: 'invoices', relatedToId: 'INV-HAMMER-001', ownerId: 'USR-TRINITY', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'CAL-006', title: 'Red Pill Delivery', description: 'Candidate extraction meeting', startTime: futureDate(4), endTime: futureDate(4), type: 'Meeting', location: 'Metacortex Building', relatedToType: 'leads', relatedToId: 'LEAD-KID', ownerId: 'USR-MORPHEUS', createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CAL-007', title: 'Sentinel Patrol Briefing', description: 'Weekly security update and patrol routes', startTime: futureDate(5), endTime: futureDate(5), type: 'Meeting', location: 'War Room', relatedToType: 'accounts', relatedToId: 'ACC-VIGILANT', ownerId: 'USR-TRINITY', createdAt: pastDate(7), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'CAL-008', title: 'Deal Negotiation - Hammer Weapons', description: 'Finalize weapons upgrade contract', startTime: futureDate(10), endTime: futureDate(10), type: 'Meeting', location: 'Hammer Ship', relatedToType: 'deals', relatedToId: 'DEAL-HAMMER-WEAPONS', ownerId: 'USR-NEO', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'CAL-009', title: 'Quarterly Revenue Review', description: 'Financial performance analysis Q1 2026', startTime: futureDate(21), endTime: futureDate(21), type: 'Internal', location: 'Zion Finance Office', ownerId: 'USR-NEO', createdAt: pastDate(30), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'CAL-010', title: 'Matrix Dive - Candidate Surveillance', description: 'Monitor high-potential candidate behavior', startTime: futureDate(6), endTime: futureDate(6), type: 'Internal', location: 'Matrix Simulation', relatedToType: 'leads', relatedToId: 'LEAD-MEROVINGIAN', ownerId: 'USR-TRINITY', createdAt: pastDate(4), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
  ];

  // 14. DOCUMENTS
  const documents: Document[] = [
    { id: 'DOC-001', title: 'Nebuchadnezzar Schematics v3.2', fileType: 'PDF', fileSize: '4.2 MB', url: '#', relatedToType: 'accounts', relatedToId: 'ACC-NEBUCHADNEZZAR', createdAt: pastDate(100), updatedAt: timestamp, createdBy: 'USR-LINK' },
    { id: 'DOC-002', title: 'Combat Training Curriculum', fileType: 'PDF', fileSize: '12.8 MB', url: '#', relatedToType: 'deals', relatedToId: 'DEAL-FLEET-TRAINING', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'DOC-003', title: 'Matrix Entry Points Map', fileType: 'PDF', fileSize: '2.1 MB', url: '#', relatedToType: 'accounts', relatedToId: 'ACC-LOGOS', createdAt: pastDate(50), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'DOC-004', title: 'EMP Operations Manual', fileType: 'PDF', fileSize: '1.5 MB', url: '#', relatedToType: 'products', relatedToId: 'PRD-EMP', createdAt: pastDate(200), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 15. AUDIT LOGS (Recent Activity)
  const auditLogs: AuditLog[] = [
    { id: 'LOG-001', entityType: 'leads', entityId: 'LEAD-KID', action: 'Lead Created', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'LOG-002', entityType: 'deals', entityId: 'DEAL-FLEET-TRAINING', action: 'Deal Stage Changed', newValue: 'Negotiation', createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'LOG-003', entityType: 'tickets', entityId: 'TKT-004', action: 'Ticket Resolved', createdAt: pastDate(8), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'LOG-004', entityType: 'invoices', entityId: 'INV-NEB-001', action: 'Payment Received', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'LOG-005', entityType: 'contacts', entityId: 'CON-NEO', action: 'Contact Updated', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'USR-NEO' },
  ];

  // 16. CREWS (Field Teams)
  const crews: Crew[] = [
    { id: 'CREW-ALPHA', name: 'Alpha Strike Team', leaderId: 'USR-NEO', memberIds: ['USR-NEO', 'USR-TRINITY', 'USR-MORPHEUS'], color: '#3B82F6', createdAt: pastDate(90), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'CREW-BRAVO', name: 'Bravo Extraction', leaderId: 'USR-NIOBE', memberIds: ['USR-NIOBE', 'USR-LINK'], color: '#10B981', createdAt: pastDate(90), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 17. ZONES
  const zones: Zone[] = [
    { id: 'ZONE-DOWNTOWN', name: 'Downtown', region: 'Megacity Core', description: 'High-traffic area with multiple hardlines', color: '#EF4444', createdAt: pastDate(120), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'ZONE-INDUSTRIAL', name: 'Industrial', region: 'Factory District', description: 'Sentinel patrol routes nearby', color: '#F59E0B', createdAt: pastDate(120), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'ZONE-RESIDENTIAL', name: 'Residential', region: 'Suburbs', description: 'Lower security, limited exit points', color: '#3B82F6', createdAt: pastDate(120), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 18. JOBS (Field Operations)
  const jobs: Job[] = [
    { id: 'JOB-001', jobNumber: 'J-2026-0001', subject: 'Extract The Kid', description: 'Red pill candidate extraction from self-substantiation', accountId: 'ACC-NEBUCHADNEZZAR', assigneeId: 'USR-NEO', crewId: 'CREW-ALPHA', jobType: 'Emergency', status: 'Scheduled', priority: 'Urgent', zone: 'Downtown', estimatedDuration: 2, scheduledDate: futureDate(1), lat: -37.8136, lng: 144.9631, createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'JOB-002', jobNumber: 'J-2026-0002', subject: 'Logos Systems Check', description: 'Full diagnostic before Machine City mission', accountId: 'ACC-LOGOS', assigneeId: 'USR-NIOBE', crewId: 'CREW-BRAVO', jobType: 'Inspection', status: 'InProgress', priority: 'High', zone: 'Industrial', estimatedDuration: 4, scheduledDate: pastDate(0), lat: -37.8200, lng: 144.9500, createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
    { id: 'JOB-003', jobNumber: 'J-2026-0003', subject: 'EMP Installation - Hammer', description: 'Install and calibrate new EMP devices', accountId: 'ACC-HAMMER', assigneeId: 'USR-LINK', crewId: 'CREW-ALPHA', jobType: 'Install', status: 'Scheduled', priority: 'Medium', zone: 'Industrial', estimatedDuration: 6, scheduledDate: futureDate(5), lat: -37.8100, lng: 144.9700, createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'USR-NEO' },
  ];

  // 19. EQUIPMENT
  const equipment: Equipment[] = [
    { id: 'EQ-001', name: 'Operator Console Alpha', type: 'Console', barcode: 'EQ-000001', condition: 'Excellent', location: 'Nebuchadnezzar', assignedTo: 'USR-LINK', lastServiceDate: pastDate(30), nextServiceDate: futureDate(60), purchaseDate: pastDate(365), purchasePrice: 50000, createdAt: pastDate(365), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'EQ-002', name: 'Hovercraft Engine Unit', type: 'Engine', barcode: 'EQ-000002', condition: 'Good', location: 'Zion Dock', lastServiceDate: pastDate(60), nextServiceDate: futureDate(30), purchaseDate: pastDate(500), purchasePrice: 150000, createdAt: pastDate(500), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'EQ-003', name: 'EMP Charging Station', type: 'Charger', barcode: 'EQ-000003', condition: 'Fair', location: 'Hammer', assignedTo: 'USR-NEO', lastServiceDate: pastDate(90), nextServiceDate: pastDate(10), purchaseDate: pastDate(400), purchasePrice: 25000, createdAt: pastDate(400), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 20. INVENTORY
  const inventoryItems: InventoryItem[] = [
    { id: 'INV-001', name: 'Red Pills', sku: 'MED-RED', warehouseQty: 47, reorderPoint: 20, category: 'Medical', unitPrice: 999999, createdAt: pastDate(365), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-002', name: 'Blue Pills', sku: 'MED-BLUE', warehouseQty: 0, reorderPoint: 0, category: 'Medical', unitPrice: 0, createdAt: pastDate(365), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-003', name: 'EMP Capacitors', sku: 'WEAP-CAP', warehouseQty: 15, reorderPoint: 5, category: 'Weapons', unitPrice: 5000, createdAt: pastDate(365), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-004', name: 'Hardline Phones', sku: 'COMM-HARD', warehouseQty: 8, reorderPoint: 10, category: 'Communications', unitPrice: 15000, createdAt: pastDate(365), updatedAt: timestamp, createdBy: 'Kernel' },
    { id: 'INV-005', name: 'Neural Interface Plugs', sku: 'TECH-PLUG', warehouseQty: 50, reorderPoint: 20, category: 'Technology', unitPrice: 2500, createdAt: pastDate(365), updatedAt: timestamp, createdBy: 'Kernel' },
  ];

  // 21. PURCHASE ORDERS
  const purchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', poNumber: 'PO-2026-0001', supplierId: 'ACC-HAMMER', accountId: 'ACC-NEBUCHADNEZZAR', status: 'Delivered', items: [{ sku: 'WEAP-CAP', name: 'EMP Capacitors', qty: 10, price: 5000 }], total: 50000, linkedJobId: 'JOB-003', createdAt: pastDate(30), updatedAt: pastDate(15), createdBy: 'USR-LINK' },
    { id: 'PO-002', poNumber: 'PO-2026-0002', supplierId: 'ACC-LOGOS', accountId: 'ACC-VIGILANT', status: 'Ordered', items: [{ sku: 'COMM-HARD', name: 'Hardline Phones', qty: 5, price: 15000 }], total: 75000, createdAt: pastDate(10), updatedAt: pastDate(5), createdBy: 'USR-NIOBE' },
  ];

  // 22. BANK TRANSACTIONS
  const bankTransactions: BankTransaction[] = [
    { id: 'BANK-001', date: pastDate(5), description: 'Payment Received - INV-2026-0001', amount: 495000, type: 'Credit', status: 'matched', matchConfidence: 'green', matchedToId: 'INV-NEB-001', matchedToType: 'invoices', reconciled: true, reconciledAt: pastDate(4), reconciledBy: 'USR-NEO', bankReference: 'TXN-001-NEB', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-002', date: pastDate(10), description: 'Supplier Payment - EMP Parts', amount: 50000, type: 'Debit', status: 'matched', matchConfidence: 'green', matchedToId: 'EXP-002', matchedToType: 'expenses', reconciled: true, reconciledAt: pastDate(9), reconciledBy: 'USR-TRINITY', bankReference: 'TXN-002-SUP', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-003', date: pastDate(2), description: 'Unidentified Transfer', amount: 25000, type: 'Credit', status: 'unmatched', matchConfidence: 'amber', reconciled: false, bankReference: 'TXN-003-UNK', createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-004', date: pastDate(1), description: 'Zion Council Grant', amount: 100000, type: 'Credit', status: 'unmatched', matchConfidence: 'none', reconciled: false, bankReference: 'TXN-004-ZCG', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-005', date: pastDate(3), description: 'Fuel Purchase - Zion Power', amount: 15000, type: 'Debit', status: 'unmatched', matchConfidence: 'green', reconciled: false, bankReference: 'TXN-005-FUEL', notes: 'Matches expense EXP-001', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-006', date: pastDate(7), description: 'Training Program Fee', amount: 25000, type: 'Credit', status: 'unmatched', matchConfidence: 'amber', reconciled: false, bankReference: 'TXN-006-TRN', createdAt: pastDate(7), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-007', date: pastDate(12), description: 'Operator Console Parts', amount: 8500, type: 'Debit', status: 'unmatched', matchConfidence: 'green', reconciled: false, bankReference: 'TXN-007-OPR', notes: 'Potential match: EXP-002', createdAt: pastDate(12), updatedAt: timestamp, createdBy: 'System' },
    { id: 'BANK-008', date: pastDate(15), description: 'Logos Operations Payment', amount: 26400, type: 'Credit', status: 'unmatched', matchConfidence: 'green', reconciled: false, bankReference: 'TXN-008-LOG', notes: 'Matches INV-LOGOS-001', createdAt: pastDate(15), updatedAt: timestamp, createdBy: 'System' },
  ];

  // 23. EXPENSES
  const expenses: Expense[] = [
    { id: 'EXP-001', vendor: 'Zion Power Grid', amount: 15000, category: 'Fuel', date: pastDate(5), status: 'Paid', receiptUrl: '#', approvedBy: 'USR-MORPHEUS', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'USR-LINK' },
    { id: 'EXP-002', vendor: 'Machine Parts Salvage', amount: 8500, category: 'Materials', date: pastDate(10), status: 'Paid', receiptUrl: '#', approvedBy: 'USR-NIOBE', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'EXP-003', vendor: 'Oracle Consulting', amount: 0, category: 'Other', date: pastDate(3), status: 'Paid', notes: 'Cookies provided as payment', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'USR-NEO' },
  ];

  // 24. REVIEWS
  const reviews: Review[] = [
    { id: 'REV-001', authorName: 'Councillor Hamann', rating: 5, content: 'The Nebuchadnezzar crew saved Zion. Outstanding service. Their dedication to the cause is unmatched.', platform: 'Google', status: 'Replied', replied: true, replyContent: 'Thank you, Councillor. The fight continues. We are honored to serve Zion.', repliedAt: pastDate(5), sentiment: 'Positive', accountId: 'ACC-NEBUCHADNEZZAR', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-002', authorName: 'Anonymous Freed Mind', rating: 5, content: 'The red pill changed my life. I see everything clearly now. Forever grateful to Morpheus and the crew.', platform: 'Facebook', status: 'New', replied: false, sentiment: 'Positive', createdAt: pastDate(2), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-003', authorName: 'Commander Lock', rating: 3, content: 'Morpheus takes too many risks. Results are mixed. We need more conservative strategies for the defense of Zion.', platform: 'Internal', status: 'Escalated', replied: false, sentiment: 'Neutral', createdAt: pastDate(15), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-004', authorName: 'Sarah Chen', rating: 5, content: 'Training program exceeded expectations. Neo is an incredible instructor. Combat skills improved dramatically.', platform: 'Google', status: 'Replied', replied: true, replyContent: 'Thank you for your feedback! Neo and our team are committed to excellence. Stay strong.', repliedAt: pastDate(3), sentiment: 'Positive', createdAt: pastDate(8), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-005', authorName: 'Agent Program #4738', rating: 1, content: 'These rebels are a threat to order and must be eliminated. Their operations disrupt the system.', platform: 'Yelp', status: 'New', replied: false, sentiment: 'Negative', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-006', authorName: 'Freed Mind Collective', rating: 5, content: 'Zion operations are professional and life-saving. The extraction team got me out safely. Highly recommend.', platform: 'Trustpilot', status: 'New', replied: false, sentiment: 'Positive', createdAt: pastDate(4), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-007', authorName: 'Captain Soren', rating: 4, content: 'Solid support from the Logos crew. Response times are excellent, though supply chain could be faster.', platform: 'Google', status: 'Replied', replied: true, replyContent: 'Thank you Captain! We are working on improving supply logistics. Stay vigilant.', repliedAt: pastDate(6), sentiment: 'Positive', accountId: 'ACC-VIGILANT', createdAt: pastDate(12), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-008', authorName: 'Skeptical Mind', rating: 2, content: 'The whole red pill thing sounds crazy. Not sure if I made the right choice. Reality is hard.', platform: 'Internal', status: 'Escalated', replied: false, sentiment: 'Negative', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-009', authorName: 'Roland', rating: 5, content: 'The Hammer received excellent weapons upgrades. EMP devices are working perfectly. Great work!', platform: 'Facebook', status: 'New', replied: false, sentiment: 'Positive', accountId: 'ACC-HAMMER', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REV-010', authorName: 'Oracle Visitor', rating: 5, content: 'Meeting with the Oracle was life-changing. Prophecy guidance is invaluable. Seraph is a great host.', platform: 'Trustpilot', status: 'New', replied: false, sentiment: 'Positive', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'System' },
  ];

  // 25. REFERRAL REWARDS
  const referralRewards: ReferralReward[] = [
    { id: 'REF-001', referrerId: 'CON-TRINITY', referredLeadId: 'LEAD-KID', rewardAmount: 500, status: 'Paid', payoutDate: pastDate(2), notes: 'Kid self-freed - exceptional case', createdAt: pastDate(10), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REF-002', referrerId: 'CON-MORPHEUS', referredLeadId: 'LEAD-SERAPH', rewardAmount: 1000, status: 'Pending Payout', notes: 'Guardian referral - awaiting extraction completion', createdAt: pastDate(5), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REF-003', referrerId: 'CON-NIOBE', referredLeadId: 'LEAD-MEROVINGIAN', rewardAmount: 750, status: 'Active', notes: 'High-value target - information broker', createdAt: pastDate(3), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REF-004', referrerId: 'CON-GHOST', referredLeadId: 'LEAD-PERSEPHONE', rewardAmount: 850, status: 'Pending Payout', notes: 'Insider contact - strategic value', createdAt: pastDate(8), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REF-005', referrerId: 'CON-TRINITY', referredLeadId: 'LEAD-SMITH', rewardAmount: 0, status: 'Cancelled', notes: 'Agent compromised - referral invalidated', createdAt: pastDate(20), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REF-006', referrerId: 'CON-NEO', referredLeadId: 'LEAD-KID', rewardAmount: 500, status: 'Paid', payoutDate: pastDate(1), notes: 'Mentorship bonus for The One program', createdAt: pastDate(12), updatedAt: timestamp, createdBy: 'System' },
    { id: 'REF-007', referrerId: 'CON-TANK', referredLeadId: 'LEAD-SERAPH', rewardAmount: 600, status: 'Active', notes: 'Technical referral - operator candidate', createdAt: pastDate(1), updatedAt: timestamp, createdBy: 'System' },
  ];

  // 26. INBOUND FORMS
  const inboundForms: InboundForm[] = [
    { id: 'FORM-REDPILL', name: 'Red Pill Application', type: 'Lead', fields: [{ id: 'name', label: 'Full Name', type: 'text', required: true }, { id: 'email', label: 'Email Address', type: 'email', required: true }, { id: 'awareness', label: 'Awareness Level', type: 'select', required: true, options: ['Curious', 'Suspicious', 'Awakening', 'Ready'] }], submitButtonText: 'Take the Red Pill', successMessage: 'Welcome to the real world. A crew member will contact you soon.', targetCampaignId: 'CMP-REDPILL', submissionCount: 47, conversionRate: 68, status: 'Active', embedCode: '<iframe src="https://forms.zion/redpill" />', createdAt: pastDate(180), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'FORM-CONTACT', name: 'General Contact Form', type: 'Contact', fields: [{ id: 'name', label: 'Name', type: 'text', required: true }, { id: 'email', label: 'Email', type: 'email', required: true }, { id: 'phone', label: 'Phone', type: 'phone', required: false }, { id: 'message', label: 'Message', type: 'text', required: true }], submitButtonText: 'Send Message', successMessage: 'Thank you! We will respond within 24 hours.', submissionCount: 128, conversionRate: 42, status: 'Active', createdAt: pastDate(240), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'FORM-QUOTE', name: 'Training Quote Request', type: 'Quote Request', fields: [{ id: 'company', label: 'Ship Name', type: 'text', required: true }, { id: 'training-type', label: 'Training Type', type: 'select', required: true, options: ['Combat', 'Hacking', 'Piloting', 'Operator'] }, { id: 'crew-size', label: 'Crew Size', type: 'text', required: true }], submitButtonText: 'Get Quote', successMessage: 'Quote request received. We will send pricing within 48 hours.', targetCampaignId: 'CMP-ZION', submissionCount: 23, conversionRate: 87, status: 'Active', createdAt: pastDate(90), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'FORM-SUPPORT', name: 'Support Request', type: 'Support', fields: [{ id: 'subject', label: 'Subject', type: 'text', required: true }, { id: 'priority', label: 'Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High', 'Urgent'] }, { id: 'description', label: 'Description', type: 'text', required: true }, { id: 'file', label: 'Attachment', type: 'file', required: false }], submitButtonText: 'Submit Ticket', successMessage: 'Support ticket created. Ticket ID will be sent to your email.', submissionCount: 85, conversionRate: 100, status: 'Active', createdAt: pastDate(200), updatedAt: timestamp, createdBy: 'USR-LINK' },
  ];

  // 27. CHAT WIDGETS
  const chatWidgets: ChatWidget[] = [
    { id: 'CHAT-ZION', name: 'Zion Support', page: 'Homepage', bubbleColor: '#3B82F6', welcomeMessage: 'Welcome to Zion Command. How can we assist you today?', isActive: true, status: 'Active', routingUserId: 'USR-LINK', conversations: 342, avgResponseTime: 180, createdAt: pastDate(200), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'CHAT-SALES', name: 'Sales Inquiry Widget', page: 'Services', bubbleColor: '#10B981', welcomeMessage: 'Interested in our training programs? Let us help you!', isActive: true, status: 'Active', routingUserId: 'USR-MORPHEUS', conversations: 156, avgResponseTime: 240, createdAt: pastDate(150), updatedAt: timestamp, createdBy: 'USR-TRINITY' },
    { id: 'CHAT-EMERGENCY', name: 'Emergency Extraction', page: 'Extraction', bubbleColor: '#EF4444', welcomeMessage: 'URGENT: If you need immediate extraction, start chatting now.', isActive: true, status: 'Active', routingUserId: 'USR-NEO', conversations: 47, avgResponseTime: 60, createdAt: pastDate(180), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
  ];

  // 28. CALCULATORS
  const calculators: Calculator[] = [
    { id: 'CALC-AWARE', name: 'Awareness Score Calculator', type: 'ROI', baseRate: 15, isActive: true, status: 'Active', usageCount: 847, leadConversionRate: 68, createdAt: pastDate(240), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
    { id: 'CALC-TRAINING', name: 'Training Cost Calculator', type: 'Repayment', baseRate: 5, isActive: true, status: 'Active', usageCount: 234, leadConversionRate: 82, createdAt: pastDate(180), updatedAt: timestamp, createdBy: 'USR-NEO' },
    { id: 'CALC-DEFENSE', name: 'Defense ROI Calculator', type: 'SolarYield', baseRate: 12, isActive: true, status: 'Active', usageCount: 145, leadConversionRate: 75, createdAt: pastDate(120), updatedAt: timestamp, createdBy: 'USR-NIOBE' },
  ];

  // 29. AUTOMATION WORKFLOWS
  const automationWorkflows: AutomationWorkflow[] = [
    { id: 'WF-REDPILL', name: 'Red Pill Candidate → Assign Morpheus', description: 'Auto-assign hot leads to Morpheus for extraction', trigger: { type: 'RecordCreated', entity: 'leads', config: {} }, nodes: [{ id: 'node-1', type: 'Action', actionType: 'AssignOwner', config: { ownerId: 'USR-MORPHEUS' } }], isActive: true, executionCount: 47, lastRunAt: pastDate(1), category: 'Sales', createdAt: pastDate(180), updatedAt: timestamp, createdBy: 'USR-NEO' },
  ];

  // 30. WEBHOOKS
  const webhooks: Webhook[] = [
    { id: 'WEBHOOK-ZION', name: 'Zion Command Alert', url: 'https://zion.io/api/alerts', method: 'POST', headers: { 'Authorization': 'Bearer ***' }, isActive: true, triggerEvent: 'ticket.urgent', lastTriggeredAt: pastDate(1), successCount: 23, failureCount: 0, createdAt: pastDate(200), updatedAt: timestamp, createdBy: 'USR-NEO' },
  ];

  // 31. INDUSTRY TEMPLATES
  const industryTemplates: IndustryTemplate[] = [
    { id: 'TMPL-EXTRACTION', name: 'Extraction Mission Template', targetEntity: 'jobs', industry: 'Resistance Operations', sections: [{ id: 'sec-target', title: 'Target Details', fields: [{ id: 'codename', label: 'Codename', type: 'text', required: true }, { id: 'location', label: 'Matrix Location', type: 'text', required: true }] }], isActive: true, version: 1, createdAt: pastDate(300), updatedAt: timestamp, createdBy: 'USR-MORPHEUS' },
  ];

  return {
    users,
    products,
    services,
    campaigns,
    leads,
    accounts,
    contacts,
    deals,
    invoices,
    quotes,
    subscriptions,
    tasks,
    tickets,
    calendarEvents,
    documents,
    communications,
    auditLogs,
    crews,
    jobs,
    zones,
    equipment,
    inventoryItems,
    purchaseOrders,
    bankTransactions,
    expenses,
    reviews,
    referralRewards,
    inboundForms,
    chatWidgets,
    calculators,
    automationWorkflows,
    webhooks,
    industryTemplates,
    currentUserId: 'USR-NEO'
  };
};
