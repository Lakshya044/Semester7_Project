# Data Structure Clarification

## Current Python Output Structure

The Python script (`round_1b/run.py`) generates two **separate arrays**:

```json
{
  "metadata": {...},
  "extracted_sections": [
    {
      "document": "example.pdf",
      "section_title": "Introduction to...",
      "importance_rank": 1,
      "page_number": 10
    },
    {
      "document": "example.pdf",
      "section_title": "Background Study...",
      "importance_rank": 2,
      "page_number": 15
    }
  ],
  "subsection_analysis": [
    {
      "document": "example.pdf",
      "refined_text": "This section discusses...",
      "page_number": 12
    },
    {
      "document": "example.pdf",
      "refined_text": "Additional analysis shows...",
      "page_number": 13
    }
  ]
}
```

## Frontend Implementation

### Current Approach (Temporary)
The frontend currently treats ALL `subsection_analysis` items as subsections for every highlighted section:

```jsx
// AnalysisOverviewSidebar.jsx
const highlightedSections = analysisData?.extracted_sections || [];
const subsections = analysisData?.subsection_analysis || [];

// When "View Subsections" is clicked
onViewSubsections({ ...section, subsections }, idx);
```

This means:
- ✅ Highlighted sections display correctly
- ⚠️ **Every section shows the same subsections** (all items from subsection_analysis)
- ⚠️ No clear relationship between parent section and subsections

### Ideal Nested Structure

For proper hierarchy, the Python script should output:

```json
{
  "extracted_sections": [
    {
      "document": "example.pdf",
      "section_title": "Introduction to...",
      "importance_rank": 1,
      "page_number": 10,
      "subsections": [
        {
          "document": "example.pdf",
          "refined_text": "Subsection specific to this section...",
          "page_number": 11
        },
        {
          "document": "example.pdf",
          "refined_text": "Another related subsection...",
          "page_number": 12
        }
      ]
    },
    {
      "document": "example.pdf",
      "section_title": "Background Study...",
      "importance_rank": 2,
      "page_number": 15,
      "subsections": [
        {
          "document": "example.pdf",
          "refined_text": "Background subsection 1...",
          "page_number": 16
        }
      ]
    }
  ]
}
```

## Testing Steps

1. **Test Highlighted Sections Display**
   - Upload and analyze a PDF document
   - Click the BookOpen icon to open Analysis Overview sidebar
   - ✅ Verify sections display with rank badges and page numbers
   - ✅ Verify "Go to Page" button works

2. **Test Subsections Modal (Current Behavior)**
   - Click "View Subsections" on any section
   - ⚠️ **Expected**: All subsection_analysis items will appear (not section-specific)
   - ✅ Verify modal opens/closes correctly
   - ✅ Verify subsection navigation works

3. **Decision Point**
   - If current behavior is acceptable (all subsections shown for every section), no changes needed
   - If you need section-specific subsections, the Python script must be modified to nest them

## Next Steps

### Option A: Keep Current Structure
- Accept that subsections are global, not section-specific
- Update UI/UX to reflect this (e.g., "All Subsections" instead of "View Subsections")

### Option B: Modify Python Script
- Update `run.py` to create proper parent-child relationships
- Group subsections under their parent sections
- Requires understanding the business logic of how subsections relate to sections

### Option C: Frontend Filtering
- Keep Python output as-is
- Add logic to filter `subsection_analysis` based on document/page proximity to parent section
- Less accurate but doesn't require backend changes

## Questions to Answer

1. **What defines the relationship between a section and its subsections?**
   - Same document?
   - Page range proximity?
   - Some other identifier in the analysis?

2. **Can subsections belong to multiple parent sections?**
   - Or is it a strict 1-to-many relationship?

3. **Is the current "show all subsections" behavior acceptable?**
   - Or do you need proper hierarchical filtering?
