import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Check, Image, Plus } from 'lucide-react';

interface PhotoUploaderProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

const PhotoUploader: React.FC<PhotoUploaderProps> = ({ photos, onPhotosChange, maxPhotos = 10 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        onPhotosChange([...photos, dataUrl]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {/* Existing Photos Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo, index) => (
            <div key={index} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={photo}
                alt={`Evidence ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-lg text-[10px] font-bold text-white">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      {photos.length < maxPhotos && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              dragOver ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {dragOver ? <Upload size={28} /> : <Camera size={28} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700">
                {dragOver ? 'Drop photos here' : 'Add Evidence Photos'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Drag & drop or click to upload ({photos.length}/{maxPhotos})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Photo count badge */}
      {photos.length > 0 && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Image size={14} />
            <span>{photos.length} photo{photos.length !== 1 ? 's' : ''} uploaded</span>
          </div>
          {photos.length >= 3 && (
            <div className="flex items-center gap-1 text-emerald-600 font-bold">
              <Check size={14} />
              <span>Evidence requirements met</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
