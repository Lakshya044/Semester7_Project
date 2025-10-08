# UI Layout Changes Summary

## Header Button Changes

### Before
```
┌──────────────────────────────────────────────────────┐
│  [≡] Axon Docs     [🔍] [⬇️]  [🎤] [🧠] [logout]     │
│   ^                  ^    ^                           │
│   │                  │    └─ Toggle Bottom Panel      │
│   │                  └────── Toggle Related Findings  │
│   └───────────────────────── Toggle Left Sidebar     │
└──────────────────────────────────────────────────────┘
```

### After
```
┌──────────────────────────────────────────────────────┐
│  [≡] Axon Docs     [🔍] [📖]  [🎤] [🧠] [logout]     │
│   ^                  ^    ^                           │
│   │                  │    └─ Toggle Analysis Overview │
│   │                  └────── Toggle Related Findings  │
│   └───────────────────────── Toggle Left Sidebar     │
└──────────────────────────────────────────────────────┘
```

**Icon Legend:**
- [≡] = Sidebar toggle (PanelLeftOpen/Close)
- [🔍] = Search/Related Findings (Search icon)
- [⬇️] = OLD: Bottom panel toggle (PanelBottom)
- [📖] = NEW: Analysis Overview sidebar (BookOpen)

---

## Main Layout Structure

### BEFORE: Bottom Panel Layout
```
┌───────────────────────────────────────────────────────────────┐
│                        HEADER (64px)                          │
├─────────┬─────────────────────────────────┬───────────────────┤
│         │                                 │                   │
│         │         PDF Viewer              │                   │
│  Docs   │         Container               │    Related        │
│ Sidebar │          (68%)                  │   Findings        │
│ (288px) │                                 │   Sidebar         │
│         │    ┌──────────────────┐         │   (500px)         │
│  • doc1 │    │                  │         │                   │
│  • doc2 │    │   PDF CONTENT    │         │   [Search...]     │
│  • doc3 │    │                  │         │                   │
│         │    │                  │         │   • Similar       │
│ [+ Add] │    └──────────────────┘         │   • Contradicts   │
│         │                                 │   • Extends       │
│         │                                 │                   │
├─────────┴─────────────────────────────────┴───────────────────┤
│                  [==== DRAG HANDLE ====]                      │
├───────────────────────────────────────────────────────────────┤
│              Analysis Overview (32%)                          │
│   ┌──────────────────────────┬──────────────────────────┐    │
│   │  Highlighted Sections    │  Subsection Analysis     │    │
│   │  ┌────────────────────┐  │  ┌────────────────────┐  │    │
│   │  │ Rank #1 | Page 5  │  │  │ doc.pdf | Page 12  │  │    │
│   │  │ Section Title...   │  │  │ Refined text...    │  │    │
│   │  └────────────────────┘  │  └────────────────────┘  │    │
│   │  ┌────────────────────┐  │  ┌────────────────────┐  │    │
│   │  │ Rank #2 | Page 7  │  │  │ doc.pdf | Page 15  │  │    │
│   │  └────────────────────┘  │  └────────────────────┘  │    │
│   └──────────────────────────┴──────────────────────────┘    │
└───────────────────────────────────────────────────────────────┘

Issues:
❌ PDF only gets 68% of vertical space
❌ Complex drag mechanism with 180+ lines of code
❌ Inconsistent with Related Findings pattern
❌ Analysis always visible (takes space even when not needed)
```

