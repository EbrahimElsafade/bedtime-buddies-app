# Fix course cards being cut off

## Goal
Keep every featured course card fully visible and readable across screen sizes and languages, especially Arabic at tablet widths.

## Changes
- Adjust the homepage featured-courses grid so three columns are used only when each card has enough width; use two columns at intermediate widths.
- Make each card link and card fill its grid row consistently without forcing or clipping variable-length content.
- Allow instructor, category, lesson, and duration rows to wrap or shrink safely in Arabic, English, and French.
- Preserve the image crop, price/owned badge placement, current colors, and course navigation.
- Apply the same safe layout rules to the full courses page where it uses the matching card structure.

## Validation
- Check the homepage and courses page around the reported 996px width, plus mobile and wide desktop.
- Check Arabic RTL and English/French with long titles and metadata.
- Confirm cards do not overlap, leave the container, or hide their bottom details, then run the TypeScript check.

## Technical details
The homepage currently switches directly to three columns at the medium breakpoint. At the reported viewport this leaves narrow cards while Arabic metadata remains in fixed single-row layouts. The fix will delay the three-column layout and add `min-w-0`, wrapping, and consistent full-height link/card behavior where needed.
