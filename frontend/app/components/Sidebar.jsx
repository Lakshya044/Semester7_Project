"use client"
import { PlusCircle, Loader2, FileText } from 'lucide-react';
import React, { useRef } from 'react';

function Sidebar({
  isOpen,
  documents = [],
  onPdfSelect,
  selectedPdf,
  onAddFiles,
  isAdding,
}) {
  const fileInputRef = useRef(null);
  const handleAddClick = () => fileInputRef.current?.click();
  const handleFilesChange = (e) => {
    const files = e.target.files && Array.from(e.target.files);
    if (files && files.length && onAddFiles) onAddFiles(files);
    e.target.value = null;
  };

  return (
    <aside className={`transition-all duration-300 ease-in-out flex-shrink-0 h-full bg-gradient-to-b from-red-50/95 to-red-100/95 backdrop-blur-sm border-r border-red-200/60 shadow-lg overflow-hidden ${isOpen ? 'w-72' : 'w-0'}`}>
      <div className={`${!isOpen && 'hidden'} h-full flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 pb-3 border-b border-red-200/50">
          <h2 className="text-lg font-bold bg-gradient-to-r from-red-700 to-red-800 bg-clip-text text-transparent mb-1">
            My Documents
          </h2>
          <p className="text-xs text-red-600/70">
            {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>

  {/* Documents List */}
  <div className="flex-1 overflow-hidden px-3 py-3 min-h-0 flex flex-col">
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <ul className="space-y-2">
          {documents.length > 0 ? (
            documents.map((doc) => (
              <li key={doc}>
                <button
                  onClick={() => onPdfSelect?.(doc)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all duration-200 group ${
                    selectedPdf === doc
                      ? 'bg-red-100 border-red-300 shadow-md ring-2 ring-red-200'
                      : 'bg-white/70 border-red-200/50 hover:bg-red-50 hover:border-red-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={`p-1.5 rounded-md flex-shrink-0 ${
                      selectedPdf === doc ? 'bg-red-200' : 'bg-red-100 group-hover:bg-red-200'
                    } transition-colors duration-200`}>
                      <FileText size={16} className="text-red-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm leading-relaxed break-words ${
                        selectedPdf === doc ? 'text-red-900' : 'text-red-800'
                      }`}>
                        {doc.replace('.pdf', '')}
                      </p>
                      <p className="text-xs text-red-600/60 mt-0.5">PDF Document</p>
                    </div>
                  </div>
                </button>
              </li>
            ))
          ) : (
            <li className="text-center py-8">
              <div className="bg-white/60 backdrop-blur-sm border border-red-200/50 rounded-lg p-6">
                <FileText size={32} className="text-red-400 mx-auto mb-3" />
                <p className="text-red-700 text-sm font-medium mb-1">No documents yet</p>
                <p className="text-red-500/60 text-xs">Upload PDFs using the button below</p>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>

        {/* Add Files Button */}
        <div className="flex-shrink-0 p-4 pt-3 border-t border-red-200/50 bg-white/20">
          <button
            onClick={handleAddClick}
            disabled={isAdding}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm text-sm ${
              isAdding 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 hover:shadow-lg active:scale-[0.98]'
            } text-white`}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <PlusCircle size={18} />
                <span>Add More Files</span>
              </>
            )}
          </button>
          <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFilesChange} />
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(239, 68, 68, 0.3) rgba(239, 68, 68, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(239, 68, 68, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.5);
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;
