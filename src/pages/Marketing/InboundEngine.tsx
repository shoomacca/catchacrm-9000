import React, { useState } from 'react';
import { Inbox, ClipboardList, MessageCircle, Calculator, TrendingUp, Users, Plus, Copy, Eye, Settings, Palette, Code, ArrowRight, Check, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { InboundForm, ChatWidget, Calculator as CalculatorType, FormField } from '../../types';

const StatCard = ({ label, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white border border-slate-200 p-8 rounded-[35px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-slide-up">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-14 h-14 rounded-2xl ${color} bg-opacity-10 flex items-center justify-center`}>
        <Icon size={28} className={color.replace('bg-', 'text-')} />
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-600">
          <TrendingUp size={10} />
          {trend}%
        </div>
      )}
    </div>
    <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{label}</h3>
    <p className="text-4xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

// Field types for form builder
const fieldTypes = [
  { id: 'text', label: 'Text Input', icon: '📝' },
  { id: 'email', label: 'Email', icon: '📧' },
  { id: 'phone', label: 'Phone', icon: '📞' },
  { id: 'textarea', label: 'Text Area', icon: '📄' },
  { id: 'select', label: 'Dropdown', icon: '⬇️' },
  { id: 'checkbox', label: 'Checkbox', icon: '☑️' },
  { id: 'radio', label: 'Radio', icon: '🔘' },
  { id: 'date', label: 'Date Picker', icon: '📅' },
];

// Default builder states
const defaultFormBuilder = {
  name: '',
  fields: [] as FormField[],
  submitButtonText: 'Submit',
  successMessage: 'Thank you for your submission!',
};

const defaultWidgetBuilder = {
  name: '',
  bubbleColor: '#8B5CF6',
  welcomeMessage: 'Hi! How can we help you today?',
  isActive: true,
  routingUserId: '',
};

const defaultCalcBuilder = {
  name: '',
  type: 'ROI' as const,
  baseRate: 0,
  isActive: true,
};

const InboundEngine: React.FC = () => {
  const { inboundForms, chatWidgets, calculators, users, upsertRecord } = useCRM();

  const [activeTab, setActiveTab] = useState<'forms' | 'widgets' | 'calculators'>('forms');
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const [showWidgetBuilder, setShowWidgetBuilder] = useState(false);
  const [showCalcBuilder, setShowCalcBuilder] = useState(false);

  // Builder states
  const [formBuilder, setFormBuilder] = useState(defaultFormBuilder);
  const [widgetBuilder, setWidgetBuilder] = useState(defaultWidgetBuilder);
  const [calcBuilder, setCalcBuilder] = useState(defaultCalcBuilder);

  // Editing IDs (null = new record)
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editingWidgetId, setEditingWidgetId] = useState<string | null>(null);
  const [editingCalcId, setEditingCalcId] = useState<string | null>(null);

  // Save handlers
  const handleSaveForm = () => {
    const formData: Partial<InboundForm> = {
      ...(editingFormId ? { id: editingFormId } : {}),
      name: formBuilder.name || 'Untitled Form',
      fields: formBuilder.fields,
      submitButtonText: formBuilder.submitButtonText,
      successMessage: formBuilder.successMessage,
      submissionCount: 0,
    };
    upsertRecord('inboundForms', formData);
    setShowFormBuilder(false);
    setFormBuilder(defaultFormBuilder);
    setEditingFormId(null);
  };

  const handleSaveWidget = () => {
    const widgetData: Partial<ChatWidget> = {
      ...(editingWidgetId ? { id: editingWidgetId } : {}),
      name: widgetBuilder.name || 'Untitled Widget',
      bubbleColor: widgetBuilder.bubbleColor,
      welcomeMessage: widgetBuilder.welcomeMessage,
      isActive: widgetBuilder.isActive,
      routingUserId: widgetBuilder.routingUserId || users[0]?.id || '',
    };
    upsertRecord('chatWidgets', widgetData);
    setShowWidgetBuilder(false);
    setWidgetBuilder(defaultWidgetBuilder);
    setEditingWidgetId(null);
  };

  const handleSaveCalculator = () => {
    const calcData: Partial<CalculatorType> = {
      ...(editingCalcId ? { id: editingCalcId } : {}),
      name: calcBuilder.name || 'Untitled Calculator',
      type: calcBuilder.type,
      baseRate: calcBuilder.baseRate,
      isActive: calcBuilder.isActive,
    };
    upsertRecord('calculators', calcData);
    setShowCalcBuilder(false);
    setCalcBuilder(defaultCalcBuilder);
    setEditingCalcId(null);
  };

  // Add field to form builder
  const addFieldToForm = (fieldType: string) => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      label: `New ${fieldType} Field`,
      type: fieldType as FormField['type'],
      required: false,
    };
    setFormBuilder(prev => ({ ...prev, fields: [...prev.fields, newField] }));
  };

  // Remove field from form builder
  const removeFieldFromForm = (fieldId: string) => {
    setFormBuilder(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== fieldId) }));
  };

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marketing</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Inbound Engine</h1>
        </div>
        <button
          onClick={() => {
            if (activeTab === 'forms') setShowFormBuilder(true);
            if (activeTab === 'widgets') setShowWidgetBuilder(true);
            if (activeTab === 'calculators') setShowCalcBuilder(true);
          }}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={16} />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Active Forms</p>
          <p className="text-3xl font-black text-slate-900">{inboundForms.length}</p>
          <p className="text-xs text-slate-500 mt-1">+12% this month</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Chat Widgets</p>
          <p className="text-3xl font-black text-slate-900">{chatWidgets.filter(w => w.isActive).length}</p>
          <p className="text-xs text-slate-500 mt-1">+8% this month</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Calculators</p>
          <p className="text-3xl font-black text-slate-900">{calculators.length}</p>
          <p className="text-xs text-slate-500 mt-1">+15% this month</p>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Leads</p>
          <p className="text-3xl font-black text-slate-900">{inboundForms.reduce((sum, f) => sum + f.submissionCount, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-500 mt-1">+23% this month</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200 p-4 rounded-[25px] shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'forms'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Inbound Forms ({inboundForms.length})
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'widgets'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Chat Widgets ({chatWidgets.length})
          </button>
          <button
            onClick={() => setActiveTab('calculators')}
            className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'calculators'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Calculators ({calculators.length})
          </button>
        </div>
      </div>

      {/* Forms Tab Content */}
      {activeTab === 'forms' && !showFormBuilder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Forms</h3>
            <button
              onClick={() => setShowFormBuilder(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all"
            >
              <Plus size={16} />
              New Form
            </button>
          </div>

          {inboundForms.map((form, index) => (
            <div key={form.id} className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-black text-slate-900 mb-1">{form.name}</h4>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-600"><span className="font-bold">{form.fields.length}</span> fields</span>
                    <span className="text-slate-600"><span className="font-bold">{form.submissionCount}</span> submissions</span>
                    <span className="text-emerald-600 font-bold">{form.submissionCount > 0 ? ((form.submissionCount / 100) * 15).toFixed(1) : 0}% conversion</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all">
                    <Eye size={16} />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:shadow-md transition-all">
                    <Copy size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setFormBuilder({
                        name: form.name,
                        fields: form.fields,
                        submitButtonText: form.submitButtonText,
                        successMessage: form.successMessage,
                      });
                      setEditingFormId(form.id);
                      setShowFormBuilder(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Builder */}
      {activeTab === 'forms' && showFormBuilder && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">{editingFormId ? 'Edit Form' : 'New Form'}</h3>
            <button onClick={() => { setShowFormBuilder(false); setFormBuilder(defaultFormBuilder); setEditingFormId(null); }} className="text-slate-500 hover:text-slate-700 font-bold">
              ← Back to Forms
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Field Library */}
            <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Field Library</h4>
              <div className="space-y-2">
                {fieldTypes.map(field => (
                  <div
                    key={field.id}
                    onClick={() => addFieldToForm(field.id)}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 cursor-pointer transition-all group"
                  >
                    <span className="text-2xl">{field.icon}</span>
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-600">{field.label}</span>
                    <Plus size={14} className="ml-auto text-slate-400 group-hover:text-blue-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Form Canvas */}
            <div className="col-span-2 bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Form Name</label>
                <input
                  type="text"
                  value={formBuilder.name}
                  onChange={(e) => setFormBuilder(prev => ({ ...prev, name: e.target.amount }))}
                  placeholder="My Contact Form"
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-semibold"
                />
              </div>

              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Form Canvas</h4>
              <div className="space-y-3 bg-slate-50 p-6 rounded-xl min-h-[300px]">
                {formBuilder.fields.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-semibold">Click fields from the library to add them</p>
                    <p className="text-sm mt-2">Your form will appear here</p>
                  </div>
                ) : (
                  formBuilder.fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200 group">
                      <span className="text-slate-400 font-bold">{index + 1}.</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...formBuilder.fields];
                          updated[index].label = e.target.amount;
                          setFormBuilder(prev => ({ ...prev, fields: updated }));
                        }}
                        className="flex-1 bg-transparent font-semibold focus:outline-none"
                      />
                      <span className="text-xs text-slate-400 uppercase">{field.type}</span>
                      <label className="flex items-center gap-1 text-xs text-slate-500">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...formBuilder.fields];
                            updated[index].required = e.target.checked;
                            setFormBuilder(prev => ({ ...prev, fields: updated }));
                          }}
                        />
                        Required
                      </label>
                      <button
                        onClick={() => removeFieldFromForm(field.id)}
                        className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-600 transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Submit Button Text</label>
                  <input
                    type="text"
                    value={formBuilder.submitButtonText}
                    onChange={(e) => setFormBuilder(prev => ({ ...prev, submitButtonText: e.target.amount }))}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Success Message</label>
                  <input
                    type="text"
                    value={formBuilder.successMessage}
                    onChange={(e) => setFormBuilder(prev => ({ ...prev, successMessage: e.target.amount }))}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setShowFormBuilder(false); setFormBuilder(defaultFormBuilder); setEditingFormId(null); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveForm}
                  disabled={!formBuilder.name}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {editingFormId ? 'Update Form' : 'Save Form'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widgets Tab Content */}
      {activeTab === 'widgets' && !showWidgetBuilder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Your Chat Widgets</h3>
            <button onClick={() => setShowWidgetBuilder(true)} className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center gap-2">
              <Plus size={16} />
              New Widget
            </button>
          </div>

          {chatWidgets.map((widget, index) => (
            <div key={widget.id} className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-slate-900">{widget.name}</h4>
                    {widget.isActive && (
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase">Active</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-600">Color: <span className="font-bold" style={{ color: widget.bubbleColor }}>{widget.bubbleColor}</span></span>
                    <span className="text-slate-600">Routing: <span className="font-bold">{users.find(u => u.id === widget.routingUserId)?.name || 'Unassigned'}</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all">
                    <Code size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setWidgetBuilder({
                        name: widget.name,
                        bubbleColor: widget.bubbleColor,
                        welcomeMessage: widget.welcomeMessage,
                        isActive: widget.isActive,
                        routingUserId: widget.routingUserId,
                      });
                      setEditingWidgetId(widget.id);
                      setShowWidgetBuilder(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                  >
                    Customize
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Widget Builder */}
      {activeTab === 'widgets' && showWidgetBuilder && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">{editingWidgetId ? 'Edit Widget' : 'New Widget'}</h3>
            <button onClick={() => { setShowWidgetBuilder(false); setWidgetBuilder(defaultWidgetBuilder); setEditingWidgetId(null); }} className="text-slate-500 hover:text-slate-700 font-bold">
              ← Back to Widgets
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Settings Panel */}
            <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Widget Settings</h4>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Widget Name</label>
                    <input
                      type="text"
                      placeholder="Support Chat"
                      value={widgetBuilder.name}
                      onChange={(e) => setWidgetBuilder(prev => ({ ...prev, name: e.target.amount }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Welcome Message</label>
                    <textarea
                      placeholder="Hi! How can we help you today?"
                      value={widgetBuilder.welcomeMessage}
                      onChange={(e) => setWidgetBuilder(prev => ({ ...prev, welcomeMessage: e.target.amount }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-semibold resize-none"
                      rows={3}
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Primary Color</label>
                    <div className="flex gap-2">
                      {['#3B82F6', '#8B5CF6', '#10B981', '#F97316', '#EF4444'].map(color => (
                        <div
                          key={color}
                          onClick={() => setWidgetBuilder(prev => ({ ...prev, bubbleColor: color }))}
                          className={`w-10 h-10 rounded-xl cursor-pointer hover:scale-110 transition-transform ${widgetBuilder.bubbleColor === color ? 'ring-2 ring-offset-2 ring-slate-900' : ''}`}
                          style={{ backgroundColor: color }}
                        ></div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Route to User</label>
                    <select
                      value={widgetBuilder.routingUserId}
                      onChange={(e) => setWidgetBuilder(prev => ({ ...prev, routingUserId: e.target.amount }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none font-semibold"
                    >
                      <option value="">Select user...</option>
                      {users.map(user => (
                        <option key={user.id} value={user.id}>{user.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="widgetActive"
                      checked={widgetBuilder.isActive}
                      onChange={(e) => setWidgetBuilder(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <label htmlFor="widgetActive" className="text-sm font-bold text-slate-700">Widget Active</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="col-span-2 bg-slate-100 p-6 rounded-[25px] border border-slate-200 relative overflow-hidden" style={{ minHeight: '500px' }}>
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Live Preview</h4>

              {/* Mock website background */}
              <div className="bg-white rounded-xl p-8 shadow-lg h-[440px] relative">
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                  <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                </div>

                {/* Chat widget preview */}
                <div className="absolute bottom-6 right-6">
                  <div className="text-white p-4 rounded-2xl shadow-2xl w-72 animate-slide-up" style={{ backgroundColor: widgetBuilder.bubbleColor }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <MessageCircle size={18} style={{ color: widgetBuilder.bubbleColor }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{widgetBuilder.name || 'Support Team'}</p>
                        <p className="text-[10px] opacity-75">Online</p>
                      </div>
                    </div>
                    <p className="text-sm">{widgetBuilder.welcomeMessage || 'Hi! How can we help you today?'}</p>
                    <input type="text" placeholder="Type your message..." className="w-full mt-3 px-3 py-2 rounded-xl text-slate-900 text-sm" />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setShowWidgetBuilder(false); setWidgetBuilder(defaultWidgetBuilder); setEditingWidgetId(null); }}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveWidget}
                  disabled={!widgetBuilder.name}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
                >
                  {editingWidgetId ? 'Update Widget' : 'Save Widget'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculators Tab Content */}
      {activeTab === 'calculators' && !showCalcBuilder && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Your Calculators</h3>
            <button onClick={() => setShowCalcBuilder(true)} className="text-emerald-600 hover:text-emerald-700 text-sm font-bold flex items-center gap-2">
              <Plus size={16} />
              New Calculator
            </button>
          </div>

          {calculators.map((calc, index) => (
            <div key={calc.id} className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm hover:shadow-xl transition-all animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="text-lg font-black text-slate-900">{calc.name}</h4>
                    <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{calc.type}</span>
                    {calc.isActive && (
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-[10px] font-black uppercase">Active</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-600">Base Rate: <span className="font-bold">{calc.baseRate || 0}%</span></span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all">
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setCalcBuilder({
                        name: calc.name,
                        type: calc.type,
                        baseRate: calc.baseRate || 0,
                        isActive: calc.isActive,
                      });
                      setEditingCalcId(calc.id);
                      setShowCalcBuilder(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-all"
                  >
                    Edit Logic
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Calculator Builder */}
      {activeTab === 'calculators' && showCalcBuilder && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900">{editingCalcId ? 'Edit Calculator' : 'New Calculator'}</h3>
            <button onClick={() => { setShowCalcBuilder(false); setCalcBuilder(defaultCalcBuilder); setEditingCalcId(null); }} className="text-slate-500 hover:text-slate-700 font-bold">
              ← Back to Calculators
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Configuration */}
            <div className="bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm space-y-6">
              <div>
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Calculator Config</h4>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Calculator Name</label>
                    <input
                      type="text"
                      placeholder="My Calculator"
                      value={calcBuilder.name}
                      onChange={(e) => setCalcBuilder(prev => ({ ...prev, name: e.target.amount }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Calculator Type</label>
                    <select
                      value={calcBuilder.type}
                      onChange={(e) => setCalcBuilder(prev => ({ ...prev, type: e.target.amount as 'ROI' | 'Repayment' | 'SolarYield' }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-semibold"
                    >
                      <option value="ROI">ROI Calculator</option>
                      <option value="Repayment">Repayment Calculator</option>
                      <option value="SolarYield">Solar Yield Calculator</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">Base Rate (%)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={calcBuilder.baseRate}
                      onChange={(e) => setCalcBuilder(prev => ({ ...prev, baseRate: parseFloat(e.target.amount) || 0 }))}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="calcActive"
                      checked={calcBuilder.isActive}
                      onChange={(e) => setCalcBuilder(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-300"
                    />
                    <label htmlFor="calcActive" className="text-sm font-bold text-slate-700">Calculator Active</label>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="col-span-2 bg-white border border-slate-200 p-6 rounded-[25px] shadow-sm">
              <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Calculator Preview</h4>

              <div className="bg-gradient-to-br from-emerald-50 to-blue-50 p-8 rounded-xl">
                <h3 className="text-2xl font-black text-slate-900 mb-6">{calcBuilder.name || 'Calculator'}</h3>

                <div className="space-y-4 mb-6">
                  {calcBuilder.type === 'ROI' && (
                    <>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Investment Amount ($)</label>
                        <input type="number" placeholder="10000" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Expected Return ($)</label>
                        <input type="number" placeholder="15000" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg" />
                      </div>
                    </>
                  )}
                  {calcBuilder.type === 'Repayment' && (
                    <>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Loan Amount ($)</label>
                        <input type="number" placeholder="100000" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Term (Months)</label>
                        <input type="number" placeholder="60" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg" />
                      </div>
                    </>
                  )}
                  {calcBuilder.type === 'SolarYield' && (
                    <>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">System Size (kW)</label>
                        <input type="number" placeholder="6.6" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg" />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-slate-700 mb-2 block">Daily Sun Hours</label>
                        <input type="number" placeholder="5" className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none font-bold text-lg" />
                      </div>
                    </>
                  )}
                </div>

                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-black text-lg shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                  Calculate
                  <ArrowRight size={20} />
                </button>

                <div className="mt-6 p-6 bg-white rounded-xl shadow-lg border-4 border-emerald-500">
                  <p className="text-sm font-bold text-slate-600 mb-2">Result</p>
                  <p className="text-5xl font-black text-emerald-600">{calcBuilder.baseRate || 0}%</p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => { setShowCalcBuilder(false); setCalcBuilder(defaultCalcBuilder); setEditingCalcId(null); }}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCalculator}
                  disabled={!calcBuilder.name}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  {editingCalcId ? 'Update Calculator' : 'Save Calculator'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Funnel */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 rounded-[35px] shadow-xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-blue-200">Conversion Metrics</h3>
            <p className="text-2xl font-black">Lead Generation Performance</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-blue-200 text-xs font-bold uppercase mb-1">Visits</p>
            <p className="text-2xl font-black">12,847</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-blue-200 text-xs font-bold uppercase mb-1">Interactions</p>
            <p className="text-2xl font-black">2,456</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-blue-200 text-xs font-bold uppercase mb-1">Submissions</p>
            <p className="text-2xl font-black">1,247</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
            <p className="text-blue-200 text-xs font-bold uppercase mb-1">Conversion</p>
            <p className="text-2xl font-black text-emerald-300">19.1%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboundEngine;
