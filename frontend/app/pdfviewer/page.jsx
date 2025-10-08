"use client";
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import Header from "../components/Header.jsx";
import Sidebar from "../components/Sidebar.jsx";
import RelatedFindingsSidebar from "../components/RelatedFindingsSidebar.jsx";
import AnalysisOverviewSidebar from "../components/AnalysisOverviewSidebar.jsx";
import SubsectionsModal from "../components/SubsectionsModal.jsx";
import { uploadDocumentCollection, getLatestOutput } from '../lib/api';
import { getRelated } from '../lib/api';
import PdfJsExpressViewer from '../components/PDFViewer';
import PodcastSidebar from "../components/PodcastSidebar";
import InsightsSidebar from "../components/InsightsSidebar";
import { Loader2, X, ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react';
import { getHistory } from '../lib/api';

export default function PdfViewerPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const file = searchParams.get('file');
	const pageParam = Number(searchParams.get('page')) || 1;
			const [analysisData, setAnalysisData] = useState(null);
			const [documents, setDocuments] = useState([]);
			const [isAdding, setIsAdding] = useState(false);
		const [isSidebarOpen, setIsSidebarOpen] = useState(true);
		const [isPodcastSidebarOpen, setIsPodcastSidebarOpen] = useState(false);
		const [isInsightsSidebarOpen, setIsInsightsSidebarOpen] = useState(false);
		const [selectedFile, setSelectedFile] = useState(file);
	const [selectedPage, setSelectedPage] = useState(pageParam);
	const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
	const [isRelatedOpen, setIsRelatedOpen] = useState(false);
	const [selectedSection, setSelectedSection] = useState(null);
	const [selectedSectionIndex, setSelectedSectionIndex] = useState(0);
	const [isSubsectionsModalOpen, setIsSubsectionsModalOpen] = useState(false);
	const [related, setRelated] = useState(null);
	const [lastSelectedText, setLastSelectedText] = useState('');
	const [showCopy, setShowCopy] = useState(false);
	const [queryText, setQueryText] = useState('');
	const [relatedLoading, setRelatedLoading] = useState(false);

	// Listen for related results from PDF selection
	useEffect(() => {
		function onRelated(e) {
			setRelated(e.detail);
		}
		window.addEventListener('axon:relatedResults', onRelated);
		function onSelected(e) {
			const text = (e && e.detail && e.detail.text) || '';
			setLastSelectedText(text);
			setShowCopy(!!text);
			if (text) setQueryText(text);
		}
		window.addEventListener('axon:selectedText', onSelected);
		return () => window.removeEventListener('axon:relatedResults', onRelated);
	}, []);

	const runRelatedSearch = async () => {
		const text = String(queryText || '').trim();
		if (!text || text.length < 3) return;
		setRelatedLoading(true);
		try {
			const resp = await getRelated(text, 20);
			setRelated(resp || { results: [] });
		} catch (e) {
			console.warn('Related search failed:', e);
			setRelated({ results: [] });
		} finally {
			setRelatedLoading(false);
		}
	};

	const handleCopySelected = async () => {
		const text = String(lastSelectedText || '').trim();
		if (!text) return;
		try {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(text);
			} else {
				// Fallback to hidden textarea
				const ta = document.createElement('textarea');
				ta.value = text;
				ta.style.position = 'fixed';
				ta.style.left = '-9999px';
				document.body.appendChild(ta);
				ta.focus();
				ta.select();
				document.execCommand('copy');
				document.body.removeChild(ta);
			}
		} catch (e) {
			console.warn('Top-level copy failed:', e);
		} finally {
			setShowCopy(false);
		}
	};

	const groupedRelated = useMemo(() => {
		const out = { similar: [], contradictory: [], extends: [], problems: [] };
		if (!related || !Array.isArray(related.results)) return out;
		for (const r of related.results) {
			const key = r.relation || 'similar';
			(out[key] || out.similar).push(r);
		}
		return out;
	}, [related]);

	useEffect(() => {
		// Try to get analysisData from sessionStorage
		const storedData = sessionStorage.getItem('analysisData');
					if (storedData) {
						const data = JSON.parse(storedData);
						const docs = (data && data.metadata && data.metadata.input_documents) || data.documents || [];
						setAnalysisData(data);
						setDocuments(docs);
						sessionStorage.removeItem('analysisData');
						return;
					}

		// Fallback: fetch latest output from backend
		getLatestOutput()
			.then((data) => {
				if (!data) return;
				const docs = (data && data.metadata && data.metadata.input_documents) || [];
				setAnalysisData(data);
				setDocuments(docs);
			})
			.catch(() => {});
	}, []);

	if (!file) return <div className="text-red-500">No PDF specified.</div>;
		const docUrl = `/pdfs/${encodeURIComponent(file)}`;

		// Normalize helper: decode, lowercase, trim, strip optional .pdf suffix
		const normalizeName = (name) => {
			if (!name) return "";
			const decoded = decodeURIComponent(String(name)).trim().toLowerCase();
			return decoded.endsWith('.pdf') ? decoded.slice(0, -4) : decoded;
		};

		// Handler to switch PDFs by updating the query param
			const handlePdfSelect = (pdfName) => {
				if (pdfName && pdfName !== selectedFile) {
					setSelectedFile(pdfName);
					router.replace(`/pdfviewer?file=${encodeURIComponent(pdfName)}`);
				}
			};
				const handleAddFiles = async (files) => {
					if (!analysisData) return;
					setIsAdding(true);
					try {
						// process new files through backend
						const newData = await uploadDocumentCollection(
							files,
							analysisData.collectionName,
							analysisData.personaRole,
							analysisData.jobTask
						);
						setAnalysisData(newData);
						setDocuments(newData.documents || []);
						// if first file of newData differs, navigate to it
						if (newData.documents && newData.documents.length) {
							const latest = newData.documents[newData.documents.length - 1];
							router.replace(`/pdfviewer?file=${encodeURIComponent(latest)}`);
						}
					} catch (err) {
						console.error('Error adding files:', err);
					} finally {
						setIsAdding(false);
					}
				};

	return (
		<div className="flex flex-col h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-100">
			<Header 
				isSidebarOpen={isSidebarOpen} 
				toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
				onTogglePodcast={() => {
					setIsPodcastSidebarOpen((prev) => {
						const next = !prev;
						if (next) setIsInsightsSidebarOpen(false);
						return next;
					});
				}}
				onToggleInsights={() => {
					setIsInsightsSidebarOpen((prev) => {
						const next = !prev;
						if (next) setIsPodcastSidebarOpen(false);
						return next;
					});
				}}
				onToggleAnalysis={() => setIsAnalysisOpen((v) => !v)}
				isAnalysisOpen={isAnalysisOpen}
				onToggleRelated={() => setIsRelatedOpen((v) => !v)}
				isRelatedOpen={isRelatedOpen}
			/>
			<main className="flex flex-grow overflow-hidden relative">
								<Sidebar
									isOpen={isSidebarOpen}
									documents={documents.length > 0 ? documents : [file]}
									onPdfSelect={handlePdfSelect}
									selectedPdf={selectedFile}
									onAddFiles={handleAddFiles}
									isAdding={isAdding}
								/>
				<div className={`relative flex-grow h-full min-h-0 p-4 flex flex-col pdf-viewer-container transition-all duration-300 ${isAnalysisOpen ? 'mr-[420px]' : 'mr-0'}`}>
					<div className="border-2 border-purple-500/30 bg-gradient-to-br from-slate-50 to-indigo-50/30 h-full rounded-2xl shadow-2xl overflow-hidden">
						<PdfJsExpressViewer docUrl={docUrl} pageNumber={selectedPage} />
						{showCopy && (
							<div className="absolute top-6 right-6 z-20 flex items-center gap-2 bg-red-700 text-white px-3 py-1.5 rounded shadow">
								<span className="text-xs max-w-[40vw] truncate" title={lastSelectedText}>Copy selected</span>
								<button onClick={handleCopySelected} className="text-xs font-semibold underline">Copy</button>
								<button onClick={() => setShowCopy(false)} className="text-xs">Ã—</button>
							</div>
						)}
					</div>
				</div>
				
				<RelatedFindingsSidebar
					isOpen={isRelatedOpen}
					onClose={() => setIsRelatedOpen(false)}
					queryText={queryText}
					setQueryText={setQueryText}
					related={related}
					groupedRelated={groupedRelated}
					relatedLoading={relatedLoading}
					onSearch={runRelatedSearch}
					onClickRelated={(r) => {
						const targetPage = Number(r.page_number) || 1;
						setSelectedPage(targetPage);
						if (r.document && r.document !== selectedFile) {
							setSelectedFile(r.document);
							router.replace(`/pdfviewer?file=${encodeURIComponent(r.document)}&page=${targetPage}`);
						}
					}}
				/>
				
				<AnalysisOverviewSidebar
					isOpen={isAnalysisOpen}
					onClose={() => setIsAnalysisOpen(false)}
					analysisData={analysisData}
					selectedFile={selectedFile}
					onNavigate={(pageNum) => {
						const targetPage = Number(pageNum) || 1;
						setSelectedPage(targetPage);
						router.replace(`/pdfviewer?file=${encodeURIComponent(selectedFile)}&page=${targetPage}`);
					}}
					onViewSubsections={(section, index) => {
						setSelectedSection(section);
						setSelectedSectionIndex(index);
						setIsSubsectionsModalOpen(true);
					}}
				/>

				<SubsectionsModal
					isOpen={isSubsectionsModalOpen}
					onClose={() => setIsSubsectionsModalOpen(false)}
					section={selectedSection}
					sectionIndex={selectedSectionIndex}
					onNavigate={(pageNum, doc) => {
						const targetPage = Number(pageNum) || 1;
						setSelectedPage(targetPage);
						if (doc && doc !== selectedFile) {
							setSelectedFile(doc);
							router.replace(`/pdfviewer?file=${encodeURIComponent(doc)}&page=${targetPage}`);
						} else {
							router.replace(`/pdfviewer?file=${encodeURIComponent(selectedFile)}&page=${targetPage}`);
						}
						setIsSubsectionsModalOpen(false);
					}}
				/>
				
				<PodcastSidebar 
					isOpen={isPodcastSidebarOpen} 
					onClose={() => setIsPodcastSidebarOpen(false)} 
				/>
				<InsightsSidebar 
					isOpen={isInsightsSidebarOpen} 
					onClose={() => setIsInsightsSidebarOpen(false)} 
				/>
			</main>
			
			<style jsx global>{`
				.custom-scrollbar {
					scrollbar-width: thin;
					scrollbar-color: rgba(100, 116, 139, 0.3) rgba(100, 116, 139, 0.1);
				}
				.custom-scrollbar::-webkit-scrollbar {
					width: 5px;
					height: 5px;
				}
				.custom-scrollbar::-webkit-scrollbar-track {
					background: rgba(100, 116, 139, 0.1);
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb {
					background: rgba(100, 116, 139, 0.3);
					border-radius: 3px;
				}
				.custom-scrollbar::-webkit-scrollbar-thumb:hover {
					background: rgba(100, 116, 139, 0.5);
				}
			`}</style>
		</div>
	);
}
