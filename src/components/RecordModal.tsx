import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Trash2, Plus, Package, RefreshCcw, User, Megaphone, Calendar, DollarSign, List, Calculator, Target, MessageSquare, Phone, Activity, Clock } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { EntityType, LineItem, Product, Service, CommunicationOutcome } from '../types';
import { calculateLineItemTotals } from '../utils/formatters';

const RecordModal: React.FC = () => {
  const { modal, closeModal, upsertRecord, accounts, campaigns, users, leads, deals, contacts, settings, products, services, currentUser, crews, jobs, zones, equipment, inventoryItems, purchaseOrders, bankTransactions, expenses, invoices, reviews, referralRewards, inboundForms, chatWidgets, calculators, automationWorkflows, webhooks, industryTemplates, tickets, tasks, activeBlueprint, getCustomEntities, upsertCustomEntity, deleteCustomEntity } = useCRM();
  const [formData, setFormData] = useState<any>({});
  
  useEffect(() => {
    if (modal.isOpen) {
      if (modal.initialData) {
        setFormData({ ...modal.initialData });
      } else {
        const defaults: any = {
          ownerId: currentUser?.id,
          assigneeId: currentUser?.id,
          createdAt: new Date().toISOString()
        };
        if (modal.type === 'invoices') {
          defaults.lineItems = [];
          defaults.status = 'Draft';
          defaults.invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
          defaults.issueDate = new Date().toISOString().split('T')[0];
          defaults.dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        }
        if (modal.type === 'subscriptions') {
          defaults.items = [];
          defaults.status = 'Active';
          defaults.billingCycle = 'monthly';
          defaults.startDate = new Date().toISOString().split('T')[0];
          defaults.nextBillDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
        }
        if (modal.type === 'products' || modal.type === 'services') {
          defaults.isActive = true;
          defaults.unitPrice = 0;
          defaults.taxRate = settings.localization.taxRate;
        }
        if (modal.type === 'campaigns') {
          defaults.type = 'Email';
          defaults.status = 'Planning';
          defaults.budget = 0;
          defaults.startDate = new Date().toISOString().split('T')[0];
        }
        if (modal.type === 'communications') {
          defaults.type = 'Call';
          defaults.direction = 'Outbound';
          defaults.outcome = 'answered';
          defaults.relatedToType = 'leads';
          defaults.subject = 'Follow up interaction';
          defaults.content = '';
        }
        if (modal.type === 'tasks') {
          defaults.status = 'Pending';
          defaults.priority = 'Medium';
          defaults.dueDate = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        }
        if (modal.type === 'documents') {
          defaults.fileType = 'PDF';
          defaults.fileSize = '';
          defaults.relatedToType = 'leads';
        }
        if (modal.type === 'tickets') {
          defaults.status = settings.ticketStatuses[0] || 'Open';
          defaults.priority = 'Medium';
          defaults.messages = [];
          defaults.internalNotes = [];
          // Calculate SLA deadline based on priority
          const slaHours = settings.slaConfig['Medium'] || 48;
          defaults.slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();
        }
        if (modal.type === 'quotes') {
          defaults.quoteNumber = `QT-${Date.now().toString().slice(-6)}`;
          defaults.status = 'Draft';
          defaults.issueDate = new Date().toISOString().split('T')[0];
          defaults.expiryDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
          defaults.lineItems = [];
          defaults.subtotal = 0;
          defaults.taxTotal = 0;
          defaults.total = 0;
        }
        if (modal.type === 'leads') {
          defaults.status = settings.leadStatuses[0] || 'New';
          defaults.source = settings.leadSources[0] || 'Website';
          defaults.estimatedValue = 0;
          defaults.score = 0;
          defaults.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`;
        }
        if (modal.type === 'deals') {
          defaults.stage = settings.dealStages[0]?.label || 'Discovery';
          defaults.probability = settings.dealStages[0]?.probability || 25;
          defaults.amount = 0;
          defaults.expectedCloseDate = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
          defaults.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`;
          defaults.assigneeId = currentUser?.id;
        }
        if (modal.type === 'accounts') {
          defaults.tier = settings.tiers[0] || 'Bronze';
          defaults.employeeCount = 0;
          defaults.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`;
        }
        if (modal.type === 'contacts') {
          defaults.avatar = `https://api.dicebear.com/7.x/initials/svg?seed=${Date.now()}`;
        }
        if (modal.type === 'calendarEvents') {
          defaults.type = 'Meeting';
          const now = new Date();
          defaults.startTime = new Date(now.getTime() + 3600000).toISOString().slice(0, 16); // +1 hour
          defaults.endTime = new Date(now.getTime() + 7200000).toISOString().slice(0, 16); // +2 hours
        }

        // Check if this is a custom entity and set defaults for select fields
        const customEntity = activeBlueprint.customEntities?.find(e => e.id === modal.type);
        if (customEntity) {
          customEntity.fields.forEach(field => {
            if (field.type === 'select' && field.options && field.options.length > 0) {
              defaults[field.id] = field.defaultValue || field.options[0];
            } else if (field.type === 'checkbox') {
              defaults[field.id] = field.defaultValue || false;
            } else if (field.type === 'number') {
              defaults[field.id] = field.defaultValue || 0;
            } else if (field.defaultValue) {
              defaults[field.id] = field.defaultValue;
            }
          });
        }

        setFormData(defaults);
      }
    }
  }, [modal.isOpen, modal.initialData, modal.type, currentUser, settings, activeBlueprint]);

  if (!modal.isOpen || !modal.type) return null;

  // Validation helper
  const validateRequiredFields = (): { isValid: boolean; missingFields: string[] } => {
    if (!modal.type) return { isValid: true, missingFields: [] };

    let requiredFields: string[] = [];

    // Check if this is a custom entity
    const customEntity = activeBlueprint.customEntities?.find(e => e.id === modal.type);
    if (customEntity) {
      requiredFields = customEntity.fields.filter(f => f.required).map(f => f.id);
    } else {
      requiredFields = (settings.requiredFields as any)?.[modal.type] || [];
    }

    const missingFields: string[] = [];

    requiredFields.forEach((field: string) => {
      const value = formData[field];
      // Check if field is empty, null, undefined, or empty array
      if (
        value === null ||
        value === undefined ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      ) {
        missingFields.push(field);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal.type) return;

    // Validate required fields
    const validation = validateRequiredFields();
    if (!validation.isValid) {
      const fieldNames = validation.missingFields
        .map(f => f.replace(/([A-Z])/g, ' $1').trim())
        .map(f => f.charAt(0).toUpperCase() + f.slice(1))
        .join(', ');
      alert(`Please fill in the following required fields: ${fieldNames}`);
      return;
    }

    // Check if this is a custom entity
    const customEntity = activeBlueprint.customEntities?.find(e => e.id === modal.type);
    if (customEntity) {
      upsertCustomEntity(modal.type, formData);
      closeModal();
      return;
    }

    if (modal.type === 'invoices' || modal.type === 'quotes') {
      // Use Tax Engine for calculations
      const totals = calculateLineItemTotals(formData.lineItems || [], settings, formData.taxRateId);
      upsertRecord(modal.type, { ...formData, subtotal: totals.subtotal, taxTotal: totals.taxTotal, total: totals.total });
    } else {
      upsertRecord(modal.type, formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({ 
      ...prev, 
      [name]: type === 'number' ? parseFloat(value) : value 
    }));
  };

  const addLineFromCatalog = (item: Product | Service) => {
    const isService = 'billingCycle' in item;
    if (modal.type === 'invoices' || modal.type === 'quotes') {
      const newLine: LineItem = {
        itemType: isService ? 'service' : 'product',
        itemId: item.id,
        description: item.name,
        qty: 1,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        lineTotal: item.unitPrice
      };
      setFormData((prev: any) => ({ ...prev, lineItems: [...(prev.lineItems || []), newLine] }));
    } else if (modal.type === 'subscriptions') {
      const newItem = {
        itemType: 'service',
        itemId: item.id,
        description: item.name,
        qty: 1,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate
      };
      setFormData((prev: any) => ({ ...prev, items: [...(prev.items || []), newItem], name: prev.name || item.name }));
    }
  };

  // Helper: Render industry-specific custom fields for standard entities
  const renderCustomFieldsForEntity = (entityType: EntityType) => {
    const customFields = activeBlueprint.customFields?.[entityType];
    if (!customFields || customFields.length === 0) return null;

    return (
      <>
        <div className="col-span-2 pt-4 border-t border-slate-100">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            {activeBlueprint.name} Fields
          </h3>
        </div>
        {customFields.map(field => {
          const fieldValue = formData[field.id] || '';

          if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
            return (
              <Field
                key={field.id}
                label={field.label}
                name={field.id}
                type={field.type}
                value={fieldValue}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
              />
            );
          } else if (field.type === 'number') {
            return (
              <Field
                key={field.id}
                label={field.label}
                name={field.id}
                type="number"
                value={fieldValue}
                onChange={handleChange}
                required={field.required}
                placeholder={field.placeholder}
              />
            );
          } else if (field.type === 'select' && field.options) {
            return (
              <Select
                key={field.id}
                label={field.label}
                name={field.id}
                value={fieldValue}
                onChange={handleChange}
              >
                <option value="">Select {field.label}</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            );
          } else if (field.type === 'date') {
            return (
              <Field
                key={field.id}
                label={field.label}
                name={field.id}
                type="date"
                value={fieldValue}
                onChange={handleChange}
                required={field.required}
              />
            );
          } else if (field.type === 'checkbox') {
            return (
              <div key={field.id} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={field.id}
                  name={field.id}
                  checked={fieldValue === true}
                  onChange={(e) => handleChange({ target: { name: field.id, value: e.target.checked } } as any)}
                  className="w-5 h-5 rounded border-slate-300"
                />
                <label htmlFor={field.id} className="text-xs font-bold text-slate-700">
                  {field.label}
                </label>
              </div>
            );
          } else if (field.type === 'textarea') {
            return (
              <div key={field.id} className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                <textarea
                  name={field.id}
                  value={fieldValue}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none"
                  placeholder={field.placeholder}
                  required={field.required}
                />
              </div>
            );
          }
          return null;
        })}
      </>
    );
  };

  const renderFields = () => {
    switch (modal.type) {
      case 'leads':
        return (
          <>
            <div className="col-span-2"><Field label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="Company" name="company" value={formData.company || ''} onChange={handleChange} required />
            <Field label="Email" type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            <Field label="Phone" type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} required />
            <Field label="Annual Revenue" type="number" name="annualRevenue" value={formData.annualRevenue || ''} onChange={handleChange} placeholder="$" />
            <Select label="Status" name="status" value={formData.status || settings.leadStatuses[0]} onChange={handleChange}>
              {settings.leadStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Source" name="source" value={formData.source || settings.leadSources[0]} onChange={handleChange}>
              {settings.leadSources.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Campaign" name="campaignId" value={formData.campaignId || ''} onChange={handleChange}>
              <option value="">None / Organic</option>
              {(campaigns || []).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </Select>
            <Select label="Referred By" name="referredById" value={formData.referredById || ''} onChange={handleChange}>
              <option value="">No Referral</option>
              {(contacts || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Field label="Referral Code Used" name="referralCodeUsed" value={formData.referralCodeUsed || ''} onChange={handleChange} placeholder="ABC123" />
            <Field label="Estimated Value" type="number" name="estimatedValue" value={formData.estimatedValue || 0} onChange={handleChange} />
            <Field label="Commission %" type="number" name="commissionRate" value={formData.commissionRate || ''} onChange={handleChange} placeholder="e.g. 10" min="0" max="100" />
            <Field label="Lead Score (0-100)" type="number" name="score" value={formData.score || 0} onChange={handleChange} min="0" max="100" />
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">BANT Qualification</h3>
            </div>
            <div className="col-span-2"><Field label="Budget" name="budget" value={formData.budget || ''} onChange={handleChange} placeholder="e.g. Confirmed $50k" /></div>
            <div className="col-span-2"><Field label="Authority" name="authority" value={formData.authority || ''} onChange={handleChange} placeholder="e.g. Yes - CEO" /></div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Need / Pain Points</label>
              <textarea name="need" value={formData.need || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Describe business needs..." />
            </div>
            <div className="col-span-2"><Field label="Timeline" name="timeline" value={formData.timeline || ''} onChange={handleChange} placeholder="e.g. Q2 2026, Within 3 months" /></div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Technical Requirements</label>
              <textarea name="technicalRequirements" value={formData.technicalRequirements || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Technical needs..." />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Project Scope</label>
              <textarea name="projectScope" value={formData.projectScope || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Scope of work..." />
            </div>
            <Field label="Avatar URL" name="avatar" value={formData.avatar || ''} onChange={handleChange} placeholder="https://..." />
            {renderCustomFieldsForEntity('leads')}
          </>
        );
      case 'deals':
        return (
          <>
            <div className="col-span-2"><Field label="Deal Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <div className="col-span-2">
              <Select label="Account" name="accountId" value={formData.accountId || ''} onChange={handleChange} required>
                <option value="">Select Account</option>
                {(accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>
            <div className="col-span-2">
              <Select label="Primary Contact" name="contactId" value={formData.contactId || ''} onChange={handleChange}>
                <option value="">Select Contact</option>
                {(contacts || []).filter(c => !formData.accountId || c.accountId === formData.accountId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <Field label="Deal Value" type="number" name="amount" value={formData.amount || 0} onChange={handleChange} required />
            <Select label="Stage" name="stage" value={formData.stage || settings.dealStages[0]?.label} onChange={handleChange}>
              {settings.dealStages.map(s => <option key={s.label} value={s.label}>{s.label}</option>)}
            </Select>
            <Field label="Probability %" type="number" name="probability" value={formData.probability || 0} onChange={handleChange} min="0" max="100" />
            <Field label="Expected Close Date" type="date" name="expectedCloseDate" value={formData.expectedCloseDate || ''} onChange={handleChange} />
            <Select label="Assigned To" name="assigneeId" value={formData.assigneeId || currentUser?.id} onChange={handleChange}>
              {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Commission Settings</h3>
            </div>
            <Field label="Commission %" type="number" name="commissionRate" value={formData.commissionRate || ''} onChange={handleChange} placeholder="e.g. 10" min="0" max="100" />
            <div className="flex flex-col">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1.5">Commission Amount</label>
              <div className="px-5 py-4 bg-emerald-50 border border-emerald-100 rounded-[20px] text-sm font-black text-emerald-700">
                ${((formData.amount || 0) * (formData.commissionRate || 0) / 100).toFixed(2)}
              </div>
            </div>
            <Field label="Avatar URL" name="avatar" value={formData.avatar || ''} onChange={handleChange} placeholder="https://..." />
            {renderCustomFieldsForEntity('deals')}
          </>
        );
      case 'accounts':
        return (
          <>
            <div className="col-span-2"><Field label="Account Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="Industry" name="industry" value={formData.industry || ''} onChange={handleChange} required />
            <Field label="Website" type="url" name="website" value={formData.website || ''} onChange={handleChange} placeholder="https://..." />
            <Field label="Employee Count" type="number" name="employeeCount" value={formData.employeeCount || 0} onChange={handleChange} />
            <Field label="Annual Revenue" type="number" name="annualRevenue" value={formData.annualRevenue || ''} onChange={handleChange} placeholder="$" />
            <Select label="Tier" name="tier" value={formData.tier || settings.tiers[0]} onChange={handleChange}>
              {settings.tiers.map(t => <option key={t} value={t}>{t}</option>)}
            </Select>
            <Field label="Credit Limit" type="number" name="creditLimit" value={formData.creditLimit || ''} onChange={handleChange} placeholder="$" />
            <Field label="Default Commission %" type="number" name="commissionRate" value={formData.commissionRate || ''} onChange={handleChange} placeholder="e.g. 10" min="0" max="100" />
            <Select label="Parent Account" name="parentAccountId" value={formData.parentAccountId || ''} onChange={handleChange}>
              <option value="">No Parent Account</option>
              {(accounts || []).filter(a => a.id !== formData.id).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Address</h3>
            </div>
            <div className="col-span-2"><Field label="Street" name="address.street" value={formData.address?.street || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} /></div>
            <Field label="Suburb" name="address.suburb" value={formData.address?.suburb || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, suburb: e.target.value } }))} />
            <Field label="State" name="address.state" value={formData.address?.state || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} />
            <Field label="Postcode" name="address.postcode" value={formData.address?.postcode || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, postcode: e.target.value } }))} />
            <Field label="Country" name="address.country" value={formData.address?.country || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, country: e.target.value } }))} />
            <Field label="Avatar URL" name="avatar" value={formData.avatar || ''} onChange={handleChange} placeholder="https://..." />
            {renderCustomFieldsForEntity('accounts')}
          </>
        );
      case 'contacts':
        return (
          <>
            <div className="col-span-2"><Field label="Full Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <div className="col-span-2">
              <Select label="Primary Account" name="accountId" value={formData.accountId || ''} onChange={handleChange} required>
                <option value="">Select Account</option>
                {(accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>
            <Field label="Email" type="email" name="email" value={formData.email || ''} onChange={handleChange} required />
            <Field label="Phone" type="tel" name="phone" value={formData.phone || ''} onChange={handleChange} />
            <div className="col-span-2"><Field label="Job Title" name="title" value={formData.title || ''} onChange={handleChange} /></div>
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Referral & Affiliate</h3>
            </div>
            <Field label="Referral Code" name="referralCode" value={formData.referralCode || ''} onChange={handleChange} placeholder="AUTO-GENERATED" />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isAffiliate" checked={formData.isAffiliate || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, isAffiliate: e.target.checked }))} className="w-4 h-4" />
              <label className="text-xs font-black text-slate-900">Is Affiliate</label>
            </div>
            {formData.isAffiliate && (
              <Select label="Affiliate Tier" name="affiliateTier" value={formData.affiliateTier || 'Bronze'} onChange={handleChange}>
                <option value="Bronze">Bronze</option>
                <option value="Silver">Silver</option>
                <option value="Gold">Gold</option>
              </Select>
            )}
            <div className="col-span-2 pt-4 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Address</h3>
            </div>
            <div className="col-span-2"><Field label="Street" name="address.street" value={formData.address?.street || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, street: e.target.value } }))} /></div>
            <Field label="Suburb" name="address.suburb" value={formData.address?.suburb || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, suburb: e.target.value } }))} />
            <Field label="State" name="address.state" value={formData.address?.state || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, state: e.target.value } }))} />
            <Field label="Postcode" name="address.postcode" value={formData.address?.postcode || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, postcode: e.target.value } }))} />
            <Field label="Country" name="address.country" value={formData.address?.country || ''} onChange={(e) => setFormData((prev: any) => ({ ...prev, address: { ...prev.address, country: e.target.value } }))} />
            <Field label="Avatar URL" name="avatar" value={formData.avatar || ''} onChange={handleChange} placeholder="https://..." />
            {renderCustomFieldsForEntity('contacts')}
          </>
        );
      case 'calendarEvents':
        // Generate 30-minute interval time options
        const timeOptions = [];
        for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 30) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            const timeValue = `${hour}:${minute}`;
            const displayTime = new Date(`2000-01-01T${timeValue}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            timeOptions.push({ value: timeValue, label: displayTime });
          }
        }

        // Parse current start/end times
        const startDate = formData.startTime ? formData.startTime.split('T')[0] : new Date().toISOString().split('T')[0];
        const startTimeOnly = formData.startTime ? formData.startTime.split('T')[1]?.slice(0, 5) || '09:00' : '09:00';
        const endTimeOnly = formData.endTime ? formData.endTime.split('T')[1]?.slice(0, 5) || '09:30' : '09:30';

        const handleStartTimeChange = (timeValue: string) => {
          const newStartTime = `${startDate}T${timeValue}`;
          // Auto-set end time to 30 minutes after start
          const startParts = timeValue.split(':');
          const startHour = parseInt(startParts[0]);
          const startMinute = parseInt(startParts[1]);
          let endHour = startHour;
          let endMinute = startMinute + 30;
          if (endMinute >= 60) {
            endMinute -= 60;
            endHour += 1;
          }
          if (endHour >= 24) endHour = 23;
          const endTimeValue = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          const newEndTime = `${startDate}T${endTimeValue}`;
          setFormData((prev: any) => ({ ...prev, startTime: newStartTime, endTime: newEndTime }));
        };

        const handleEndTimeChange = (timeValue: string) => {
          const newEndTime = `${startDate}T${timeValue}`;
          setFormData((prev: any) => ({ ...prev, endTime: newEndTime }));
        };

        const handleDateChange = (dateValue: string) => {
          const newStartTime = `${dateValue}T${startTimeOnly}`;
          const newEndTime = `${dateValue}T${endTimeOnly}`;
          setFormData((prev: any) => ({ ...prev, startTime: newStartTime, endTime: newEndTime }));
        };

        // Event type color map matching MySchedule "Add New" menu
        const eventTypeColors: Record<string, { bg: string; text: string; border: string; icon: string }> = {
          'Meeting': { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', icon: 'bg-amber-100' },
          'Call': { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', icon: 'bg-emerald-100' },
          'Personal': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-200', icon: 'bg-pink-100' },
          'Follow-up': { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-200', icon: 'bg-violet-100' },
          'Internal': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', icon: 'bg-blue-100' },
          'Deadline': { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', icon: 'bg-rose-100' },
          'Reminder': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', icon: 'bg-slate-100' },
        };

        const selectedTypeColor = eventTypeColors[formData.type || 'Meeting'] || eventTypeColors['Meeting'];

        return (
          <>
            <div className="col-span-2"><Field label="Event Title" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Event details..." />
            </div>

            {/* Colorful Event Type Selector */}
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block">Event Type</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(eventTypeColors).map(([type, colors]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData((prev: any) => ({ ...prev, type }))}
                    className={`p-3 rounded-2xl border-2 transition-all text-center ${
                      formData.type === type
                        ? `${colors.bg} ${colors.border} ${colors.text} shadow-lg ring-2 ring-offset-1 ring-${type === 'Meeting' ? 'amber' : type === 'Call' ? 'emerald' : type === 'Personal' ? 'pink' : type === 'Follow-up' ? 'violet' : type === 'Internal' ? 'blue' : type === 'Deadline' ? 'rose' : 'slate'}-300`
                        : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            <Field label="Location" name="location" value={formData.location || ''} onChange={handleChange} placeholder="Meeting room, address, or online..." />

            {/* Date */}
            <div className="col-span-2">
              <Field label="Date" type="date" name="eventDate" value={startDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange(e.target.value)} required />
            </div>

            {/* Start/End Time with 30-min intervals */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none"
                value={startTimeOnly}
                onChange={(e) => handleStartTimeChange(e.target.value)}
              >
                {timeOptions.map(opt => (
                  <option key={`start-${opt.value}`} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Time</label>
              <select
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none"
                value={endTimeOnly}
                onChange={(e) => handleEndTimeChange(e.target.value)}
              >
                {timeOptions.map(opt => (
                  <option key={`end-${opt.value}`} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Select label="Related To Type" name="relatedToType" value={formData.relatedToType || ''} onChange={handleChange}>
                <option value="">None</option>
                <option value="leads">Lead</option>
                <option value="deals">Deal</option>
                <option value="accounts">Account</option>
                <option value="contacts">Contact</option>
                <option value="tickets">Ticket</option>
                <option value="jobs">Job</option>
                <option value="tasks">Task</option>
                <option value="campaigns">Campaign</option>
              </Select>
            </div>
            {formData.relatedToType && (
              <div className="col-span-2">
                <Select label="Related Record" name="relatedToId" value={formData.relatedToId || ''} onChange={handleChange}>
                  <option value="">Select Record</option>
                  {formData.relatedToType === 'leads' && (leads || []).map(l => <option key={l.id} value={l.id}>{l.name} ({l.company})</option>)}
                  {formData.relatedToType === 'deals' && (deals || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  {formData.relatedToType === 'accounts' && (accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  {formData.relatedToType === 'contacts' && (contacts || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  {formData.relatedToType === 'tickets' && (tickets || []).map(t => <option key={t.id} value={t.id}>{t.subject}</option>)}
                  {formData.relatedToType === 'jobs' && (jobs || []).map(j => <option key={j.id} value={j.id}>{j.subject}</option>)}
                  {formData.relatedToType === 'tasks' && (tasks || []).map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                  {formData.relatedToType === 'campaigns' && (campaigns || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </div>
            )}
          </>
        );
      case 'communications':
        return (
          <>
            <div className="col-span-2">
              <Field label="Subject" name="subject" value={formData.subject || ''} onChange={handleChange} required />
            </div>
            <Select label="Type" name="type" value={formData.type || 'Call'} onChange={handleChange}>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="SMS">SMS</option>
              <option value="Note">Note</option>
            </Select>
            <Select label="Direction" name="direction" value={formData.direction || 'Outbound'} onChange={handleChange}>
              <option value="Outbound">Outbound</option>
              <option value="Inbound">Inbound</option>
            </Select>
            <div className="col-span-2">
              <Select label="Outcome" name="outcome" value={formData.outcome || 'answered'} onChange={handleChange}>
                <option value="answered">Answered</option>
                <option value="no-answer">No Answer</option>
                <option value="voicemail">Voicemail</option>
                <option value="meeting-booked">Meeting Booked</option>
                <option value="converted">Converted</option>
              </Select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Interaction Content</label>
              <textarea 
                name="content" 
                value={formData.content || ''} 
                onChange={handleChange} 
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-32 mt-1.5 resize-none" 
                placeholder="Log the details of your conversation..."
              />
            </div>
            <div className="col-span-2 p-6 bg-blue-50/50 border border-blue-100 rounded-[30px] space-y-4">
               <div className="flex items-center gap-2 mb-2">
                 <Activity size={16} className="text-blue-600" />
                 <h4 className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Automation & Follow-up</h4>
               </div>
               <Field label="Next Step Action" name="nextStep" value={formData.nextStep || ''} onChange={handleChange} placeholder="e.g. Send proposal after call" />
               <Field label="Follow-up Date" type="date" name="nextFollowUpDate" value={formData.nextFollowUpDate || ''} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <Select label="Related To Type" name="relatedToType" value={formData.relatedToType || 'leads'} onChange={handleChange}>
                <option value="leads">Lead</option>
                <option value="accounts">Account</option>
                <option value="contacts">Contact</option>
                <option value="deals">Deal</option>
              </Select>
              <Select label="Specific Record" name="relatedToId" value={formData.relatedToId || ''} onChange={handleChange} required>
                <option value="">Select Record</option>
                {formData.relatedToType === 'leads' && (leads || []).map(l => <option key={l.id} value={l.id}>{l.name} ({l.company})</option>)}
                {formData.relatedToType === 'accounts' && (accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                {formData.relatedToType === 'contacts' && (contacts || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                {formData.relatedToType === 'deals' && (deals || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
          </>
        );
      case 'tasks':
        return (
          <>
            <div className="col-span-2"><Field label="Task Title" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-24 mt-1.5 resize-none" />
            </div>
            <Field label="Due Date" type="datetime-local" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} required />
            <Select label="Priority" name="priority" value={formData.priority || 'Medium'} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
            <div className="col-span-2">
              <Select label="Assignee" name="assigneeId" value={formData.assigneeId || currentUser?.id} onChange={handleChange}>
                {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
          </>
        );
      case 'campaigns':
        return (
          <>
            <div className="col-span-2"><Field label="Campaign Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Select label="Channel Type" name="type" value={formData.type || 'Email'} onChange={handleChange}>
               <option value="Email">Email</option>
               <option value="Social">Social</option>
               <option value="Search">Search</option>
               <option value="Event">Event</option>
            </Select>
            <Select label="Execution Status" name="status" value={formData.status || 'Planning'} onChange={handleChange}>
               <option value="Planning">Planning</option>
               <option value="Active">Active</option>
               <option value="Completed">Completed</option>
               <option value="Paused">Paused</option>
            </Select>
            <Field label="Budget ($)" type="number" name="budget" value={formData.budget || 0} onChange={handleChange} />
            <Field label="Start Date" type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} />
          </>
        );
      case 'products':
      case 'services':
        const productTypes = ['Physical Item', 'Digital Product', 'Consumable', 'Equipment', 'Raw Material'];
        const serviceTypes = ['Subscription', 'License', 'Maintenance Contract', 'Professional Service', 'Support Package', 'One-Time Service'];
        const itemTypes = modal.type === 'products' ? productTypes : serviceTypes;

        return (
          <>
            {/* Basic Information Section */}
            <div className="col-span-2 mb-2">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                {modal.type === 'products' ? <Package size={14}/> : <RefreshCcw size={14}/>}
                Basic Information
              </p>
            </div>

            <div className="col-span-2"><Field label="Item Name" name="name" value={formData.name || ''} onChange={handleChange} required placeholder={modal.type === 'products' ? 'e.g., Premium Widget' : 'e.g., Monthly Support Plan'} /></div>
            <Field label={modal.type === 'products' ? "SKU" : "Service Code"} name={modal.type === 'products' ? "sku" : "code"} value={formData.sku || formData.code || ''} onChange={handleChange} placeholder={modal.type === 'products' ? 'SKU-001' : 'SVC-001'} />

            <Select label="Item Type" name="type" value={formData.type || itemTypes[0]} onChange={handleChange}>
              {itemTypes.map((t: string) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
            <Field label="Category" name="category" value={formData.category || ''} onChange={handleChange} placeholder="e.g., Electronics, Consulting" />
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none"
                placeholder={modal.type === 'products' ? 'Describe the product features and benefits...' : 'Describe the service scope and deliverables...'}
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive ?? true}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))}
                className="w-5 h-5 rounded-lg accent-emerald-600"
              />
              <label className="text-xs font-black text-slate-700">Active in Catalog</label>
            </div>

            {/* Pricing Section */}
            <div className="col-span-2 mt-4 mb-2 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                <DollarSign size={14}/>
                Pricing & Taxes
              </p>
            </div>

            <Field label="Unit Price ($)" type="number" step="0.01" name="unitPrice" value={formData.unitPrice || 0} onChange={handleChange} required />
            <Field label="Cost Price ($)" type="number" step="0.01" name="costPrice" value={formData.costPrice || ''} onChange={handleChange} placeholder="Optional - for margin calc" />
            <Field label="Tax Rate (%)" type="number" step="0.1" name="taxRate" value={formData.taxRate ?? settings.localization.taxRate} onChange={handleChange} />

            {modal.type === 'services' && (
              <Select label="Billing Cycle" name="billingCycle" value={formData.billingCycle || 'monthly'} onChange={handleChange}>
                <option value="one-off">One-Time</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </Select>
            )}

            {/* Margin Preview */}
            {formData.costPrice && formData.unitPrice && formData.unitPrice > formData.costPrice && (
              <div className="col-span-2 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700">Profit Margin</span>
                  <span className="text-lg font-black text-emerald-600">
                    {((formData.unitPrice - formData.costPrice) / formData.costPrice * 100).toFixed(1)}%
                    <span className="text-xs ml-2 text-emerald-500">(${(formData.unitPrice - formData.costPrice).toFixed(2)} profit/unit)</span>
                  </span>
                </div>
              </div>
            )}

            {/* Product-Specific: Inventory Section */}
            {modal.type === 'products' && (
              <>
                <div className="col-span-2 mt-4 mb-2 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Package size={14}/>
                    Inventory Management
                  </p>
                </div>
                <Field label="Stock Level" type="number" name="stockLevel" value={formData.stockLevel || ''} onChange={handleChange} placeholder="Current qty" />
                <Field label="Reorder Point" type="number" name="reorderPoint" value={formData.reorderPoint || ''} onChange={handleChange} placeholder="Alert when below" />
                <Field label="Manufacturer" name="manufacturer" value={formData.manufacturer || ''} onChange={handleChange} placeholder="Optional" />
                <Field label="Warranty (Months)" type="number" name="warrantyMonths" value={formData.warrantyMonths || ''} onChange={handleChange} placeholder="0 = No warranty" />
              </>
            )}

            {/* Service-Specific: Delivery Section */}
            {modal.type === 'services' && (
              <>
                <div className="col-span-2 mt-4 mb-2 pt-4 border-t border-slate-100">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={14}/>
                    Service Delivery
                  </p>
                </div>
                <Field label="Duration (Hours)" type="number" step="0.5" name="durationHours" value={formData.durationHours || ''} onChange={handleChange} placeholder="Est. hours" />
                <Field label="Duration (Minutes)" type="number" name="durationMinutes" value={formData.durationMinutes || ''} onChange={handleChange} placeholder="Additional mins" />
                <Field label="Crew Size" type="number" name="crewSize" value={formData.crewSize || ''} onChange={handleChange} placeholder="# of technicians" />
                <Field label="SLA (Days)" type="number" name="slaCompletionDays" value={formData.slaCompletionDays || ''} onChange={handleChange} placeholder="Completion target" />
              </>
            )}

            {/* Description Section */}
            <div className="col-span-2 mt-4 mb-2 pt-4 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <List size={14}/>
                Description
              </p>
            </div>
            <div className="col-span-2">
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder={modal.type === 'products' ? 'Describe the product features, specifications, etc.' : 'Describe what this service includes, deliverables, etc.'}
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none min-h-[100px] resize-none"
              />
            </div>
          </>
        );
      case 'invoices':
      case 'subscriptions':
        const currentLineItems = (modal.type === 'invoices' ? formData.lineItems : formData.items) || [];

        // Helper to get full catalog item details
        const getCatalogItem = (itemId: string, itemType: string) => {
          if (itemType === 'service') {
            return services.find(s => s.id === itemId);
          }
          return products.find(p => p.id === itemId);
        };

        // Calculate totals
        const itemsSubtotal = currentLineItems.reduce((acc: number, item: any) => acc + (item.qty * item.unitPrice), 0);
        const itemsTax = currentLineItems.reduce((acc: number, item: any) => acc + (item.qty * item.unitPrice * (item.taxRate / 100)), 0);
        const itemsTotal = itemsSubtotal + itemsTax;

        // Get billing cycle label
        const getBillingCycleLabel = (cycle: string) => {
          const labels: Record<string, string> = {
            'one-off': 'One-Time',
            'monthly': 'Monthly',
            'quarterly': 'Quarterly',
            'yearly': 'Annually'
          };
          return labels[cycle] || cycle;
        };

        return (
          <>
            <div className="col-span-2 flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl mb-4">
              <Calculator size={20} className="text-amber-600" />
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-tight">
                {modal.type === 'invoices' ? 'One-off Invoice: Single billing event' : 'Subscription Plan: Recurring service provision'}
              </p>
            </div>
            <div className="col-span-2">
              <Select label="Target Account" name="accountId" value={formData.accountId || ''} onChange={handleChange} required>
                <option value="">Select Account</option>
                {(accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>
            {modal.type === 'invoices' && (
              <>
                <Field label="Invoice #" name="invoiceNumber" value={formData.invoiceNumber || ''} onChange={handleChange} />
                <Select label="Link to Deal (Optional)" name="dealId" value={formData.dealId || ''} onChange={handleChange}>
                  <option value="">No Deal Attribution</option>
                  {(deals || []).filter(d => d.accountId === formData.accountId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                <Field label="Issue Date" type="date" name="issueDate" value={formData.issueDate || ''} onChange={handleChange} />
                <Field label="Due Date" type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} />
              </>
            )}
            {modal.type === 'subscriptions' && (
              <>
                <Field label="Plan Name" name="name" value={formData.name || ''} onChange={handleChange} required />
                <Select label="Billing Cycle" name="billingCycle" value={formData.billingCycle || 'monthly'} onChange={handleChange}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="custom">Custom</option>
                </Select>
                <Field label="Start Date" type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} />
                <Field label="Next Billing Date" type="date" name="nextBillDate" value={formData.nextBillDate || ''} onChange={handleChange} />
                <Select label="Status" name="status" value={formData.status || 'Active'} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Cancelled">Cancelled</option>
                </Select>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="autoGenerateInvoice" checked={formData.autoGenerateInvoice || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, autoGenerateInvoice: e.target.checked }))} className="w-4 h-4" />
                  <label className="text-xs font-black text-slate-900">Auto-generate invoices</label>
                </div>
              </>
            )}

            {/* Provisioned Items Section */}
            <div className="col-span-2 space-y-4 pt-4 border-t border-slate-100 mt-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                {modal.type === 'invoices' ? 'Invoice Line Items' : 'Subscription Services'}
              </label>

              {/* Item Cards - Expanded View */}
              <div className="space-y-3">
                {currentLineItems.map((item: any, i: number) => {
                  const catalogItem = getCatalogItem(item.itemId, item.itemType);
                  const lineSubtotal = item.qty * item.unitPrice;
                  const lineTax = lineSubtotal * (item.taxRate / 100);
                  const lineTotal = lineSubtotal + lineTax;

                  return (
                    <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      {/* Header Row */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                          {item.itemType === 'service' ? (
                            <RefreshCcw size={18} className="text-emerald-600"/>
                          ) : (
                            <Package size={18} className="text-blue-600"/>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-900">{item.description}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                              item.itemType === 'service' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {item.itemType}
                            </span>
                          </div>
                          {catalogItem && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {catalogItem.category && <span className="font-bold">{catalogItem.category}</span>}
                              {catalogItem.category && catalogItem.type && ' • '}
                              {catalogItem.type && <span>{catalogItem.type}</span>}
                              {item.itemType === 'service' && (catalogItem as Service).billingCycle && (
                                <span className="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-[8px] font-black">
                                  {getBillingCycleLabel((catalogItem as Service).billingCycle)}
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = currentLineItems.filter((_: any, idx: number) => idx !== i);
                            setFormData((prev: any) => ({ ...prev, [modal.type === 'invoices' ? 'lineItems' : 'items']: next }));
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                        ><Trash2 size={16}/></button>
                      </div>

                      {/* Description */}
                      {catalogItem?.description && (
                        <p className="text-[10px] text-slate-500 leading-relaxed pl-13 ml-13 border-l-2 border-slate-200 pl-3">
                          {catalogItem.description}
                        </p>
                      )}

                      {/* Service Details */}
                      {item.itemType === 'service' && catalogItem && (
                        <div className="grid grid-cols-3 gap-2 text-[9px]">
                          {(catalogItem as Service).durationHours && (
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-400 uppercase font-bold block">Duration</span>
                              <span className="text-slate-700 font-black">
                                {(catalogItem as Service).durationHours}h {(catalogItem as Service).durationMinutes ? `${(catalogItem as Service).durationMinutes}m` : ''}
                              </span>
                            </div>
                          )}
                          {(catalogItem as Service).crewSize && (
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-400 uppercase font-bold block">Crew Size</span>
                              <span className="text-slate-700 font-black">{(catalogItem as Service).crewSize} techs</span>
                            </div>
                          )}
                          {(catalogItem as Service).slaCompletionDays && (
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-400 uppercase font-bold block">SLA</span>
                              <span className="text-slate-700 font-black">{(catalogItem as Service).slaCompletionDays} days</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Product Details */}
                      {item.itemType === 'product' && catalogItem && (
                        <div className="grid grid-cols-3 gap-2 text-[9px]">
                          {(catalogItem as Product).sku && (
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-400 uppercase font-bold block">SKU</span>
                              <span className="text-slate-700 font-black">{(catalogItem as Product).sku}</span>
                            </div>
                          )}
                          {(catalogItem as Product).manufacturer && (
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-400 uppercase font-bold block">Manufacturer</span>
                              <span className="text-slate-700 font-black">{(catalogItem as Product).manufacturer}</span>
                            </div>
                          )}
                          {(catalogItem as Product).warrantyMonths && (
                            <div className="bg-white rounded-lg p-2">
                              <span className="text-slate-400 uppercase font-bold block">Warranty</span>
                              <span className="text-slate-700 font-black">{(catalogItem as Product).warrantyMonths} months</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pricing Row */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              className="w-14 bg-white border border-slate-200 rounded-lg p-1.5 text-center text-xs font-black"
                              value={item.qty}
                              onChange={(e) => {
                                const next = [...currentLineItems];
                                next[i] = { ...next[i], qty: parseInt(e.target.value) || 1 };
                                setFormData((prev: any) => ({ ...prev, [modal.type === 'invoices' ? 'lineItems' : 'items']: next }));
                              }}
                            />
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Unit Price:</span>
                            <span className="text-xs font-black text-slate-700 ml-1">${item.unitPrice.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Tax ({item.taxRate}%):</span>
                            <span className="text-xs font-black text-slate-500 ml-1">${lineTax.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 uppercase font-bold block">Line Total</span>
                          <span className="text-sm font-black text-slate-900">${lineTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Items Section - List View */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Available Products & Services</p>
                  <span className="text-[9px] text-slate-400 font-bold">{[...(products || []), ...(services || [])].filter(item => item.isActive).length} items</span>
                </div>

                {/* List View Table */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead className="sticky top-0 bg-slate-100/95 backdrop-blur-sm">
                      <tr className="text-[8px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200">
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[...(products || []), ...(services || [])].filter(item => item.isActive).map(item => {
                        const isService = 'billingCycle' in item;
                        const alreadyAdded = currentLineItems.some((li: any) => li.itemId === item.id);
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-white transition-all ${alreadyAdded ? 'bg-emerald-50/50' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                isService ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                {isService ? <RefreshCcw size={14}/> : <Package size={14}/>}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-xs font-black text-slate-900">{item.name}</p>
                                {item.description && (
                                  <p className="text-[9px] text-slate-400 truncate max-w-[200px]">{item.description}</p>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${
                                isService ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {item.category || (isService ? 'Service' : 'Product')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="text-sm font-black text-slate-900">${item.unitPrice.toFixed(2)}</p>
                              {isService && (item as Service).billingCycle && (
                                <p className="text-[8px] text-slate-400">/{getBillingCycleLabel((item as Service).billingCycle)}</p>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {alreadyAdded ? (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-[9px] font-black uppercase">
                                  ✓ Added
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => addLineFromCatalog(item)}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-blue-700 transition-all shadow-sm"
                                >
                                  <Plus size={12}/> Add
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {[...(products || []), ...(services || [])].filter(item => item.isActive).length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400 text-xs font-bold">
                            No products or services available. Add items in the Items Catalog first.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              {currentLineItems.length > 0 && (
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Subtotal</span>
                    <span className="text-white font-black">${itemsSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400 font-bold">Tax</span>
                    <span className="text-white font-black">${itemsTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-slate-700">
                    <span className="text-white font-black">Total</span>
                    <span className="text-emerald-400 font-black">${itemsTotal.toFixed(2)}</span>
                  </div>
                  {modal.type === 'subscriptions' && formData.billingCycle && (
                    <p className="text-[10px] text-slate-400 text-center pt-2">
                      Billed {getBillingCycleLabel(formData.billingCycle).toLowerCase()} • Next billing: {formData.nextBillDate || 'Not set'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        );
      case 'documents':
        return (
          <>
            <div className="col-span-2"><Field label="Document Title" name="title" value={formData.title || ''} onChange={handleChange} required /></div>
            <Field label="File Type" name="fileType" value={formData.fileType || ''} onChange={handleChange} placeholder="PDF, DOCX, PNG..." />
            <Field label="File Size" name="fileSize" value={formData.fileSize || ''} onChange={handleChange} placeholder="e.g. 2.5 MB" />
            <div className="col-span-2"><Field label="File URL" name="url" value={formData.url || ''} onChange={handleChange} required placeholder="https://..." /></div>
            <div className="col-span-2">
              <Select label="Related To Type" name="relatedToType" value={formData.relatedToType || 'leads'} onChange={handleChange}>
                <option value="leads">Lead</option>
                <option value="accounts">Account</option>
                <option value="contacts">Contact</option>
                <option value="deals">Deal</option>
              </Select>
            </div>
            <div className="col-span-2">
              <Select label="Specific Record" name="relatedToId" value={formData.relatedToId || ''} onChange={handleChange} required>
                <option value="">Select Record</option>
                {formData.relatedToType === 'leads' && (leads || []).map(l => <option key={l.id} value={l.id}>{l.name} ({l.company})</option>)}
                {formData.relatedToType === 'accounts' && (accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                {formData.relatedToType === 'contacts' && (contacts || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                {formData.relatedToType === 'deals' && (deals || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
          </>
        );
      case 'tickets':
        return (
          <>
            <div className="col-span-2"><Field label="Subject" name="subject" value={formData.subject || ''} onChange={handleChange} required /></div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-24 mt-1.5 resize-none" placeholder="Describe the issue..." required />
            </div>
            <Select label="Priority" name="priority" value={formData.priority || 'Medium'} onChange={handleChange}>
              {settings.ticketPriorities.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Select label="Status" name="status" value={formData.status || settings.ticketStatuses[0]} onChange={handleChange}>
              {settings.ticketStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <div className="col-span-2">
              <Select label="Account" name="accountId" value={formData.accountId || ''} onChange={handleChange}>
                <option value="">Select Account</option>
                {(accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>
            <div className="col-span-2">
              <Select label="Requester (Contact)" name="requesterId" value={formData.requesterId || ''} onChange={handleChange}>
                <option value="">Select Contact</option>
                {(contacts || []).filter(c => !formData.accountId || c.accountId === formData.accountId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div className="col-span-2">
              <Select label="Assignee" name="assigneeId" value={formData.assigneeId || currentUser?.id} onChange={handleChange}>
                {(users || []).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </Select>
            </div>
          </>
        );
      case 'quotes':
        const quoteLineItems = formData.lineItems || [];
        return (
          <>
            <div className="col-span-2"><Field label="Quote Number" name="quoteNumber" value={formData.quoteNumber || `QT-${Date.now().toString().slice(-6)}`} onChange={handleChange} required /></div>
            <div className="col-span-2">
              <Select label="Account" name="accountId" value={formData.accountId || ''} onChange={handleChange} required>
                <option value="">Select Account</option>
                {(accounts || []).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </Select>
            </div>
            <div className="col-span-2">
              <Select label="Deal (Optional)" name="dealId" value={formData.dealId || ''} onChange={handleChange}>
                <option value="">No Deal Attribution</option>
                {(deals || []).filter(d => !formData.accountId || d.accountId === formData.accountId).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </Select>
            </div>
            <Select label="Status" name="status" value={formData.status || 'Draft'} onChange={handleChange}>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Expired">Expired</option>
            </Select>
            <Field label="Expiry Date" type="date" name="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} />
            <div className="col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quote Line Items</label>
              <div className="space-y-2">
                {quoteLineItems.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
                      {item.itemType === 'service' ? <RefreshCcw size={14} /> : <Package size={14}/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-900 truncate">{item.description}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">${item.unitPrice} per unit</p>
                    </div>
                    <input
                      type="number"
                      className="w-12 bg-white border border-slate-200 rounded-lg p-1 text-center text-xs font-black"
                      value={item.qty}
                      onChange={(e) => {
                        const next = [...quoteLineItems];
                        next[i] = { ...next[i], qty: parseInt(e.target.value) || 1 };
                        setFormData((prev: any) => ({ ...prev, lineItems: next }));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = quoteLineItems.filter((_: any, idx: number) => idx !== i);
                        setFormData((prev: any) => ({ ...prev, lineItems: next }));
                      }}
                      className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"
                    ><Trash2 size={14}/></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 overflow-x-auto pb-2 custom-scrollbar">
                {[...(products || []), ...(services || [])].filter(item => item.isActive).map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => addLineFromCatalog(item)}
                    className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                  >
                    <Plus size={12}/> {item.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Additional notes for the quote..." />
            </div>
          </>
        );

      case 'crews':
        return (
          <>
            <div className="col-span-2"><Field label="Crew Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Select label="Team Leader" name="leaderId" value={formData.leaderId || ''} onChange={handleChange} required>
              <option value="">Select Leader...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Field label="Color" name="color" type="color" value={formData.color || '#3B82F6'} onChange={handleChange} />
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Members</label>
              <p className="text-[9px] text-slate-400 ml-1 mt-1">Select members for this crew (multi-select coming soon)</p>
            </div>
          </>
        );

      case 'zones':
        return (
          <>
            <Field label="Zone Name" name="name" value={formData.name || ''} onChange={handleChange} required />
            <Field label="Region" name="region" value={formData.region || ''} onChange={handleChange} required />
            <Field label="Color" name="color" type="color" value={formData.color || '#3B82F6'} onChange={handleChange} />
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Zone description..." />
            </div>
          </>
        );

      case 'jobs':
        return (
          <>
            <div className="col-span-2"><Field label="Job Subject" name="subject" value={formData.subject || ''} onChange={handleChange} required /></div>
            <Select label="Account" name="accountId" value={formData.accountId || ''} onChange={handleChange} required>
              <option value="">Select Account...</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Select label="Job Type" name="jobType" value={formData.jobType || ''} onChange={handleChange} required>
              <option value="">Select Type...</option>
              <option value="Install">Install</option>
              <option value="Service">Service</option>
              <option value="Emergency">Emergency</option>
              <option value="Inspection">Inspection</option>
              <option value="Audit">Audit</option>
            </Select>
            <Select label="Status" name="status" value={formData.status || 'Scheduled'} onChange={handleChange}>
              <option value="Scheduled">Scheduled</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="OnHold">On Hold</option>
            </Select>
            <Select label="Priority" name="priority" value={formData.priority || 'Medium'} onChange={handleChange}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </Select>
            <Select label="Assigned Crew" name="crewId" value={formData.crewId || ''} onChange={handleChange}>
              <option value="">No Crew Assigned</option>
              {crews.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Zone" name="zone" value={formData.zone || ''} onChange={handleChange}>
              <option value="">No Zone</option>
              {zones.map(z => <option key={z.id} value={z.name}>{z.name}</option>)}
            </Select>
            <Field label="Scheduled Date" name="scheduledDate" type="datetime-local" value={formData.scheduledDate?.slice(0, 16) || ''} onChange={handleChange} />
            <Field label="Estimated Duration (hours)" name="estimatedDuration" type="number" value={formData.estimatedDuration || ''} onChange={handleChange} />
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Job details and notes..." />
            </div>
          </>
        );

      case 'equipment':
        return (
          <>
            <div className="col-span-2"><Field label="Equipment Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="Type" name="type" value={formData.type || ''} onChange={handleChange} required />
            <Field label="Barcode" name="barcode" value={formData.barcode || ''} onChange={handleChange} required />
            <Select label="Condition" name="condition" value={formData.condition || 'Good'} onChange={handleChange}>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
              <option value="Damaged">Damaged</option>
            </Select>
            <Field label="Location" name="location" value={formData.location || ''} onChange={handleChange} />
            <Select label="Assigned To" name="assignedTo" value={formData.assignedTo || ''} onChange={handleChange}>
              <option value="">Not Assigned</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <Field label="Purchase Date" name="purchaseDate" type="date" value={formData.purchaseDate?.slice(0, 10) || ''} onChange={handleChange} />
            <Field label="Purchase Price" name="purchasePrice" type="number" value={formData.purchasePrice || ''} onChange={handleChange} />
            <Field label="Last Service Date" name="lastServiceDate" type="date" value={formData.lastServiceDate?.slice(0, 10) || ''} onChange={handleChange} />
            <Field label="Next Service Date" name="nextServiceDate" type="date" value={formData.nextServiceDate?.slice(0, 10) || ''} onChange={handleChange} />
          </>
        );

      case 'inventoryItems':
        return (
          <>
            <div className="col-span-2"><Field label="Item Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="SKU" name="sku" value={formData.sku || ''} onChange={handleChange} required />
            <Field label="Unit Price" name="unitPrice" type="number" value={formData.unitPrice || ''} onChange={handleChange} required />
            <Select label="Category" name="category" value={formData.category || 'Material'} onChange={handleChange}>
              <option value="Material">Material</option>
              <option value="Asset">Asset</option>
            </Select>
            <Field label="Warehouse Quantity" name="warehouseQty" type="number" value={formData.warehouseQty || 0} onChange={handleChange} />
            <Field label="Reorder Point" name="reorderPoint" type="number" value={formData.reorderPoint || 0} onChange={handleChange} />
          </>
        );

      case 'purchaseOrders':
        return (
          <>
            <div className="col-span-2"><Field label="PO Number" name="poNumber" value={formData.poNumber || `PO-${Date.now().toString().slice(-6)}`} onChange={handleChange} required /></div>
            <Select label="Supplier" name="supplierId" value={formData.supplierId || ''} onChange={handleChange} required>
              <option value="">Select Supplier...</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Select label="Account" name="accountId" value={formData.accountId || ''} onChange={handleChange} required>
              <option value="">Select Account...</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </Select>
            <Select label="Status" name="status" value={formData.status || 'Draft'} onChange={handleChange}>
              <option value="Draft">Draft</option>
              <option value="Ordered">Ordered</option>
              <option value="Dispatched">Dispatched</option>
              <option value="Delivered">Delivered</option>
            </Select>
            <Field label="Total Amount" name="total" type="number" value={formData.total || 0} onChange={handleChange} />
            <Select label="Linked Job" name="linkedJobId" value={formData.linkedJobId || ''} onChange={handleChange}>
              <option value="">No Linked Job</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.subject}</option>)}
            </Select>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Items</label>
              <p className="text-[9px] text-slate-400 ml-1 mt-1">Line items management coming soon</p>
            </div>
          </>
        );

      case 'bankTransactions':
        return (
          <>
            <Field label="Date" name="date" type="date" value={formData.date?.slice(0, 10) || ''} onChange={handleChange} required />
            <Field label="Amount" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
            <div className="col-span-2"><Field label="Description" name="description" value={formData.description || ''} onChange={handleChange} required /></div>
            <Select label="Status" name="status" value={formData.status || 'unmatched'} onChange={handleChange}>
              <option value="unmatched">Unmatched</option>
              <option value="matched">Matched</option>
              <option value="ignored">Ignored</option>
            </Select>
            <Select label="Match Confidence" name="matchConfidence" value={formData.matchConfidence || 'none'} onChange={handleChange}>
              <option value="none">None</option>
              <option value="amber">Amber</option>
              <option value="green">Green</option>
            </Select>
            <div className="col-span-2">
              <Select label="Matched To Invoice" name="matchedToId" value={formData.matchedToId || ''} onChange={handleChange}>
                <option value="">Not Matched</option>
                {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoiceNumber} - ${inv.total}</option>)}
              </Select>
            </div>
          </>
        );

      case 'expenses':
        return (
          <>
            <Field label="Vendor" name="vendor" value={formData.vendor || ''} onChange={handleChange} required />
            <Field label="Amount" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
            <Select label="Category" name="category" value={formData.category || 'Other'} onChange={handleChange}>
              <option value="Materials">Materials</option>
              <option value="Fuel">Fuel</option>
              <option value="Subbies">Subbies</option>
              <option value="Rent">Rent</option>
              <option value="Other">Other</option>
            </Select>
            <Field label="Date" name="date" type="date" value={formData.date?.slice(0, 10) || ''} onChange={handleChange} required />
            <Select label="Status" name="status" value={formData.status || 'Pending'} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </Select>
            <Select label="Approved By" name="approvedBy" value={formData.approvedBy || ''} onChange={handleChange}>
              <option value="">Not Approved</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <div className="col-span-2">
              <Field label="Receipt URL" name="receiptUrl" value={formData.receiptUrl || ''} onChange={handleChange} placeholder="https://..." />
            </div>
          </>
        );

      case 'reviews':
        return (
          <>
            <Field label="Author Name" name="authorName" value={formData.authorName || ''} onChange={handleChange} required />
            <Field label="Rating (1-5)" name="rating" type="number" value={formData.rating || 5} onChange={handleChange} required />
            <Select label="Platform" name="platform" value={formData.platform || 'Google'} onChange={handleChange}>
              <option value="Google">Google</option>
              <option value="Facebook">Facebook</option>
              <option value="Yelp">Yelp</option>
              <option value="Trustpilot">Trustpilot</option>
              <option value="Internal">Internal</option>
            </Select>
            <Select label="Status" name="status" value={formData.status || 'New'} onChange={handleChange}>
              <option value="New">New</option>
              <option value="Replied">Replied</option>
              <option value="Escalated">Escalated</option>
              <option value="Ignored">Ignored</option>
            </Select>
            <Select label="Sentiment" name="sentiment" value={formData.sentiment || 'Positive'} onChange={handleChange}>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </Select>
            <Select label="Related Job" name="jobId" value={formData.jobId || ''} onChange={handleChange}>
              <option value="">No Job</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.subject}</option>)}
            </Select>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Content</label>
              <textarea name="content" value={formData.content || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Customer review..." />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reply Content</label>
              <textarea name="replyContent" value={formData.replyContent || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Your reply..." />
            </div>
          </>
        );

      case 'referralRewards':
        return (
          <>
            <Select label="Referrer" name="referrerId" value={formData.referrerId || ''} onChange={handleChange} required>
              <option value="">Select Referrer...</option>
              {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <Select label="Referred Lead" name="referredLeadId" value={formData.referredLeadId || ''} onChange={handleChange} required>
              <option value="">Select Lead...</option>
              {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </Select>
            <Field label="Reward Amount" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} required />
            <Select label="Status" name="status" value={formData.status || 'Pending'} onChange={handleChange}>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Cancelled">Cancelled</option>
            </Select>
            <Field label="Payout Date" name="payoutDate" type="date" value={formData.payoutDate?.slice(0, 10) || ''} onChange={handleChange} />
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Notes</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Referral notes..." />
            </div>
          </>
        );

      case 'inboundForms':
        return (
          <>
            <div className="col-span-2"><Field label="Form Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="Submit Button Text" name="submitButtonText" value={formData.submitButtonText || 'Submit'} onChange={handleChange} />
            <Field label="Submission Count" name="submissionCount" type="number" value={formData.submissionCount || 0} onChange={handleChange} />
            <Select label="Target Campaign" name="targetCampaignId" value={formData.targetCampaignId || ''} onChange={handleChange}>
              <option value="">No Campaign</option>
              {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            <div className="col-span-2">
              <Field label="Success Message" name="successMessage" value={formData.successMessage || ''} onChange={handleChange} />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Form Fields</label>
              <p className="text-[9px] text-slate-400 ml-1 mt-1">Form field builder coming soon</p>
            </div>
          </>
        );

      case 'chatWidgets':
        return (
          <>
            <div className="col-span-2"><Field label="Widget Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="Bubble Color" name="bubbleColor" type="color" value={formData.bubbleColor || '#3B82F6'} onChange={handleChange} />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
              <label className="text-xs font-black text-slate-900">Is Active</label>
            </div>
            <Select label="Route To User" name="routingUserId" value={formData.routingUserId || ''} onChange={handleChange} required>
              <option value="">Select User...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </Select>
            <div className="col-span-2">
              <Field label="Welcome Message" name="welcomeMessage" value={formData.welcomeMessage || ''} onChange={handleChange} />
            </div>
          </>
        );

      case 'calculators':
        return (
          <>
            <div className="col-span-2"><Field label="Calculator Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Select label="Type" name="type" value={formData.type || 'ROI'} onChange={handleChange}>
              <option value="ROI">ROI</option>
              <option value="Repayment">Repayment</option>
              <option value="SolarYield">Solar Yield</option>
            </Select>
            <Field label="Base Rate" name="baseRate" type="number" step="0.01" value={formData.baseRate || ''} onChange={handleChange} />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
              <label className="text-xs font-black text-slate-900">Is Active</label>
            </div>
          </>
        );

      case 'automationWorkflows':
        return (
          <>
            <div className="col-span-2"><Field label="Workflow Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Select label="Category" name="category" value={formData.category || 'Sales'} onChange={handleChange}>
              <option value="Sales">Sales</option>
              <option value="Operations">Operations</option>
              <option value="Logistics">Logistics</option>
              <option value="System">System</option>
            </Select>
            <Field label="Execution Count" name="executionCount" type="number" value={formData.executionCount || 0} onChange={handleChange} />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
              <label className="text-xs font-black text-slate-900">Is Active</label>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-20 mt-1.5 resize-none" placeholder="Workflow description..." />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workflow Builder</label>
              <p className="text-[9px] text-slate-400 ml-1 mt-1">Visual workflow builder coming in M08</p>
            </div>
          </>
        );

      case 'webhooks':
        return (
          <>
            <div className="col-span-2"><Field label="Webhook Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <div className="col-span-2"><Field label="URL" name="url" value={formData.url || ''} onChange={handleChange} required placeholder="https://..." /></div>
            <Select label="Method" name="method" value={formData.method || 'POST'} onChange={handleChange}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </Select>
            <Field label="Trigger Event" name="triggerEvent" value={formData.triggerEvent || ''} onChange={handleChange} required />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
              <label className="text-xs font-black text-slate-900">Is Active</label>
            </div>
            <Field label="Success Count" name="successCount" type="number" value={formData.successCount || 0} onChange={handleChange} />
            <Field label="Failure Count" name="failureCount" type="number" value={formData.failureCount || 0} onChange={handleChange} />
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headers</label>
              <p className="text-[9px] text-slate-400 ml-1 mt-1">Header editor coming soon</p>
            </div>
          </>
        );

      case 'industryTemplates':
        return (
          <>
            <div className="col-span-2"><Field label="Template Name" name="name" value={formData.name || ''} onChange={handleChange} required /></div>
            <Field label="Industry" name="industry" value={formData.industry || ''} onChange={handleChange} required />
            <Select label="Target Entity" name="targetEntity" value={formData.targetEntity || 'jobs'} onChange={handleChange}>
              <option value="jobs">Jobs</option>
              <option value="leads">Leads</option>
              <option value="deals">Deals</option>
              <option value="tickets">Tickets</option>
            </Select>
            <Field label="Version" name="version" type="number" value={formData.version || 1} onChange={handleChange} />
            <div className="flex items-center gap-2">
              <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={(e) => setFormData((prev: any) => ({ ...prev, isActive: e.target.checked }))} className="w-4 h-4" />
              <label className="text-xs font-black text-slate-900">Is Active</label>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Template Sections & Fields</label>
              <p className="text-[9px] text-slate-400 ml-1 mt-1">Section builder coming in M09</p>
            </div>
          </>
        );

      default:
        // Check if this is a custom entity from the active blueprint
        const customEntity = activeBlueprint.customEntities?.find(e => e.id === modal.type);
        if (customEntity) {
          return (
            <>
              {customEntity.fields.map(field => {
                const fieldValue = formData[field.id] || '';

                if (field.type === 'text' || field.type === 'email' || field.type === 'tel') {
                  return (
                    <div key={field.id} className={field.id === 'address' || field.id === 'description' ? 'col-span-2' : ''}>
                      <Field
                        label={field.label}
                        name={field.id}
                        type={field.type}
                        value={fieldValue}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                      />
                    </div>
                  );
                } else if (field.type === 'number') {
                  return (
                    <Field
                      key={field.id}
                      label={field.label}
                      name={field.id}
                      type="number"
                      value={fieldValue}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
                    />
                  );
                } else if (field.type === 'select' && field.options) {
                  return (
                    <Select
                      key={field.id}
                      label={field.label}
                      name={field.id}
                      value={fieldValue}
                      onChange={handleChange}
                    >
                      <option value="">Select {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </Select>
                  );
                } else if (field.type === 'date') {
                  return (
                    <Field
                      key={field.id}
                      label={field.label}
                      name={field.id}
                      type="date"
                      value={fieldValue}
                      onChange={handleChange}
                      required={field.required}
                    />
                  );
                } else if (field.type === 'checkbox') {
                  return (
                    <div key={field.id} className="flex items-center gap-3 col-span-2">
                      <input
                        type="checkbox"
                        id={field.id}
                        name={field.id}
                        checked={fieldValue === true}
                        onChange={(e) => handleChange({ target: { name: field.id, value: e.target.checked } } as any)}
                        className="w-5 h-5 rounded border-slate-300"
                      />
                      <label htmlFor={field.id} className="text-xs font-bold text-slate-700">
                        {field.label}
                      </label>
                    </div>
                  );
                } else if (field.type === 'textarea') {
                  return (
                    <div key={field.id} className="col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                      <textarea
                        name={field.id}
                        value={fieldValue}
                        onChange={handleChange}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-[30px] text-xs font-bold focus:outline-none h-24 mt-1.5 resize-none"
                        placeholder={field.placeholder}
                        required={field.required}
                      />
                    </div>
                  );
                }
                return null;
              })}
            </>
          );
        }
        return <p className="col-span-2 text-center text-slate-400 font-bold py-10 uppercase tracking-widest italic">Core Record Processor</p>;
    }
  };

  // Determine modal size based on type - subscriptions and invoices get larger modals
  const isLargeModal = modal.type === 'subscriptions' || modal.type === 'invoices';
  const modalMaxWidth = isLargeModal ? 'max-w-6xl' : 'max-w-2xl';
  const modalMaxHeight = isLargeModal ? 'max-h-[85vh]' : 'max-h-[60vh]';

  // Event type colors for calendar events modal header
  const getEventTypeHeaderColor = (eventType: string) => {
    const colors: Record<string, { bg: string; icon: string; iconBg: string }> = {
      'Meeting': { bg: 'bg-gradient-to-r from-amber-50 to-orange-50', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
      'Call': { bg: 'bg-gradient-to-r from-emerald-50 to-teal-50', icon: 'text-emerald-600', iconBg: 'bg-emerald-100' },
      'Personal': { bg: 'bg-gradient-to-r from-pink-50 to-rose-50', icon: 'text-pink-600', iconBg: 'bg-pink-100' },
      'Follow-up': { bg: 'bg-gradient-to-r from-violet-50 to-purple-50', icon: 'text-violet-600', iconBg: 'bg-violet-100' },
      'Internal': { bg: 'bg-gradient-to-r from-blue-50 to-cyan-50', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
      'Deadline': { bg: 'bg-gradient-to-r from-rose-50 to-red-50', icon: 'text-rose-600', iconBg: 'bg-rose-100' },
      'Reminder': { bg: 'bg-gradient-to-r from-slate-50 to-gray-50', icon: 'text-slate-600', iconBg: 'bg-slate-100' },
    };
    return colors[eventType] || colors['Meeting'];
  };

  const isCalendarEvent = modal.type === 'calendarEvents';
  const eventHeaderColors = isCalendarEvent ? getEventTypeHeaderColor(formData.type || 'Meeting') : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className={`bg-white w-full ${modalMaxWidth} rounded-[45px] shadow-2xl overflow-hidden animate-slide-up`}>
        <div className={`px-10 py-8 border-b border-slate-100 flex items-center justify-between ${isCalendarEvent ? eventHeaderColors?.bg : ''}`}>
          <div className="flex items-center gap-4">
            {isCalendarEvent && (
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${eventHeaderColors?.iconBg}`}>
                <Calendar size={24} className={eventHeaderColors?.icon} />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-black text-slate-900 capitalize">
                {isCalendarEvent
                  ? `${modal.initialData ? 'Edit' : 'New'} ${formData.type || 'Meeting'}`
                  : (() => {
                      const customEntity = activeBlueprint.customEntities?.find(e => e.id === modal.type);
                      if (customEntity) {
                        return `${modal.initialData ? 'Edit' : 'Create'} ${customEntity.name}`;
                      }
                      return `${modal.initialData ? 'Modify' : 'Create'} ${modal.type?.slice(0, -1)}`;
                    })()
                }
              </h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                {isCalendarEvent
                  ? `Calendar Event • ${formData.startTime ? new Date(formData.startTime).toLocaleDateString() : 'Select date'}`
                  : `Record ID: ${formData.id || 'NEW_AUTOGEN'}`
                }
              </p>
            </div>
          </div>
          <button onClick={closeModal} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-10">
          <div className={`grid grid-cols-1 ${isLargeModal ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-x-8 gap-y-6 ${modalMaxHeight} overflow-y-auto custom-scrollbar pr-2`}>
             {renderFields()}
          </div>
          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end gap-3">
             <button type="button" onClick={closeModal} className="px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50">Discard</button>
             <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center gap-2"><Save size={16} /> Persist Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Field = ({ label, name, required, ...props }: any) => {
  const { modal, settings } = useCRM();
  const isRequired = required || ((settings.requiredFields as any)?.[modal.type as string] || []).includes(name);

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label}
        {isRequired && <span className="text-rose-500 ml-1">*</span>}
      </label>
      <input
        className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-xs font-bold focus:outline-none ${
          isRequired ? 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'border-slate-100'
        }`}
        {...props}
      />
    </div>
  );
};

const Select = ({ label, name, required, children, ...props }: any) => {
  const { modal, settings } = useCRM();
  const isRequired = required || ((settings.requiredFields as any)?.[modal.type as string] || []).includes(name);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
          {label}
          {isRequired && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <select
        className={`w-full px-5 py-3.5 bg-slate-50 border rounded-2xl text-xs font-bold focus:outline-none ${
          isRequired ? 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100' : 'border-slate-100'
        }`}
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

export default RecordModal;