### AFTER: Right Sidebar Layout
```
┌─────────────────────────────────────────────────────────────────┬─────────┐
│                        HEADER (64px)                            │         │
├─────────┬───────────────────────────────────────────────────────┼─────────┤
│         │                                                       │         │
│         │                                                       │Analysis │
│  Docs   │              PDF Viewer Container                    │Overview │
│ Sidebar │                   (100%)                             │ Sidebar │
│ (288px) │                                                       │ (500px) │
│         │         ┌──────────────────────────┐                 │         │
│  • doc1 │         │                          │                 │  [X]    │
│  • doc2 │         │                          │                 │         │
│  • doc3 │         │      PDF CONTENT         │                 │ Highli- │
│         │         │                          │                 │ ghted   │
│ [+ Add] │         │      FULL HEIGHT         │                 │ Section │
│         │         │                          │                 │ ┌─────┐ │
│         │         │                          │                 │ │Rank1│ │
│         │         │                          │                 │ └─────┘ │
│         │         └──────────────────────────┘                 │ ┌─────┐ │
│         │                                                       │ │Rank2│ │
│         │                                                       │ └─────┘ │
│         │                                                       │         │
│         │                                                       │ Subsec- │
│         │                                                       │ tion    │
│         │                                                       │ Analysi │
│         │                                                       │ ┌─────┐ │
│         │                                                       │ │ ... │ │
└─────────┴───────────────────────────────────────────────────────┴─────────┘

Benefits:
✅ PDF gets 100% of vertical space
✅ Simple toggle - no drag complexity
✅ Consistent with Related Findings sidebar
✅ Analysis hidden when not needed (more space)
✅ Both sidebars use same interaction pattern
```

---

## Toggle States Visualization

