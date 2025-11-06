# 3-Column Grid Block - Implementation Handoff

## Status
**DELETED** - This block has been removed from the codebase due to implementation issues.

## User Requirements

The user wants a **3-column masonry grid block** for their photo gallery with the following specific features:

### Core Requirements

1. **3-column layout on desktop, 1-column on mobile**
   - Desktop (≥768px): 3 columns
   - Mobile (<768px): 1 column
   - Use MUI Masonry component (@mui/lab/Masonry)

2. **Support for two types of content:**
   - **Photos** with individual metadata (film type, borders, captions, etc.)
   - **Small text cards** with typography and background controls

3. **Bulk photo upload capability**
   - User must be able to upload multiple photos at once
   - All photos in a bulk upload share the same metadata (film settings, borders, etc.)
   - This is a critical feature - DO NOT BREAK IT

4. **Text card positioning**
   - When a text card is the first item in the grid
   - It should appear in the **center column, first row** (position index 1)
   - Text should be centered within the card
   - Card should NOT overflow its container

### What the User Actually Showed Me

From the screenshot of the working 2-column grid:
- Text cards work perfectly INSIDE the masonry grid
- They are just another masonry item, not pulled out separately
- The 2-column grid (MasonrySection.tsx) demonstrates the correct approach

## Reference: Working 2-Column Grid

**File:** `src/components/gallery/MasonrySection.tsx`

This component demonstrates the CORRECT way to handle text cards in a masonry grid:
- Text cards stay INSIDE the Masonry component
- They are rendered as regular masonry items
- The `isFirstInMasonry` prop is set when index === 0
- No special wrapper divs or removal from grid

```tsx
<Masonry columns={{ xs: 1, sm: 1, md: 2 }} spacing={{ xs: 1.5, sm: 1.5, md: 1.5 }}>
  {items.map((item, index) => {
    // Text cards rendered inside masonry, not pulled out
    if (item.blockType === 'textCardSmall' && index === 0) {
      return <TextCardSmall isFirstInMasonry={true} />
    }
    // ... other items
  })}
</Masonry>
```

## What Went Wrong (What NOT to Do)

