import React, { useState } from 'react';
import { X, FileText, Upload, Link as LinkIcon, File } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Document } from '../types';

interface DocumentComposerProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Document>;
  mode?: 'create' | 'edit';
}

export const DocumentComposer: React.FC<DocumentComposerProps> = ({
  isOpen,
  onClose,
  initialData,
  mode = 'create'
}) => {
  const { upsertRecord } = useCRM();

  const [title, setTitle] = useState(initialData?.title || initialData?.name || '');
  const [fileType, setFileType] = useState(initialData?.fileType || '');
  const [fileSize, setFileSize] = useState(initialData?.fileSize || '');
  const [url, setUrl] = useState(initialData?.url || initialData?.fileUrl || '');
  const [contentText, setContentText] = useState(initialData?.contentText || '');
  const [uploadedBy, setUploadedBy] = useState(initialData?.uploadedBy || '');
  const [version, setVersion] = useState(initialData?.version?.toString() || '1');

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter a document title');
      return;
    }
    if (!fileType.trim()) {
      alert('Please enter a file type');
      return;
    }
    if (!url.trim()) {
      alert('Please enter a file URL');
      return;
    }

    const document: Partial<Document> = {
      ...(initialData?.id && { id: initialData.id }),
      title: title.trim(),
      fileType: fileType.trim(),
      fileSize: fileSize.trim() || '0 KB',
      url: url.trim(),
      contentText: contentText.trim() || undefined,
      uploadedBy: uploadedBy.trim() || undefined,
      version: version ? parseInt(version) : 1,
      relatedToType: initialData?.relatedToType || 'accounts',
      relatedToId: initialData?.relatedToId || '',
    };

    upsertRecord('documents', document);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[45px] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-600 to-gray-600 p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">
                {mode === 'create' ? 'New Document' : 'Edit Document'}
              </h2>
              <p className="text-white/80 font-bold text-sm mt-1">
                {mode === 'create' ? 'Upload a new document' : 'Update document details'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
          <div className="space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contract Agreement 2024"
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  File Type *
                </label>
                <div className="relative">
                  <File size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="PPTX">PPTX</option>
                    <option value="TXT">TXT</option>
                    <option value="CSV">CSV</option>
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  File Size
                </label>
                <div className="relative">
                  <Upload size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={fileSize}
                    onChange={(e) => setFileSize(e.target.value)}
                    placeholder="1.2 MB"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                File URL *
              </label>
              <div className="relative">
                <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://storage.example.com/docs/contract.pdf"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                Content Text (Optional)
              </label>
              <textarea
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                rows={4}
                placeholder="Extracted text content from document..."
                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Uploaded By
                </label>
                <input
                  type="text"
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  placeholder="User Name"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                  Version
                </label>
                <input
                  type="number"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="1"
                  min="1"
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-100 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 p-6 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-8 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-4 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-slate-700 hover:to-gray-700 transition-all shadow-lg shadow-slate-500/20"
          >
            {mode === 'create' ? 'Create Document' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
