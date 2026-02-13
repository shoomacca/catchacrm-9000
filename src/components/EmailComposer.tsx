import React, { useState } from 'react';
import { X, Send, Paperclip, User, Mail, FileText, Sparkles } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Communication, EntityType } from '../types';

interface EmailComposerProps {
  isOpen: boolean;
  onClose: () => void;
  recipientType: EntityType;
  recipientId: string;
  recipientName: string;
  recipientEmail?: string;
}

export const EmailComposer: React.FC<EmailComposerProps> = ({
  isOpen,
  onClose,
  recipientType,
  recipientId,
  recipientName,
  recipientEmail
}) => {
  const { upsertRecord, currentUser, emailTemplates } = useCRM();
  const [to, setTo] = useState(recipientEmail || '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);

  // Seed default templates if none exist
  React.useEffect(() => {
    if (emailTemplates.length === 0 && isOpen) {
      const defaultTemplates = [
        {
          name: 'Welcome',
          subject: 'Welcome to {Company}!',
          bodyText: 'Hi {Name},\n\nThank you for your interest in our services. We\'re excited to work with you!\n\nBest regards,\n{YourName}',
          category: 'General',
          isActive: true
        },
        {
          name: 'Follow Up',
          subject: 'Following up on our conversation',
          bodyText: 'Hi {Name},\n\nI wanted to follow up on our recent conversation about your project needs.\n\nWould you be available for a quick call this week?\n\nBest regards,\n{YourName}',
          category: 'Sales',
          isActive: true
        },
        {
          name: 'Quote Sent',
          subject: 'Quote #{QuoteNumber} for your review',
          bodyText: 'Hi {Name},\n\nPlease find attached your quote for the {Service} project.\n\nThis quote is valid for 30 days. Please let me know if you have any questions!\n\nBest regards,\n{YourName}',
          category: 'Sales',
          isActive: true
        },
        {
          name: 'Invoice Sent',
          subject: 'Invoice #{InvoiceNumber} - Payment Due',
          bodyText: 'Hi {Name},\n\nPlease find attached invoice #{InvoiceNumber} for recent services.\n\nPayment is due within 30 days. You can pay via bank transfer or credit card.\n\nThank you for your business!\n\nBest regards,\n{YourName}',
          category: 'Finance',
          isActive: true
        },
        {
          name: 'Thank You',
          subject: 'Thank you for your business!',
          bodyText: 'Hi {Name},\n\nThank you for choosing {Company}. It was a pleasure working with you!\n\nIf you need anything else, please don\'t hesitate to reach out.\n\nBest regards,\n{YourName}',
          category: 'General',
          isActive: true
        }
      ];

      // Insert default templates
      defaultTemplates.forEach(template => {
        upsertRecord('emailTemplates', template);
      });
    }
  }, [emailTemplates.length, isOpen, upsertRecord]);

  // Filter active templates
  const activeTemplates = emailTemplates.filter(t => t.isActive !== false);

  const applyTemplate = (template: typeof activeTemplates[0]) => {
    let sub = (template.subject || '')
      .replace('{Company}', 'CatchaCRM')
      .replace('{Name}', recipientName)
      .replace('{QuoteNumber}', 'Q-001')
      .replace('{InvoiceNumber}', 'INV-001');

    let bod = (template.bodyText || template.bodyHtml || '')
      .replace('{Company}', 'CatchaCRM')
      .replace('{Name}', recipientName)
      .replace('{YourName}', currentUser?.name || 'Team')
      .replace('{Service}', 'Solar Installation')
      .replace('{QuoteNumber}', 'Q-001')
      .replace('{InvoiceNumber}', 'INV-001');

    setSubject(sub);
    setBody(bod);

    // Update usage count
    if (template.id) {
      upsertRecord('emailTemplates', {
        id: template.id,
        usageCount: (template.usageCount || 0) + 1,
        lastUsedAt: new Date().toISOString()
      });
    }
  };

  const handleSend = () => {
    if (!to || !subject || !body) {
      alert('Please fill in all required fields');
      return;
    }

    const communication: Partial<Communication> = {
      type: 'Email',
      subject,
      content: body,
      direction: 'Outbound',
      relatedToType: recipientType,
      relatedToId: recipientId,
      outcome: 'answered',
      metadata: {
        to,
        cc,
        bcc,
        attachments
      }
    };

    upsertRecord('communications', communication);

    // Show success message (in real app, this would actually send email via API)
    alert('Email sent successfully! (Mock mode - no actual email sent)');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Mail size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Compose Email</h2>
              <p className="text-purple-100 font-bold text-sm mt-1">Send email to {recipientName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            {/* Email Templates */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-3 block flex items-center gap-2">
                <Sparkles size={12} />
                Quick Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {activeTemplates.map((template, idx) => (
                  <button
                    key={template.id || idx}
                    onClick={() => applyTemplate(template)}
                    className="px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-purple-100 transition-all"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            {/* To Field */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                To *
              </label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* CC/BCC Toggles */}
            <div className="flex gap-3">
              {!showCc && (
                <button
                  onClick={() => setShowCc(true)}
                  className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
                >
                  + Add CC
                </button>
              )}
              {!showBcc && (
                <button
                  onClick={() => setShowBcc(true)}
                  className="text-xs font-bold text-slate-500 hover:text-purple-600 transition-colors"
                >
                  + Add BCC
                </button>
              )}
            </div>

            {/* CC Field */}
            {showCc && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center justify-between">
                  <span>CC</span>
                  <button onClick={() => setShowCc(false)} className="text-slate-400 hover:text-rose-500">
                    <X size={14} />
                  </button>
                </label>
                <input
                  type="text"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com (separate multiple with commas)"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            )}

            {/* BCC Field */}
            {showBcc && (
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block flex items-center justify-between">
                  <span>BCC</span>
                  <button onClick={() => setShowBcc(false)} className="text-slate-400 hover:text-rose-500">
                    <X size={14} />
                  </button>
                </label>
                <input
                  type="text"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com (separate multiple with commas)"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            )}

            {/* Subject */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Subject *
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject line"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Message *
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                placeholder="Type your message here..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-purple-500 transition-all resize-none"
                required
              />
            </div>

            {/* Attachments */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Attachments
              </label>
              <div className="w-full p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <Paperclip size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-400 text-center">
                  Attachments disabled in demo mode
                </p>
                <p className="text-[10px] text-slate-400 mt-1 text-center">
                  Email sending with attachments requires SMTP integration
                </p>
              </div>
            </div>

            {/* Mock Mode Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-800">
                <strong>Mock Mode:</strong> This email will be logged in Communications but not actually sent.
                Email sending will be enabled when integrated with SMTP/SendGrid in production.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => {
                const draft = {
                  to,
                  subject,
                  body,
                  cc,
                  bcc,
                  recipientId,
                  recipientType,
                  savedAt: new Date().toISOString()
                };
                const drafts = JSON.parse(localStorage.getItem('emailDrafts') || '[]');
                drafts.push(draft);
                localStorage.setItem('emailDrafts', JSON.stringify(drafts));
                alert('Draft saved successfully!');
              }}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
            >
              Save Draft
            </button>
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
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/20"
            >
              <span className="flex items-center gap-2">
                <Send size={14} />
                Send Email
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