### Failed Approach 1: CSS Hacks
- Tried using `grid-column: 2 / 3` - FAILED (Masonry uses flexbox, not CSS Grid)
- Tried using `flex-basis: 100%` - FAILED (doesn't work with column-based layout)
- Tried using `flex: 0 0 100%` with !important flags - FAILED

### Failed Approach 2: Pulling Text Card Out of Grid
- Removed first text card from Masonry array
- Rendered it in a separate wrapper div above the grid
- FAILED - This breaks the masonry layout and isn't what the user wants

### Failed Approach 3: Sequential Mode with Placeholder
- Used MUI Masonry's `sequential` prop
- Inserted hidden placeholder div to push text card to position 1
- FAILED - Created massive overflow issues and broke the layout

## MUI Masonry Limitations

From official MUI documentation research:
- **Default mode**: Items go to shortest column (height-based balancing)
- **Sequential mode**: Items go left-to-right in order
- **NO PROP** exists for manual column assignment
- You CANNOT force a specific item into a specific column
- Masonry is designed for automatic layout, not manual positioning

## Suggested Approaches for Next LLM

### Option 1: Use CSS Grid Instead (Recommended)
- Replace MUI Masonry with CSS Grid
- Use `grid-column` and `grid-row` for precise positioning
- Text card can span specific columns: `grid-column: 2 / 3;`
- Cons: Loses automatic height-based balancing

### Option 2: Accept Masonry's Default Behavior
- Let the text card appear wherever Masonry places it
- Focus on making it look good regardless of position
- Use `sequential` mode if left-to-right ordering is acceptable
- Pros: Works with library as designed

### Option 3: Custom Masonry Implementation
- Build a custom masonry-style layout from scratch
- Use JavaScript to calculate column positions
- Full control over item placement
- Cons: Significant development effort, reinventing the wheel

### Option 4: Restructure Data to Work with Sequential Mode
- In sequential mode, items go: column1, column2, column3, column1, column2...
- To get text card in center column first row: insert 1 placeholder before it
- Placeholder should be an ACTUAL masonry item, not hidden
- Could be a small decorative element or empty card
- Pros: Works with MUI Masonry, no CSS hacks
- Cons: Requires careful data structuring

## Data Structure

The block should support two methods of adding photos:

### Method 1: Individual Items (items array)
Each item is a separate block with full control:

```typescript
items: [
  {
    blockType: 'gridTextCard',
    content: { /* rich text */ },
    fontFamily: 'inter',
    fontSize: 'medium',
    textAlign: 'center',
    backgroundType: 'solid',
    backgroundColor: 'light'
  },
  {
    blockType: 'gridPhoto',
    image: { /* media ref */ },
    caption: 'Photo caption',
    isFilmPhoto: true,
    filmType: '35mm',
    filmStock: 'Portra 400',
    applyFilmBorder: true,
    filmBorderNumber: '3'
  },
  // ... more items
]
```

### Method 2: Bulk Upload (images array)
All photos share the same metadata:

```typescript
images: [
  { /* media ref 1 */ },
  { /* media ref 2 */ },
  { /* media ref 3 */ }
],
isFilmPhoto: true,
filmType: '35mm',
filmStock: 'Portra 400',
applyFilmBorder: true,
filmBorderNumber: '3'
```

## Required Fields in Gallery.ts

The Payload CMS block needs:

1. **Block slug**: `photoBulk3Across`
2. **Block labels**: "3-Column Grid"
3. **Fields:**
   - `items` (blocks type, minRows: 0)
     - `gridPhoto` nested block
     - `gridTextCard` nested block
   - `images` (upload type, hasMany: true) - for bulk upload
   - Film metadata fields (shared by bulk upload):
     - `isFilmPhoto`, `filmType`, `filmStock`, `blackAndWhite`
     - `applyFilmBorder`, `filmBorderNumber`

## Component Structure

### File: src/components/gallery/BulkPhotos3Across.tsx

Basic structure needed:

```tsx
export default function BulkPhotos3Across({ block }) {
  // Combine items and legacy bulk upload arrays
  let gridItems = []
  if (block.items) gridItems = [...block.items]
  if (block.images) {
    // Map bulk images to individual photo items
    const bulkPhotos = block.images.map((image, idx) => ({
      blockType: 'gridPhoto',
      image,
      // Apply shared metadata
      isFilmPhoto: block.isFilmPhoto,
      filmType: block.filmType,
      // ... etc
    }))
    gridItems = [...gridItems, ...bulkPhotos]
  }

  return (
    <div className="bulk-photos-3-across">
      <Masonry
        columns={{ xs: 1, sm: 1, md: 3 }}
        spacing={{ xs: 1.5, sm: 1.5, md: 1.5 }}
        // sequential={true} // Optional, depending on approach
      >
        {gridItems.map((item, index) => {
          if (item.blockType === 'gridPhoto') {
            return <PhotoCard block={item} />
          }
          if (item.blockType === 'gridTextCard') {
            return <TextCardSmall
              block={item}
              isFirstInMasonry={index === 0}
            />
          }
        })}
      </Masonry>
    </div>
  )
}
```

## Block Registry Entry

### File: src/lib/blocks/blockRegistry.ts

```typescript
photoBulk3Across: {
  slug: 'photoBulk3Across',
  component: BulkPhotos3Across,
  layout: 'section-break',  // Full width section
  priority: false,
}
```

## CSS Considerations

Key CSS rules needed:

```css
/* Text card overflow prevention */
.text-card-small {
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.text-card-small-content {
  width: 100%;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Center text when first in masonry */
.text-card-small.first-in-masonry {
  /* Only if using Option 1 (CSS Grid) approach */
  /* For MUI Masonry, text alignment should be set via textAlign prop */
}
```

## Key Lessons Learned

1. **MUI Masonry is opinionated** - It's designed for automatic layout, not manual positioning
2. **Don't fight the library** - Work with its design, not against it
3. **CSS Grid ≠ Flexbox** - Masonry uses flexbox columns, not CSS Grid
4. **Text cards should stay IN the grid** - Don't pull them out into separate containers
5. **Bulk upload is critical** - Any solution must preserve this functionality

## Testing Checklist

When implementing, verify:
- [ ] Text cards render inside masonry grid (not pulled out)
- [ ] Text cards don't overflow their containers
- [ ] Bulk photo upload works (images field)
- [ ] Individual photo control works (items field)
- [ ] 3 columns on desktop (≥768px)
- [ ] 1 column on mobile (<768px)
- [ ] Film borders apply correctly
- [ ] Photo modal/lightbox works
- [ ] Responsive spacing and padding
- [ ] All typography controls work on text cards
- [ ] Background options work on text cards

## Questions to Clarify with User

Before implementing, ask:
1. Is it acceptable for the text card to appear wherever Masonry naturally places it?
2. If precise positioning is required, would CSS Grid (losing automatic height balancing) be acceptable?
3. Is left-to-right sequential ordering acceptable instead of height-based balancing?
4. Would adding a decorative element (instead of hidden placeholder) in position 0 be acceptable?

## Related Files

- `src/components/gallery/MasonrySection.tsx` - 2-column grid (working reference)
- `src/components/gallery/TextCardSmall.tsx` - Text card component
- `src/components/gallery/PhotoCard.tsx` - Photo component
- `src/collections/Gallery.ts` - Payload CMS collection config
- `src/lib/blocks/blockRegistry.ts` - Block registration
- `src/app/(frontend)/styles.css` - Global styles

## Contact Previous LLM

If you need clarification on what was attempted, the conversation history should contain detailed information about:
- All CSS approaches tried
- Research into MUI Masonry documentation
- The sequential mode + placeholder attempt
- Why each approach failed

Good luck! The user is frustrated, so please take time to understand the requirements before coding.
