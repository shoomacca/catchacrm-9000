import React, { useState } from 'react';
import {
  PenTool, Sparkles, FileText, Mail, MessageSquare, Copy, Check,
  RefreshCcw, Wand2, Minimize2, Maximize2, Zap, Save, Trash2,
  ChevronRight, Plus, Search
} from 'lucide-react';

type ToolType = 'rewrite' | 'grammar' | 'expand' | 'shorten' | 'professional' | 'friendly';

interface Template {
  id: string;
  name: string;
  category: 'email' | 'sms' | 'proposal';
  subject?: string;
  content: string;
}

const AIWritingTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tools' | 'templates'>('tools');
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [templates] = useState<Template[]>([
    { id: '1', name: 'Welcome New Lead', category: 'email', subject: 'Welcome to {{company}}!', content: 'Hi {{contact.name}},\n\nThank you for your interest in {{company}}. We\'re excited to have you!\n\nI\'d love to schedule a quick call to understand your needs better.\n\nBest regards,\n{{user.name}}' },
    { id: '2', name: 'Quote Follow-up', category: 'email', subject: 'Following up on Quote #{{quote.number}}', content: 'Hi {{contact.name}},\n\nI wanted to follow up on the quote I sent over. Do you have any questions?\n\nThe quote is valid until {{quote.expiry}}.\n\nLet me know how I can help!\n\n{{user.name}}' },
    { id: '3', name: 'Invoice Reminder', category: 'email', subject: 'Invoice #{{invoice.number}} - Payment Due', content: 'Hi {{contact.name}},\n\nThis is a friendly reminder that invoice #{{invoice.number}} for ${{invoice.total}} is due on {{invoice.dueDate}}.\n\nPlease let us know if you have any questions.\n\nThank you,\n{{user.name}}' },
    { id: '4', name: 'Appointment Confirmation', category: 'sms', content: 'Hi {{contact.name}}, your appointment with {{company}} is confirmed for {{appointment.date}} at {{appointment.time}}. Reply CONFIRM to confirm or call us to reschedule.' },
    { id: '5', name: 'Job Complete', category: 'sms', content: 'Hi {{contact.name}}, the job at {{job.address}} has been completed. Total: ${{job.total}}. Thank you for choosing {{company}}!' },
  ]);

  const tools: { type: ToolType; label: string; icon: any; description: string }[] = [
    { type: 'rewrite', label: 'Rewrite', icon: RefreshCcw, description: 'Rephrase your text while keeping the meaning' },
    { type: 'grammar', label: 'Fix Grammar', icon: Check, description: 'Fix spelling, grammar, and punctuation' },
    { type: 'expand', label: 'Expand', icon: Maximize2, description: 'Add more detail and context' },
    { type: 'shorten', label: 'Shorten', icon: Minimize2, description: 'Make it more concise' },
    { type: 'professional', label: 'Professional', icon: FileText, description: 'Make the tone more formal' },
    { type: 'friendly', label: 'Friendly', icon: MessageSquare, description: 'Make the tone more casual' },
  ];

  const handleProcess = async (tool: ToolType) => {
    if (!inputText.trim()) return;

    setActiveTool(tool);
    setIsProcessing(true);

    // Simulate AI processing (in real app, this would call n8n webhook)
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock transformations
    let result = inputText;
    switch (tool) {
      case 'grammar':
        result = inputText.charAt(0).toUpperCase() + inputText.slice(1);
        if (!result.endsWith('.') && !result.endsWith('!') && !result.endsWith('?')) {
          result += '.';
        }
        break;
      case 'professional':
        result = `Dear Sir/Madam,\n\n${inputText}\n\nBest regards`;
        break;
      case 'friendly':
        result = `Hey there!\n\n${inputText}\n\nCheers!`;
        break;
      case 'expand':
        result = `${inputText}\n\nAdditionally, I wanted to mention that we value our relationship and are committed to providing excellent service. Please don't hesitate to reach out if you have any questions or concerns.`;
        break;
      case 'shorten':
        result = inputText.split(' ').slice(0, Math.ceil(inputText.split(' ').length * 0.6)).join(' ');
        break;
      case 'rewrite':
        result = `[Rewritten] ${inputText}`;
        break;
    }

    setOutputText(result);
    setIsProcessing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up max-w-[1400px] mx-auto pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Assistant</p>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">AI Writing Tools</h1>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-xl">
          <Zap size={16} className="text-violet-600" />
          <span className="text-xs font-bold text-violet-600">Powered by n8n + AI</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'tools'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <Wand2 size={16} />
          Writing Tools
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'templates'
              ? 'bg-slate-900 text-white shadow-lg'
              : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
          }`}
        >
          <FileText size={16} />
          Templates
        </button>
      </div>

      {/* Writing Tools Tab */}
      {activeTab === 'tools' && (
        <div className="grid grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Input Text</h3>
              <p className="text-xs text-slate-400 mt-1">Paste or type your content here</p>
            </div>
            <div className="p-6">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full h-64 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 resize-none focus:outline-none focus:border-violet-500 transition-all"
              />
              <div className="flex items-center justify-between mt-4">
                <span className="text-[10px] font-bold text-slate-400">{inputText.length} characters</span>
                <button
                  onClick={() => setInputText('')}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Tool Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">AI Actions</p>
              <div className="grid grid-cols-3 gap-2">
                {tools.map(tool => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.type}
                      onClick={() => handleProcess(tool.type)}
                      disabled={isProcessing || !inputText.trim()}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        activeTool === tool.type && isProcessing
                          ? 'bg-violet-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 disabled:opacity-50'
                      }`}
                    >
                      {activeTool === tool.type && isProcessing ? (
                        <RefreshCcw size={14} className="animate-spin" />
                      ) : (
                        <Icon size={14} />
                      )}
                      {tool.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Output */}
          <div className="bg-white border border-slate-200 rounded-[25px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Output</h3>
                  <p className="text-xs text-slate-400 mt-1">AI-enhanced content</p>
                </div>
                {outputText && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-violet-300 transition-all"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>
            <div className="p-6">
              {outputText ? (
                <div className="w-full h-64 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-900 overflow-auto whitespace-pre-wrap">
                  {outputText}
                </div>
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="text-center">
                    <Sparkles size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-400">Your enhanced text will appear here</p>
                    <p className="text-xs text-slate-400 mt-1">Select a tool and click to transform</p>
                  </div>
                </div>
              )}
              {outputText && (
                <div className="flex items-center justify-between mt-4">
                  <span className="text-[10px] font-bold text-slate-400">{outputText.length} characters</span>
                  <button
                    onClick={() => setInputText(outputText)}
                    className="text-xs font-bold text-violet-600 hover:text-violet-700"
                  >
                    Use as input
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white border border-slate-200 rounded-[35px] overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search templates..."
                className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold w-72 focus:outline-none focus:border-violet-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-violet-700 transition-all">
              <Plus size={14} />
              New Template
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="p-6 hover:bg-slate-50 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                        template.category === 'email' ? 'bg-blue-50 text-blue-600' :
                        template.category === 'sms' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-violet-50 text-violet-600'
                      }`}>
                        {template.category}
                      </span>
                      <h3 className="text-sm font-black text-slate-900">{template.name}</h3>
                    </div>
                    {template.subject && (
                      <p className="text-xs font-bold text-slate-600 mb-1">Subject: {template.subject}</p>
                    )}
                    <p className="text-xs text-slate-400 line-clamp-2">{template.content}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                      <Copy size={14} className="text-slate-400" />
                    </button>
                    <ChevronRight size={16} className="text-slate-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="p-20 text-center">
              <FileText size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-sm font-bold text-slate-400">No templates found</p>
            </div>
          )}
        </div>
      )}

      {/* n8n Integration Notice */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
            <Zap size={24} className="text-violet-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900">n8n Integration Ready</h3>
            <p className="text-xs text-slate-500 mt-1">
              Connect your n8n instance to enable real AI processing. Create webhooks for each tool action
              and configure your preferred AI model (GPT-4, Claude, etc.).
            </p>
            <button className="mt-3 text-xs font-bold text-violet-600 hover:text-violet-700">
              Configure Integration →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIWritingTools;
