# Refresh course-focused metadata

## Goal
Position Dolphoon consistently as a multilingual learning platform offering courses and skill paths for young people aged 13–18, without describing stories or games as current offerings.

## Changes
- Update the sitewide title, description, Open Graph, Twitter, and Organization structured data in English to describe courses and skill paths only.
- Rewrite the English, Arabic, and French page metadata so home, courses, skill paths, account, profile, and purchase pages use the new course-focused business positioning.
- Remove stories and games from the AI-readable site summary and from sitemap generation so search tools no longer advertise those sections.
- Regenerate the sitemap from the existing generator while preserving course pages and authoritative course update dates.
- Keep the existing application pages and functionality unchanged; this task changes discovery metadata and search-facing wording only.

## Verification
- Search metadata files for remaining business descriptions that promote stories or games.
- Validate the edited JSON and run the TypeScript check.
- Check the generated sitemap no longer contains story or game URLs.
