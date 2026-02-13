import React, { useState } from 'react';
import { X, Send, MessageSquare, Phone, Sparkles, AlertCircle } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Communication, EntityType } from '../types';

interface SMSComposerProps {
  isOpen: boolean;
  onClose: () => void;
  recipientType: EntityType;
  recipientId: string;
  recipientName: string;
  recipientPhone?: string;
}

export const SMSComposer: React.FC<SMSComposerProps> = ({
  isOpen,
  onClose,
  recipientType,
  recipientId,
  recipientName,
  recipientPhone
}) => {
  const { upsertRecord, deleteRecord, currentUser, smsTemplates } = useCRM();
  const [to, setTo] = useState(recipientPhone || '');
  const [message, setMessage] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Seed default templates if none exist
  React.useEffect(() => {
    if (smsTemplates.length === 0 && isOpen) {
      const defaultTemplates = [
        {
          name: 'Quick Intro',
          content: 'Hi {Name}, this is {YourName} from CatchaCRM. Thanks for your interest! When would be a good time to chat?',
          category: 'Sales',
          isActive: true
        },
        {
          name: 'Follow Up',
          content: 'Hi {Name}, just following up on our recent conversation. Let me know if you have any questions!',
          category: 'Sales',
          isActive: true
        },
        {
          name: 'Appointment',
          content: 'Hi {Name}, just confirming our appointment scheduled for [DATE/TIME]. Please reply to confirm.',
          category: 'General',
          isActive: true
        },
        {
          name: 'Thank You',
          content: 'Hi {Name}, thank you for your business! We appreciate you choosing us. Feel free to reach out if you need anything.',
          category: 'General',
          isActive: true
        },
        {
          name: 'Quote Ready',
          content: 'Hi {Name}, your quote is ready! Check your email for details or reply here if you have questions.',
          category: 'Sales',
          isActive: true
        }
      ];

      // Insert default templates
      defaultTemplates.forEach(template => {
        upsertRecord('smsTemplates', template);
      });
    }
  }, [smsTemplates.length, isOpen, upsertRecord]);

  // Filter active templates
  const activeTemplates = smsTemplates.filter(t => t.isActive !== false);

  const applyTemplate = (template: typeof activeTemplates[0]) => {
    let msg = (template.content || '')
      .replace('{Name}', recipientName.split(' ')[0])
      .replace('{YourName}', currentUser?.name.split(' ')[0] || 'Team');

    setMessage(msg);

    // Update usage count
    if (template.id) {
      upsertRecord('smsTemplates', {
        id: template.id,
        usageCount: (template.usageCount || 0) + 1,
        lastUsedAt: new Date().toISOString()
      });
    }
  };

  const saveAsTemplate = () => {
    if (!templateName.trim() || !message.trim()) {
      alert('Please enter a template name and message');
      return;
    }

    upsertRecord('smsTemplates', {
      name: templateName,
      content: message,
      category: 'Custom',
      isActive: true,
      usageCount: 0
    });

    setTemplateName('');
    setShowSaveTemplate(false);
    alert('Template saved successfully!');
  };

  const deleteTemplate = (templateId: string) => {
    if (window.confirm('Delete this template?')) {
      deleteRecord('smsTemplates', templateId);
    }
  };

  const handleSend = () => {
    if (!to || !message) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate Australian phone number format (basic validation)
    const phoneRegex = /^(\+61|0)[2-9]\d{8}$/;
    const cleanPhone = to.replace(/\s/g, '');
    if (!phoneRegex.test(cleanPhone) && !cleanPhone.startsWith('+')) {
      alert('Please enter a valid phone number (Australian format recommended: +61 or 0X XXXX XXXX)');
      return;
    }

    const communication: Partial<Communication> = {
      type: 'SMS',
      subject: 'SMS Message',
      content: message,
      direction: 'Outbound',
      relatedToType: recipientType,
      relatedToId: recipientId,
      outcome: 'answered',
      metadata: {
        to: cleanPhone,
        characterCount: message.length,
        segments: Math.ceil(message.length / 160)
      }
    };

    upsertRecord('communications', communication);

    // Show success message (in real app, this would send via SMS API)
    alert('SMS queued successfully! (Mock mode - no actual SMS sent)');
    onClose();
  };

  const characterCount = message.length;
  const segmentCount = Math.ceil(characterCount / 160) || 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <MessageSquare size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Send SMS</h2>
              <p className="text-emerald-100 font-bold text-sm mt-1">Text message to {recipientName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-250px)] custom-scrollbar">
          <div className="space-y-6">
            {/* SMS Templates */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block flex items-center gap-2">
                <Sparkles size={12} />
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {activeTemplates.map((template, idx) => (
                  <div key={template.id || idx} className="relative group">
                    <button
                      onClick={() => applyTemplate(template)}
                      className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-emerald-100 transition-all"
                    >
                      {template.name}
                    </button>
                    {template.category === 'Custom' && (
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* To Field */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Phone Number *
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="+61 4XX XXX XXX"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2 ml-1">
                Australian format: +61 or 04XX XXX XXX
              </p>
            </div>

            {/* Message */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center justify-between">
                <span>Message *</span>
                <span className={`${characterCount > 160 ? 'text-amber-600' : 'text-slate-400'}`}>
                  {characterCount}/160 ({segmentCount} segment{segmentCount !== 1 ? 's' : ''})
                </span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Type your SMS message here..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                required
                maxLength={480}
              />
              {characterCount > 160 && (
                <div className="flex items-center gap-2 mt-2 text-amber-600">
                  <AlertCircle size={14} />
                  <p className="text-xs font-bold">Message will be sent as {segmentCount} segments (may incur additional charges)</p>
                </div>
              )}
            </div>

            {/* SMS Preview */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Preview
              </label>
              <div className="bg-slate-800 rounded-3xl p-6">
                <div className="max-w-[280px] mx-auto">
                  {/* Phone Frame */}
                  <div className="bg-emerald-500 rounded-2xl p-4 text-white text-sm shadow-lg">
                    <p className="break-words">{message || 'Your message will appear here...'}</p>
                  </div>
                  <div className="text-center mt-3">
                    <p className="text-slate-400 text-[10px] font-bold">To: {to || 'Phone number'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Save as Template */}
            {!showSaveTemplate && message && (
              <div>
                <button
                  onClick={() => setShowSaveTemplate(true)}
                  className="w-full px-4 py-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  💾 Save as Template
                </button>
              </div>
            )}

            {showSaveTemplate && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Template Name
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Invoice Reminder"
                  className="w-full px-4 py-2 bg-white border border-emerald-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-500 transition-all mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveAsTemplate}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => { setShowSaveTemplate(false); setTemplateName(''); }}
                    className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Mock Mode Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-800">
                <strong>Mock Mode:</strong> This SMS will be logged in Communications but not actually sent.
                SMS sending will be enabled when integrated with your Australian SMS trunk provider in production.
              </p>
            </div>

            {/* Pricing Info */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-xs text-slate-600">
                <strong className="text-slate-800">SMS Pricing:</strong> Standard rates apply per segment (160 characters).
                Australian mobile numbers: ~$0.04 per segment. International rates vary.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center">
          <div className="text-xs text-slate-500">
            <span className="font-bold">{segmentCount} SMS segment{segmentCount !== 1 ? 's' : ''}</span>
            {segmentCount > 1 && <span className="text-amber-600 ml-2">(Multi-part message)</span>}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!to || !message}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <Send size={14} />
                Send SMS
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
