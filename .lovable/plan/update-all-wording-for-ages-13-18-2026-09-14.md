# Update all wording for ages 13–18

## Goal
Reposition Dolphoon for young people aged 13–18 by removing child/kid-focused language throughout the project, without changing features, stored user data, or application behavior.

## Changes

1. **Update public-facing wording in all languages**
   - English: use “young people,” “youth,” or “students” according to context.
   - Arabic: use natural equivalents such as “الشباب” and “الطلاب,” prioritizing fluent wording rather than literal translation.
   - French: use “les jeunes” and “élèves” where appropriate.
   - Revise child-oriented phrases in home content, features, games, courses, stories, footer text, and purchase messaging.

2. **Update registration, profile, and admin labels**
   - Change visible “Child’s Name/Age” wording to “Student Name/Age” in English and equivalent labels in Arabic and French.
   - Update placeholders, validation messages, table headings, and user lookup text.
   - Keep the existing saved profile fields unchanged so current user records remain compatible.

3. **Update search and sharing metadata**
   - Replace “Kids Entertainment” and child-focused descriptions in the page title, descriptions, Open Graph, Twitter, structured data, and localized page metadata.
   - Explicitly position Dolphoon as learning and entertainment for young people aged 13–18.
   - Update `llms.txt` and the MCP content description, including the outdated 8–16 reference.

4. **Audit hardcoded and less-visible copy**
   - Update hardcoded descriptions in story, course, and game pages.
   - Update the Arabic skill-path description and any other visible copy found by the final project-wide scan.
   - Ignore framework terms such as React `children`/`asChild` and retain internal database/type names that users never see.

5. **Verify consistency**
   - Run a final multilingual search for kid/child terminology and the old 8–16 age range.
   - Check that translation files remain valid and that the project passes its TypeScript verification.

## Technical notes
- This is a copy and metadata update only; no database migration or business-logic change is needed.
- Existing translation keys and stored field names will remain stable where possible to avoid regressions; only their displayed values will change.
