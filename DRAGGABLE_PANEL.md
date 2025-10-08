# Draggable Bottom Panel Implementation

## Overview
Implemented a user-adjustable draggable resize feature for the bottom analysis panel in the PDF viewer. This addresses the issue where content was not visible due to the fixed small height (32%), and allows users to customize the workspace layout according to their needs.

## Changes Made

### 1. State Management (Lines ~26-28)
Added two new state variables to track panel height and dragging status:
```javascript
const [bottomPanelHeight, setBottomPanelHeight] = useState(35); // percentage (20-70%)
const [isDragging, setIsDragging] = useState(false);
```

### 2. Drag Handler Functions (After `runRelatedSearch` function)
Implemented mouse event handlers for drag functionality:

**handleMouseDown**: Initiates dragging when user clicks on the drag handle
```javascript
const handleMouseDown = (e) => {
  setIsDragging(true);
  e.preventDefault();
};
```

**useEffect Hook**: Manages mouse movement and calculates new panel height
```javascript
useEffect(() => {
  if (!isDragging) return;
  
  const handleMouseMove = (e) => {
    const container = document.querySelector('.pdf-viewer-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const containerHeight = containerRect.height;
    const mouseY = e.clientY - containerRect.top;
    const percentFromTop = (mouseY / containerHeight) * 100;
    const percentFromBottom = 100 - percentFromTop;
    const newHeight = Math.max(20, Math.min(70, percentFromBottom));
    
    setBottomPanelHeight(newHeight);
  };
  
  const handleMouseUp = () => setIsDragging(false);
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  
  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
}, [isDragging]);
```

### 3. Container Structure (Line ~242)
Added `pdf-viewer-container` class to the main content wrapper for querySelector targeting:
```jsx
<div className="relative flex-grow h-full min-h-0 p-4 flex flex-col pdf-viewer-container">
```

### 4. PDF Viewer Dynamic Height (Line ~286)
Changed from fixed 68% to calculated height based on bottom panel state:
```jsx
<div className="border border-red-700 bg-white flex-none" 
     style={{ height: isBottomOpen ? `${100 - bottomPanelHeight}%` : 'calc(100% - 3.5rem)' }}>
```

### 5. Bottom Panel with Drag Handle (Lines ~299-310)
Replaced fixed `h-[32%]` with dynamic inline style and added drag handle UI:
```jsx
{isBottomOpen && (
  <div className="flex-none mt-3" style={{ height: `${bottomPanelHeight}%` }}>
    {/* Drag Handle */}
    <div 
      onMouseDown={handleMouseDown}
      className={`w-full h-2 mb-2 flex items-center justify-center cursor-ns-resize group hover:bg-slate-200/60 rounded-t-lg transition-colors ${isDragging ? 'bg-slate-300' : 'bg-slate-100'}`}
    >
      <div className="w-12 h-1 bg-slate-400 rounded-full group-hover:bg-slate-500 transition-colors" />
    </div>
    
    <div className="h-[calc(100%-0.75rem)] flex flex-col ...">
      {/* Panel content */}
    </div>
  </div>
)}
```

### 6. Show Analysis Button (Separated from ternary)
Converted ternary to conditional rendering for clarity:
```jsx
{!isBottomOpen && (
  <div className="absolute left-4 right-4 bottom-4 h-10 flex items-center justify-center ..."
       onClick={() => setIsBottomOpen(true)}
       aria-label="Show analysis panel">
    <span className="text-sm font-semibold">Show Analysis Overview</span>
  </div>
)}
```

## Features

### Drag Handle
- **Visual Design**: Horizontal gray bar with rounded indicator
- **Hover Effect**: Changes color on hover (slate-100 → slate-200)
- **Active State**: Shows darker color when dragging (slate-300)
- **Cursor**: Shows `cursor-ns-resize` (north-south arrows) to indicate vertical resize
- **Smooth Transition**: Color changes have transition effects

### Height Constraints
- **Minimum Height**: 20% of container (prevents panel from being too small)
- **Maximum Height**: 70% of container (prevents panel from taking entire viewport)
- **Initial Height**: 35% (balanced default)

### Calculation Logic
1. Gets mouse Y position relative to container
2. Converts to percentage from top
3. Inverts to get percentage from bottom (panel grows upward)
4. Clamps between 20-70% using `Math.max(20, Math.min(70, value))`
5. Updates state, triggering re-render with new height

### User Experience
- Click and drag the horizontal bar at the top of the bottom panel
- Panel smoothly resizes as you drag up or down
- Release mouse to lock in the new height
- Height persists until manually adjusted again or page refresh

## Technical Details

### Event Listeners
- **Attach**: When `isDragging` becomes `true`
- **Detach**: When `isDragging` becomes `false` (cleanup function)
- **Scope**: Document-level listeners (works even if cursor leaves drag handle)

### Performance
- Uses `preventDefault()` to avoid text selection during drag
- Cleanup function removes listeners to prevent memory leaks
- Only re-runs effect when `isDragging` changes

### Browser Compatibility
- Uses standard mouse events (compatible with all modern browsers)
- CSS `cursor-ns-resize` is widely supported
- Flexbox and calc() have excellent browser support

## Fixed Issues
1. ✅ **Content Visibility**: Bottom panel now has adjustable height, allowing users to see all content in highlighted sections and subsection analysis
2. ✅ **Fixed Small Size**: No longer limited to 32%, users can expand to 70%
3. ✅ **Workspace Flexibility**: Users can customize layout based on their current task
4. ✅ **Better UX**: Visual drag handle makes the resize feature discoverable and intuitive

## Files Modified
- `frontend/app/pdfviewer/page.jsx` - Added drag state, handlers, updated heights, added drag handle UI

## Testing Checklist
- [ ] Drag handle is visible and styled correctly
- [ ] Cursor changes to ns-resize on hover
- [ ] Panel smoothly resizes when dragging
- [ ] Height stays between 20-70%
- [ ] PDF viewer height adjusts inversely to panel height
- [ ] Content in highlighted sections is now visible
- [ ] Content in subsection analysis is now visible
- [ ] Scrolling works in both columns when content overflows
- [ ] Closing panel shows "Show Analysis Overview" button
- [ ] Opening panel restores previous height
- [ ] No memory leaks (listeners are cleaned up)