### State 1: All Closed
```
┌─────────────────────────────────────────────────────────┐
│  [≡] Axon Docs         [🔍] [📖]                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│                    PDF Viewer                           │
│                   FULL SCREEN                           │
│                                                         │
│              ┌─────────────────────┐                    │
│              │                     │                    │
│              │   PDF CONTENT       │                    │
│              │                     │                    │
│              └─────────────────────┘                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### State 2: Left Sidebar Only (Documents)
```
┌─────────────────────────────────────────────────────────┐
│  [≡] Axon Docs         [🔍] [📖]                        │
├────────┬────────────────────────────────────────────────┤
│        │                                                │
│ • doc1 │                                                │
│ • doc2 │            PDF Viewer                          │
│ • doc3 │                                                │
│        │       ┌─────────────────────┐                  │
│[+ Add] │       │                     │                  │
│        │       │   PDF CONTENT       │                  │
│        │       │                     │                  │
│        │       └─────────────────────┘                  │
└────────┴────────────────────────────────────────────────┘
```

### State 3: Right Sidebar Only (Analysis)
```
┌─────────────────────────────────────────────────────┬──────┐
│  [≡] Axon Docs         [🔍] [📖]                    │      │
├─────────────────────────────────────────────────────┼──────┤
│                                                     │Analy-│
│                                                     │sis   │
│              PDF Viewer                             │      │
│                                                     │Rank1 │
│         ┌─────────────────────┐                     │      │
│         │                     │                     │Rank2 │
│         │   PDF CONTENT       │                     │      │
│         │                     │                     │Sub..│
│         └─────────────────────┘                     │      │
└─────────────────────────────────────────────────────┴──────┘
```

### State 4: Both Sidebars Open
```
┌─────────────────────────────────────────────────────┬──────┐
│  [≡] Axon Docs         [🔍] [📖]                    │      │
├────┬────────────────────────────────────────────────┼──────┤
│doc1│                                                │Analy-│
│doc2│                                                │sis   │
│doc3│         PDF Viewer                             │      │
│    │                                                │Rank1 │
│[+] │    ┌─────────────────────┐                     │      │
│    │    │                     │                     │Rank2 │
│    │    │   PDF CONTENT       │                     │      │
│    │    │                     │                     │Sub..│
│    │    └─────────────────────┘                     │      │
└────┴────────────────────────────────────────────────┴──────┘
```

### State 5: With Related Findings (Max)
```
┌─────────────────────────────────────────────┬──────┬──────┐
│  [≡] Axon Docs    [🔍] [📖]                 │      │      │
├───┬─────────────────────────────────────────┼──────┼──────┤
│d1 │                                         │Relat-│Analy-│
│d2 │                                         │ed    │sis   │
│d3 │        PDF Viewer                       │      │      │
│   │                                         │Simil │Rank1 │
│[+]│    ┌──────────────────┐                 │      │      │
│   │    │                  │                 │Contr │Rank2 │
│   │    │  PDF CONTENT     │                 │      │      │
│   │    │                  │                 │Exten │Sub..│
│   │    └──────────────────┘                 │      │      │
└───┴─────────────────────────────────────────┴──────┴──────┘
```

---

## Component Hierarchy

### Before
```
PdfViewerPage
├─ Header
│  ├─ [Toggle Sidebar]
│  ├─ [Toggle Related]
│  └─ [Toggle Bottom] ← OLD
├─ Sidebar (left)
├─ PDF Viewer Container (flex column)
│  ├─ Top Info Bar
│  ├─ PDF Viewer (68% height)
│  ├─ Drag Handle ← REMOVED
│  └─ Bottom Panel (32% height) ← REMOVED
│     ├─ Highlighted Sections
│     └─ Subsection Analysis
├─ RelatedFindingsSidebar (right)
└─ Other sidebars...
```

### After
```
PdfViewerPage
├─ Header
│  ├─ [Toggle Sidebar]
│  ├─ [Toggle Related]
│  └─ [Toggle Analysis] ← NEW (BookOpen icon)
├─ Sidebar (left)
├─ PDF Viewer Container (flex column)
│  ├─ Top Info Bar
│  └─ PDF Viewer (100% height) ← FULL HEIGHT
├─ RelatedFindingsSidebar (right)
├─ AnalysisOverviewSidebar (right) ← NEW
│  ├─ Highlighted Sections
│  └─ Subsection Analysis
└─ Other sidebars...
```

---

## Code Complexity Reduction

### Lines of Code

**Before:**
- State management: ~3 lines (isBottomOpen, bottomPanelHeight, isDragging)
- Drag handlers: ~65 lines (handleMouseDown + useEffect)
- Bottom panel JSX: ~115 lines
- Global styles: ~10 lines (drag cursor styles)
- **Total: ~193 lines**

**After:**
- State management: ~1 line (isAnalysisOpen)
- New component: AnalysisOverviewSidebar.jsx (~165 lines, reusable)
- Integration: ~18 lines (component + onNavigate prop)
- **Total: ~19 lines in main file + 165 in separate component**

**Net Result:**
- Main page.jsx: **-174 lines** (cleaner)
- New reusable component: +165 lines (better organization)
- Overall: Better separation of concerns

---

## User Interaction Flow

### Opening Analysis Overview
1. User clicks **BookOpen** icon in header (top-right)
2. `setIsAnalysisOpen(true)` is called
3. AnalysisOverviewSidebar receives `isOpen={true}`
4. Backdrop overlay fades in with blur effect
5. Sidebar slides in from right (smooth transition)
6. Header icon changes to **PanelRightClose**

### Viewing Analysis Data
1. User sees two sections with color-coded headers
2. **Highlighted Sections** (blue): Cards with rank badges and page numbers
3. **Subsection Analysis** (green): Cards with document names
4. User can scroll within sidebar independently
5. Hover over any card shows chevron icon (indicating clickable)

### Navigating to Content
1. User clicks on a card in either section
2. `onNavigate(pageNum, doc)` is called
3. If different document: `setSelectedFile(doc)` + route change
4. `setSelectedPage(pageNum)` updates page
5. PDF viewer jumps to selected page/document
6. Sidebar remains open for continued browsing

### Closing Analysis Overview
**Option 1:** Click X button in sidebar header
**Option 2:** Click BookOpen/PanelRightClose in main header
**Option 3:** Click backdrop overlay

All trigger: `setIsAnalysisOpen(false)` → sidebar slides out

---

## Accessibility Improvements

### Before (Bottom Panel)
- Drag handle had no keyboard support
- Screen readers couldn't announce drag state
- No way to resize without mouse
- Complex focus management during drag

### After (Sidebar)
- Clear toggle button with aria-label
- Keyboard accessible (Tab + Enter/Space)
- Screen reader friendly (announces open/close state)
- Standard modal/dialog interaction pattern
- Better focus management (trapped in sidebar when open)
