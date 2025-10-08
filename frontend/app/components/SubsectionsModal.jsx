"use client";
import { X, ChevronRight } from 'lucide-react';

export default function SubsectionsModal({ isOpen, onClose, section, sectionIndex, onNavigate }) {
	if (!isOpen || !section) return null;

	const subsections = Array.isArray(section.subsections) ? section.subsections : [];

	return (
		<>
			{/* Backdrop */}
			<div 
				className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
				onClick={onClose}
			/>
			
			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div className="pointer-events-auto w-full max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
					{/* Header */}
					<div className="flex-none p-6 border-b border-slate-200 bg-gradient-to-r from-green-50 to-emerald-50">
						<div className="flex items-start justify-between gap-4">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<span className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-bold shadow-sm">
										Rank {sectionIndex + 1}
									</span>
									<span className="text-sm font-semibold text-blue-600">
										Page {section.page_number}
									</span>
								</div>
								<h2 className="text-xl font-bold text-slate-800 mb-2">
									{section.section_name}
								</h2>
								<p className="text-sm text-slate-600 leading-relaxed">
									{section.refined_text}
								</p>
							</div>
							<button 
								onClick={onClose}
								className="flex-none p-2 rounded-lg hover:bg-slate-200/60 transition-colors"
								aria-label="Close subsections"
							>
								<X size={20} className="text-slate-600" />
							</button>
						</div>
					</div>

					{/* Content */}
					<div className="flex-1 overflow-y-auto custom-scrollbar p-6">
						<div className="mb-4">
							<h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
								<div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
								Subsections ({subsections.length})
							</h3>
						</div>

						{subsections.length > 0 ? (
							<div className="space-y-3">
								{subsections.map((sub, idx) => (
									<div 
										key={`sub-${idx}`} 
										className="group p-4 rounded-xl border border-green-200/80 bg-gradient-to-br from-green-50/70 to-white backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200"
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2 flex-1">
												<span className="text-xs font-medium text-slate-500">
													Subsection {idx + 1}
												</span>
												{sub.document && (
													<span className="text-xs text-slate-600 truncate">
														{sub.document}{String(sub.document).toLowerCase().endsWith('.pdf') ? '' : '.pdf'}
													</span>
												)}
											</div>
											{sub.page_number && (
												<div className="flex items-center gap-2">
													<span className="text-xs font-semibold text-green-600">
														Page {sub.page_number}
													</span>
													<button
														onClick={() => {
															if (onNavigate && sub.page_number) {
																onNavigate(sub.page_number, sub.document);
															}
														}}
														className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 transition-colors"
													>
														<ChevronRight size={14} />
													</button>
												</div>
											)}
										</div>
										
										<div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
											{sub.refined_text || sub.text || 'No content available'}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="text-center py-12">
								<div className="text-slate-400 mb-3">
									<svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
								</div>
								<p className="text-slate-600 font-medium">No subsections available</p>
								<p className="text-sm text-slate-500 mt-1">This section has no subsection analysis</p>
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="flex-none p-4 border-t border-slate-200 bg-slate-50">
						<div className="flex items-center justify-between">
							<p className="text-xs text-slate-500">
								{subsections.length} subsection{subsections.length !== 1 ? 's' : ''} in this section
							</p>
							<button
								onClick={onClose}
								className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-semibold transition-colors"
							>
								Close
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
