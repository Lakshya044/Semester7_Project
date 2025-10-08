"use client"
import { Search as SearchIcon, X, TrendingUp, AlertTriangle, Lightbulb, HelpCircle } from 'lucide-react';
import React from 'react';

function RelatedFindingsSidebar({
  isOpen,
  onClose,
  queryText,
  setQueryText,
  related,
  groupedRelated,
  relatedLoading,
  onSearch,
  onClickRelated,
}) {
  
  // Icon and color mapping for relation types
  const relationConfig = {
    similar: {
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50/80',
      border: 'border-blue-200/70',
      label: 'Similar Content'
    },
    contradictory: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50/80',
      border: 'border-amber-200/70',
      label: 'Contradictory'
    },
    extends: {
      icon: Lightbulb,
      color: 'text-green-600',
      bg: 'bg-green-50/80',
      border: 'border-green-200/70',
      label: 'Extends/Improves'
    },
    problems: {
      icon: HelpCircle,
      color: 'text-orange-600',
      bg: 'bg-orange-50/80',
      border: 'border-orange-200/70',
      label: 'Problems/Limitations'
    }
  };

  return (
    <aside className={`transition-all duration-300 ease-in-out flex-shrink-0 h-full bg-gradient-to-b from-slate-50/95 to-slate-100/95 backdrop-blur-sm border-l border-slate-200/60 shadow-lg overflow-hidden ${isOpen ? 'w-80' : 'w-0'}`}>
      <div className={`${!isOpen && 'hidden'} h-full flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200/60 bg-white/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Related Findings
            </h2>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
              aria-label="Close related findings"
            >
              <X size={18} className="text-slate-600" />
            </button>
          </div>
          <p className="text-xs text-slate-600">
            Search for related content across all documents
          </p>
        </div>

        {/* Search Input */}
        <div className="flex-shrink-0 p-4 border-b border-slate-200/50">
          <textarea
            value={queryText || ''}
            onChange={(e) => setQueryText?.(e.target.value)}
            rows={4}
            placeholder="Paste text or enter a search query to find related content..."
            className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white shadow-sm resize-none"
          />
          <button
            onClick={onSearch}
            disabled={relatedLoading || !String(queryText || '').trim()}
            className={`mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              relatedLoading || !String(queryText || '').trim()
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-slate-700 to-slate-900 text-white hover:from-slate-800 hover:to-slate-950 shadow-md hover:shadow-lg'
            }`}
          >
            <SearchIcon size={16} />
            {relatedLoading ? 'Searching...' : 'Search Related Content'}
          </button>
          {!!related && Array.isArray(related.results) && (
            <div className="mt-2 text-xs text-slate-600 font-medium">
              Found {related.results.length} related {related.results.length === 1 ? 'result' : 'results'}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {groupedRelated && (
            <>
              {['similar', 'contradictory', 'extends', 'problems']
                .filter((k) => (groupedRelated[k] || []).length > 0)
                .map((relationType) => {
                  const config = relationConfig[relationType];
                  const Icon = config.icon;
                  const results = groupedRelated[relationType] || [];
                  
                  return (
                    <div key={relationType} className="space-y-2">
                      {/* Category Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Icon size={16} className={config.color} />
                        <h3 className={`text-sm font-bold ${config.color}`}>
                          {config.label}
                        </h3>
                        <span className="ml-auto text-xs text-slate-500 font-medium">
                          {results.length}
                        </span>
                      </div>
                      
                      {/* Results */}
                      <ul className="space-y-2">
                        {results.map((r, idx) => (
                          <li key={relationType + idx}>
                            <button
                              className={`w-full text-left p-3 rounded-lg border ${config.border} ${config.bg} backdrop-blur-sm hover:shadow-md transition-all duration-200 cursor-pointer group`}
                              onClick={() => onClickRelated?.(r)}
                            >
                              {/* Document info */}
                              <div className="flex items-center justify-between mb-1.5">
                                <div className="text-xs text-slate-600 font-medium truncate">
                                  {r.document}
                                  {String(r.document).toLowerCase().endsWith('.pdf') ? '' : '.pdf'}
                                </div>
                                <div className={`text-xs ${config.color} font-semibold`}>
                                  Page {r.page_number}
                                </div>
                              </div>
                              
                              {/* Snippet */}
                              <div className="text-xs text-slate-700 line-clamp-3 whitespace-pre-wrap break-words leading-relaxed">
                                {r.snippet}
                              </div>
                              
                              {/* Score indicator if available */}
                              {r.score !== undefined && (
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${config.color.replace('text-', 'bg-')} transition-all duration-300`}
                                      style={{ width: `${Math.min(100, Math.max(0, r.score * 100))}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {(r.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              
              {/* Empty state */}
              {['similar', 'contradictory', 'extends', 'problems'].every((k) => (groupedRelated[k] || []).length === 0) && (
                <div className="text-center py-12 px-4">
                  <SearchIcon size={48} className="text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-600 font-medium mb-2">No related content found</p>
                  <p className="text-xs text-slate-500">
                    Try searching with different keywords or paste text from the document above
                  </p>
                </div>
              )}
            </>
          )}
          
          {/* Initial empty state */}
          {!related && (
            <div className="text-center py-12 px-4">
              <SearchIcon size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-600 font-medium mb-2">Start a search</p>
              <p className="text-xs text-slate-500">
                Enter text above and click search to find related content across all your documents
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 116, 139, 0.3) rgba(100, 116, 139, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(100, 116, 139, 0.1);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.3);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.5);
        }
      `}</style>
    </aside>
  );
}

export default RelatedFindingsSidebar;
