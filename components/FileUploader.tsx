import React, { useCallback, useState, useEffect } from 'react';
import { UploadCloud, FileInput } from 'lucide-react';

interface FileUploaderProps {
  onImageUpload: (file: File) => void;
  onLoadDraft: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onImageUpload, onLoadDraft }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draftExists, setDraftExists] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('ai-photo-editor-draft')) {
      setDraftExists(true);
    }
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-lg text-center">
      <label
        htmlFor="file-upload"
        className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-300
        ${isDragging ? 'border-indigo-500 bg-indigo-900/20' : 'border-gray-600 hover:border-gray-500 bg-gray-800/50'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <UploadCloud className={`w-10 h-10 mb-3 transition-colors ${isDragging ? 'text-indigo-400' : 'text-gray-400'}`} />
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PNG, JPG, or WEBP</p>
        </div>
        <input id="file-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
      </label>

      {draftExists && (
        <>
            <div className="my-4 text-xs text-gray-500">OR</div>
            <button
              onClick={onLoadDraft}
              className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <FileInput size={18} />
              Load Last Draft
            </button>
        </>
      )}
    </div>
  );
};