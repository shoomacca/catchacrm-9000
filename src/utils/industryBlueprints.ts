/**
 * Industry Blueprint Definitions
 * Pre-configured templates for different industries
 */

import { IndustryBlueprint, IndustryType } from '../types';

export const INDUSTRY_BLUEPRINTS: Record<IndustryType, IndustryBlueprint> = {
  // === GENERAL BUSINESS ===
  general: {
    id: 'general',
    name: 'General Business',
    type: 'general',
    description: 'Standard CRM for any business type',
    icon: '🏢',
    customEntities: [],
    customFields: {},
    requiredFields: {},
    pipelines: [
      {
        id: 'default-lead',
        name: 'Lead Pipeline',
        entityType: 'leads',
        stages: [
          { label: 'New', probability: 10, color: '#94a3b8', order: 1 },
          { label: 'Contacted', probability: 25, color: '#60a5fa', order: 2 },
          { label: 'Qualified', probability: 50, color: '#fbbf24', order: 3 },
          { label: 'Proposal', probability: 75, color: '#f59e0b', order: 4 },
        ],
        isDefault: true,
      },
    ],
    statuses: {
      leads: ['New', 'Contacted', 'Qualified', 'Proposal', 'Won', 'Lost'],
      deals: ['Discovery', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    },
    integrations: ['stripe', 'sendgrid', 'twilio'],
    modules: {
      enabled: ['salesEngine', 'financials', 'marketing'],
      disabled: [],
    },
  },

  // === REAL ESTATE ===
  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    type: 'real_estate',
    description: 'For real estate agents, brokers, and property management',
    icon: '🏠',
    customEntities: [
      {
        id: 'properties',
        name: 'Property',
        namePlural: 'Properties',
        icon: '🏘️',
        fields: [
          { id: 'address', label: 'Address', type: 'text', required: true },
          { id: 'propertyType', label: 'Property Type', type: 'select', options: ['Residential', 'Commercial', 'Land', 'Multi-Family'], required: true },
          { id: 'bedrooms', label: 'Bedrooms', type: 'number', required: false },
          { id: 'bathrooms', label: 'Bathrooms', type: 'number', required: false },
          { id: 'sqft', label: 'Square Feet', type: 'number', required: false },
          { id: 'lotSize', label: 'Lot Size (acres)', type: 'number', required: false },
          { id: 'yearBuilt', label: 'Year Built', type: 'number', required: false },
          { id: 'listPrice', label: 'List Price', type: 'number', required: true },
          { id: 'status', label: 'Status', type: 'select', options: ['Available', 'Under Contract', 'Sold', 'Off Market'], required: true },
          { id: 'mlsNumber', label: 'MLS Number', type: 'text', required: false },
          { id: 'virtualTourUrl', label: 'Virtual Tour URL', type: 'text', required: false },
          { id: 'keyLocation', label: 'Key Location', type: 'text', required: false },
        ],
        relationTo: ['accounts', 'contacts', 'deals'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: true,
      },
      {
        id: 'showings',
        name: 'Showing',
        namePlural: 'Showings',
        icon: '🗓️',
        fields: [
          { id: 'propertyId', label: 'Property', type: 'text', required: true },
          { id: 'scheduledDate', label: 'Date & Time', type: 'date', required: true },
          { id: 'contactId', label: 'Contact', type: 'text', required: true },
          { id: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled', 'No Show'], required: true },
          { id: 'feedback', label: 'Feedback', type: 'text', required: false },
          { id: 'interested', label: 'Interest Level', type: 'select', options: ['High', 'Medium', 'Low', 'Not Interested'], required: false },
        ],
        relationTo: ['contacts'],
        hasTimeline: false,
        hasDocuments: false,
        hasWorkflow: false,
      },
      {
        id: 'offers',
        name: 'Offer',
        namePlural: 'Offers',
        icon: '💰',
        fields: [
          { id: 'propertyId', label: 'Property', type: 'text', required: true },
          { id: 'buyerContactId', label: 'Buyer', type: 'text', required: true },
          { id: 'offerAmount', label: 'Offer Amount', type: 'number', required: true },
          { id: 'earnestMoney', label: 'Earnest Money', type: 'number', required: false },
          { id: 'contingencies', label: 'Contingencies', type: 'text', required: false },
          { id: 'closingDate', label: 'Proposed Closing Date', type: 'date', required: false },
          { id: 'status', label: 'Status', type: 'select', options: ['Submitted', 'Under Review', 'Countered', 'Accepted', 'Rejected'], required: true },
          { id: 'expirationDate', label: 'Expiration Date', type: 'date', required: false },
        ],
        relationTo: ['contacts', 'deals'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: true,
      },
    ],
    customFields: {
      leads: [
        { id: 'lookingFor', label: 'Looking For', type: 'select', options: ['Buy', 'Sell', 'Rent', 'Invest'], required: false },
        { id: 'priceRange', label: 'Price Range', type: 'text', required: false },
        { id: 'preferredAreas', label: 'Preferred Areas', type: 'text', required: false },
        { id: 'preApproved', label: 'Pre-Approved', type: 'checkbox', required: false },
      ],
      accounts: [
        { id: 'propertyOwned', label: 'Properties Owned', type: 'number', required: false },
        { id: 'investorType', label: 'Investor Type', type: 'select', options: ['Individual', 'Institutional', 'REIT', 'Fund'], required: false },
      ],
    },
    requiredFields: {
      leads: ['name', 'email', 'phone', 'lookingFor'],
      accounts: ['name', 'email'],
    },
    pipelines: [
      {
        id: 're-buyer',
        name: 'Buyer Journey',
        entityType: 'leads',
        stages: [
          { label: 'Initial Contact', probability: 10, color: '#94a3b8', order: 1 },
          { label: 'Pre-Approval', probability: 25, color: '#60a5fa', order: 2 },
          { label: 'Viewing Properties', probability: 40, color: '#fbbf24', order: 3 },
          { label: 'Offer Submitted', probability: 60, color: '#f59e0b', order: 4 },
          { label: 'Under Contract', probability: 80, color: '#10b981', order: 5 },
          { label: 'Closed', probability: 100, color: '#059669', order: 6 },
        ],
        isDefault: true,
      },
    ],
    statuses: {
      properties: ['Available', 'Under Contract', 'Sold', 'Off Market', 'Coming Soon'],
      showings: ['Scheduled', 'Completed', 'Cancelled', 'No Show'],
      offers: ['Submitted', 'Under Review', 'Countered', 'Accepted', 'Rejected'],
    },
    integrations: ['stripe', 'docusign', 'mls', 'zillow'],
    modules: {
      enabled: ['salesEngine', 'financials', 'marketing', 'fieldLogistics'],
      disabled: [],
    },
  },

  // === SOLAR PANELS ===
  solar: {
    id: 'solar',
    name: 'Solar & Renewable Energy',
    type: 'solar',
    description: 'For solar panel installation and renewable energy companies',
    icon: '☀️',
    customEntities: [
      {
        id: 'site_surveys',
        name: 'Site Survey',
        namePlural: 'Site Surveys',
        icon: '📐',
        fields: [
          { id: 'propertyAddress', label: 'Property Address', type: 'text', required: true },
          { id: 'surveyDate', label: 'Survey Date', type: 'date', required: true },
          { id: 'roofType', label: 'Roof Type', type: 'select', options: ['Asphalt Shingle', 'Metal', 'Tile', 'Flat', 'Other'], required: true },
          { id: 'roofAge', label: 'Roof Age (years)', type: 'number', required: false },
          { id: 'roofCondition', label: 'Roof Condition', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Replacement'], required: true },
          { id: 'roofArea', label: 'Available Roof Area (sqft)', type: 'number', required: false },
          { id: 'shading', label: 'Shading Issues', type: 'text', required: false },
          { id: 'electricalPanel', label: 'Electrical Panel Rating', type: 'text', required: false },
          { id: 'utilityProvider', label: 'Utility Provider', type: 'text', required: false },
          { id: 'avgMonthlyUsage', label: 'Avg Monthly Usage (kWh)', type: 'number', required: false },
          { id: 'avgMonthlyBill', label: 'Avg Monthly Bill', type: 'number', required: false },
        ],
        relationTo: ['accounts', 'contacts'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: true,
      },
      {
        id: 'installations',
        name: 'Installation',
        namePlural: 'Installations',
        icon: '🔧',
        fields: [
          { id: 'jobNumber', label: 'Job Number', type: 'text', required: true },
          { id: 'accountId', label: 'Account', type: 'text', required: true },
          { id: 'systemSize', label: 'System Size (kW)', type: 'number', required: true },
          { id: 'panelModel', label: 'Panel Model', type: 'text', required: false },
          { id: 'inverterModel', label: 'Inverter Model', type: 'text', required: false },
          { id: 'batteryStorage', label: 'Battery Storage', type: 'checkbox', required: false },
          { id: 'batteryModel', label: 'Battery Model', type: 'text', required: false },
          { id: 'installDate', label: 'Install Date', type: 'date', required: false },
          { id: 'completionDate', label: 'Completion Date', type: 'date', required: false },
          { id: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'In Progress', 'Inspection', 'PTO Pending', 'Complete'], required: true },
          { id: 'permitNumber', label: 'Permit Number', type: 'text', required: false },
          { id: 'interconnectionStatus', label: 'Interconnection Status', type: 'text', required: false },
        ],
        relationTo: ['accounts', 'jobs'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: true,
      },
    ],
    customFields: {
      leads: [
        { id: 'homeownership', label: 'Homeownership', type: 'select', options: ['Own', 'Rent', 'Other'], required: false },
        { id: 'roofAge', label: 'Roof Age', type: 'number', required: false },
        { id: 'monthlyBill', label: 'Monthly Electric Bill', type: 'number', required: false },
        { id: 'sunExposure', label: 'Sun Exposure', type: 'select', options: ['Full Sun', 'Partial Sun', 'Mostly Shade'], required: false },
      ],
      quotes: [
        { id: 'systemSize', label: 'System Size (kW)', type: 'number', required: true },
        { id: 'estimatedProduction', label: 'Est. Annual Production (kWh)', type: 'number', required: false },
        { id: 'paybackPeriod', label: 'Payback Period (years)', type: 'number', required: false },
        { id: 'incentivesIncluded', label: 'Incentives Included', type: 'text', required: false },
      ],
    },
    requiredFields: {
      leads: ['name', 'email', 'phone', 'homeownership'],
    },
    pipelines: [
      {
        id: 'solar-pipeline',
        name: 'Solar Sales Pipeline',
        entityType: 'leads',
        stages: [
          { label: 'Initial Contact', probability: 10, color: '#94a3b8', order: 1 },
          { label: 'Site Survey Scheduled', probability: 25, color: '#60a5fa', order: 2 },
          { label: 'Proposal Sent', probability: 40, color: '#fbbf24', order: 3 },
          { label: 'Contract Signed', probability: 70, color: '#f59e0b', order: 4 },
          { label: 'Installation Scheduled', probability: 85, color: '#10b981', order: 5 },
          { label: 'System Active', probability: 100, color: '#059669', order: 6 },
        ],
        isDefault: true,
      },
    ],
    statuses: {
      site_surveys: ['Scheduled', 'Completed', 'Follow-up Needed'],
      installations: ['Scheduled', 'In Progress', 'Inspection', 'PTO Pending', 'Complete'],
    },
    integrations: ['stripe', 'docusign', 'sunpower', 'enphase'],
    modules: {
      enabled: ['salesEngine', 'financials', 'fieldLogistics', 'marketing'],
      disabled: [],
    },
  },

  // === CONSTRUCTION & TRADES ===
  construction: {
    id: 'construction',
    name: 'Construction & Trades',
    type: 'construction',
    description: 'For contractors, builders, and trade professionals',
    icon: '🏗️',
    customEntities: [
      {
        id: 'projects',
        name: 'Project',
        namePlural: 'Projects',
        icon: '📋',
        fields: [
          { id: 'projectName', label: 'Project Name', type: 'text', required: true },
          { id: 'siteAddress', label: 'Site Address', type: 'text', required: true },
          { id: 'projectType', label: 'Project Type', type: 'select', options: ['New Construction', 'Renovation', 'Repair', 'Maintenance'], required: true },
          { id: 'startDate', label: 'Start Date', type: 'date', required: false },
          { id: 'completionDate', label: 'Expected Completion', type: 'date', required: false },
          { id: 'budgetAmount', label: 'Budget', type: 'number', required: false },
          { id: 'status', label: 'Status', type: 'select', options: ['Planning', 'Permitting', 'In Progress', 'Inspection', 'Complete'], required: true },
          { id: 'permitNumber', label: 'Permit Number', type: 'text', required: false },
          { id: 'contractorLicense', label: 'Contractor License', type: 'text', required: false },
        ],
        relationTo: ['accounts', 'jobs'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: true,
      },
      {
        id: 'change_orders',
        name: 'Change Order',
        namePlural: 'Change Orders',
        icon: '📝',
        fields: [
          { id: 'projectId', label: 'Project', type: 'text', required: true },
          { id: 'changeOrderNumber', label: 'CO Number', type: 'text', required: true },
          { id: 'description', label: 'Description', type: 'text', required: true },
          { id: 'reason', label: 'Reason', type: 'select', options: ['Client Request', 'Site Condition', 'Design Change', 'Code Requirement'], required: true },
          { id: 'costImpact', label: 'Cost Impact', type: 'number', required: true },
          { id: 'timeImpact', label: 'Time Impact (days)', type: 'number', required: false },
          { id: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'], required: true },
          { id: 'approvedBy', label: 'Approved By', type: 'text', required: false },
        ],
        relationTo: ['accounts'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: false,
      },
    ],
    customFields: {
      jobs: [
        { id: 'tradeType', label: 'Trade Type', type: 'select', options: ['Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Masonry', 'Roofing', 'Other'], required: true },
        { id: 'permitRequired', label: 'Permit Required', type: 'checkbox', required: false },
        { id: 'inspectionRequired', label: 'Inspection Required', type: 'checkbox', required: false },
        { id: 'safetyCompliance', label: 'Safety Compliance', type: 'checkbox', required: false },
      ],
      quotes: [
        { id: 'materialsCost', label: 'Materials Cost', type: 'number', required: false },
        { id: 'laborCost', label: 'Labor Cost', type: 'number', required: false },
        { id: 'equipmentCost', label: 'Equipment Cost', type: 'number', required: false },
      ],
    },
    requiredFields: {
      jobs: ['subject', 'accountId', 'jobType', 'status', 'tradeType'],
    },
    pipelines: [],
    statuses: {
      projects: ['Planning', 'Permitting', 'In Progress', 'Inspection', 'Complete', 'On Hold'],
      change_orders: ['Pending', 'Approved', 'Rejected'],
    },
    integrations: ['stripe', 'procore', 'buildertrend'],
    modules: {
      enabled: ['salesEngine', 'financials', 'fieldLogistics', 'inventory', 'purchaseOrders'],
      disabled: [],
    },
  },

  // === FINANCE ===
  finance: {
    id: 'finance',
    name: 'Financial Services',
    type: 'finance',
    description: 'For financial advisors, loan officers, and investment firms',
    icon: '💰',
    customEntities: [
      {
        id: 'loan_applications',
        name: 'Loan Application',
        namePlural: 'Loan Applications',
        icon: '📄',
        fields: [
          { id: 'applicantId', label: 'Applicant', type: 'text', required: true },
          { id: 'loanType', label: 'Loan Type', type: 'select', options: ['Mortgage', 'Personal', 'Auto', 'Business', 'Student'], required: true },
          { id: 'requestedAmount', label: 'Requested Amount', type: 'number', required: true },
          { id: 'term', label: 'Term (months)', type: 'number', required: false },
          { id: 'purpose', label: 'Purpose', type: 'text', required: false },
          { id: 'employmentStatus', label: 'Employment Status', type: 'text', required: false },
          { id: 'annualIncome', label: 'Annual Income', type: 'number', required: false },
          { id: 'creditScore', label: 'Credit Score', type: 'number', required: false },
          { id: 'status', label: 'Status', type: 'select', options: ['Application', 'Documentation', 'Underwriting', 'Approved', 'Denied', 'Funded'], required: true },
        ],
        relationTo: ['contacts', 'accounts'],
        hasTimeline: true,
        hasDocuments: true,
        hasWorkflow: true,
      },
    ],
    customFields: {
      leads: [
        { id: 'serviceInterest', label: 'Service Interest', type: 'select', options: ['Loan', 'Investment', 'Insurance', 'Tax Planning', 'Retirement'], required: false },
        { id: 'assetsUnderManagement', label: 'Assets Under Management', type: 'number', required: false },
        { id: 'riskTolerance', label: 'Risk Tolerance', type: 'select', options: ['Conservative', 'Moderate', 'Aggressive'], required: false },
      ],
      accounts: [
        { id: 'accountType', label: 'Account Type', type: 'select', options: ['Individual', 'Joint', 'Trust', 'IRA', 'Business'], required: false },
        { id: 'totalAssets', label: 'Total Assets', type: 'number', required: false },
      ],
    },
    requiredFields: {
      leads: ['name', 'email', 'phone', 'serviceInterest'],
    },
    pipelines: [],
    statuses: {
      loan_applications: ['Application', 'Documentation', 'Underwriting', 'Approved', 'Denied', 'Funded'],
    },
    integrations: ['stripe', 'plaid', 'docusign'],
    modules: {
      enabled: ['salesEngine', 'financials', 'marketing'],
      disabled: ['fieldLogistics', 'inventory'],
    },
  },

  // === HEALTHCARE ===
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    type: 'healthcare',
    description: 'For medical practices, clinics, and healthcare providers',
    icon: '🏥',
    customEntities: [],
    customFields: {},
    requiredFields: {},
    pipelines: [],
    statuses: {},
    integrations: ['stripe', 'healthie'],
    modules: {
      enabled: ['salesEngine', 'financials'],
      disabled: ['fieldLogistics', 'inventory'],
    },
  },

  // === LEGAL ===
  legal: {
    id: 'legal',
    name: 'Legal Services',
    type: 'legal',
    description: 'For law firms and legal professionals',
    icon: '⚖️',
    customEntities: [],
    customFields: {},
    requiredFields: {},
    pipelines: [],
    statuses: {},
    integrations: ['stripe', 'clio', 'docusign'],
    modules: {
      enabled: ['salesEngine', 'financials'],
      disabled: ['fieldLogistics', 'inventory'],
    },
  },

  // === AUTOMOTIVE ===
  automotive: {
    id: 'automotive',
    name: 'Automotive',
    type: 'automotive',
    description: 'For auto dealerships and service centers',
    icon: '🚗',
    customEntities: [],
    customFields: {},
    requiredFields: {},
    pipelines: [],
    statuses: {},
    integrations: ['stripe', 'kbb'],
    modules: {
      enabled: ['salesEngine', 'financials', 'fieldLogistics'],
      disabled: [],
    },
  },

  // === HOSPITALITY ===
  hospitality: {
    id: 'hospitality',
    name: 'Hospitality',
    type: 'hospitality',
    description: 'For hotels, restaurants, and event venues',
    icon: '🏨',
    customEntities: [],
    customFields: {},
    requiredFields: {},
    pipelines: [],
    statuses: {},
    integrations: ['stripe', 'opentable'],
    modules: {
      enabled: ['salesEngine', 'financials', 'marketing'],
      disabled: [],
    },
  },

  // === MANUFACTURING ===
  manufacturing: {
    id: 'manufacturing',
    name: 'Manufacturing',
    type: 'manufacturing',
    description: 'For manufacturing and distribution companies',
    icon: '🏭',
    customEntities: [],
    customFields: {},
    requiredFields: {},
    pipelines: [],
    statuses: {},
    integrations: ['stripe'],
    modules: {
      enabled: ['salesEngine', 'financials', 'inventory', 'purchaseOrders'],
      disabled: [],
    },
  },
};

export const getIndustryBlueprint = (type: IndustryType): IndustryBlueprint => {
  return INDUSTRY_BLUEPRINTS[type] || INDUSTRY_BLUEPRINTS.general;
};

export const getActiveBlueprint = (settings: any): IndustryBlueprint => {
  const activeType = settings.activeIndustry || settings.organization?.industry || 'general';
  return getIndustryBlueprint(activeType);
};
