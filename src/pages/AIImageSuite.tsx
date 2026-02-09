import React, { useState, useRef, useMemo } from 'react';
import { 
  Sparkles, Upload, Wand2, Download, RotateCcw, AlertCircle, 
  CheckCircle2, UserPlus, Users, X, Save, FileText, UserSquare2,
  Target, Briefcase, Building2
} from 'lucide-react';
import { editImageWithAI } from '../services/gemini';
import { useCRM } from '../context/CRMContext';
import { EntityType } from '../types';

const AIImageSuite: React.FC = () => {
  const { leads, contacts, accounts, deals, upsertRecord } = useCRM();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Assignment State
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignType, setAssignType] = useState<EntityType>('leads');
  const [targetId, setTargetId] = useState('');
  const [saveTarget, setSaveTarget] = useState<'avatar' | 'document'>('avatar');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!originalImage || !prompt) return;
    
    setIsProcessing(true);
    setError(null);
    
    try {
      const base64Data = originalImage.split(',')[1];
      const mimeType = originalImage.split(';')[0].split(':')[1];
      
      const result = await editImageWithAI(base64Data, mimeType, prompt);
      if (result) {
        setProcessedImage(result);
      } else {
        throw new Error("No image returned from AI");
      }
    } catch (err: any) {
      setError(err.message || "Failed to process image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentEntityList = useMemo(() => {
    switch (assignType) {
      case 'leads': return leads;
      case 'contacts': return contacts;
      case 'accounts': return accounts;
      case 'deals': return deals;
      default: return [];
    }
  }, [assignType, leads, contacts, accounts, deals]);

  const handleCommitAssignment = () => {
    if (!processedImage || !targetId) {
      alert("Please select a target record.");
      return;
    }

    if (saveTarget === 'avatar') {
      const entity = currentEntityList.find(e => e.id === targetId);
      if (entity) {
        upsertRecord(assignType, { ...entity, avatar: processedImage });
      }
    } else {
      const entity = currentEntityList.find(e => e.id === targetId);
      upsertRecord('documents', {
        title: `AI Generated Asset - ${new Date().toLocaleDateString()}`,
        fileType: 'IMAGE',
        fileSize: 'AI Generated',
        url: processedImage,
        relatedToType: assignType,
        relatedToId: targetId
      });
    }

    setIsAssigning(false);
    setTargetId('');
    alert(`Successfully ${saveTarget === 'avatar' ? 'set avatar' : 'saved document'}!`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right-10 duration-500">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">AI Image Suite</h1>
        </div>
        <p className="text-slate-400">Enhance your lead photos or marketing assets using Gemini 2.5 Flash Image AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h3 className="font-semibold mb-4 text-white">Instructions</h3>
            <textarea 
              placeholder="e.g. 'Add a professional background', 'Fix lighting', 'Remove background'..."
              className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none mb-4 text-slate-200"
              value={prompt}
              onChange={(e) => setPrompt(e.target.amount)}
            />
            <button 
              onClick={handleProcess}
              disabled={!originalImage || !prompt || isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Wand2 size={18} />
                  Process with AI
                </>
              )}
            </button>
            
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-500 text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="font-semibold mb-4 text-white">Quick Presets</h3>
            <div className="space-y-3">
              {['Remove Background', 'Professional Office Background', 'Improve lighting and sharp details', 'Pencil Sketch Style'].map(preset => (
                <button 
                  key={preset}
                  onClick={() => setPrompt(preset)}
                  className="w-full text-left text-xs px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg hover:border-blue-500/50 hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewport */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {!originalImage ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-300">
                  <Upload size={32} className="text-slate-400 group-hover:text-white" />
                </div>
                <h2 className="text-xl font-bold mb-2">Upload Source Image</h2>
                <p className="text-slate-500 text-sm">Drag and drop or click to browse files</p>
                <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </div>
            ) : (
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Original</span>
                    <button onClick={() => setOriginalImage(null)} className="text-slate-500 hover:text-red-400 transition-colors">
                      <RotateCcw size={16} />
                    </button>
                  </div>
                  <div className="aspect-square bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
                    <img src={originalImage} className="w-full h-full object-contain p-4" alt="Original" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest">AI Result</span>
                    {processedImage && (
                      <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                        <CheckCircle2 size={12} />
                        Completed
                      </div>
                    )}
                  </div>
                  <div className="aspect-square bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
                    {processedImage ? (
                      <img src={processedImage} className="w-full h-full object-contain p-4" alt="Processed" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 italic text-sm text-center px-10">
                        {isProcessing ? (
                          <div className="flex flex-col items-center gap-4">
                             <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                             <p className="animate-pulse">Thinking & Painting...</p>
                          </div>
                        ) : (
                          "Define instructions and click process to generate a professional result."
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {processedImage && (
              <div className="mt-8 flex gap-4 relative">
                <a 
                  href={processedImage} 
                  download="ai-crm-asset.png"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-bold transition-all text-white"
                >
                  <Download size={20} />
                  Download
                </a>
                
                <button 
                  onClick={() => setIsAssigning(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 text-white"
                >
                  <Save size={20} />
                  Save to Record
                </button>

                <button 
                  onClick={() => { setProcessedImage(null); setPrompt(''); }}
                  className="bg-slate-800 text-slate-400 border border-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-700 hover:text-white transition-all"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {isAssigning && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden animate-slide-up">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Save AI Asset</h2>
              <button onClick={() => setIsAssigning(false)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Module</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'leads', label: 'Lead', icon: Target },
                    { id: 'contacts', label: 'Contact', icon: Users },
                    { id: 'accounts', label: 'Account', icon: Building2 },
                    { id: 'deals', label: 'Deal', icon: Briefcase }
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => { setAssignType(m.id as EntityType); setTargetId(''); }}
                      className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${assignType === m.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}
                    >
                      <m.icon size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Record</label>
                <select 
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.amount)}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold focus:outline-none"
                >
                  <option value="">Choose a record...</option>
                  {currentEntityList.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Action</label>
                <div className="flex gap-2">
                  {/* Avatars only for leads/contacts */}
                  {['leads', 'contacts'].includes(assignType) && (
                    <button 
                      onClick={() => setSaveTarget('avatar')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${saveTarget === 'avatar' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}
                    >
                      <UserSquare2 size={16} />
                      <span className="text-[10px] font-black uppercase">Set Avatar</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setSaveTarget('document')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${saveTarget === 'document' ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-300'}`}
                  >
                    <FileText size={16} />
                    <span className="text-[10px] font-black uppercase">Save to Docs</span>
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleCommitAssignment}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Confirm & Save Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIImageSuite;