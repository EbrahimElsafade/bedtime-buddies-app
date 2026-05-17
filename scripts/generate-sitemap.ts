// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

const BASE_URL = "https://thedolphoon.com"

const SUPABASE_URL = "https://brxbtgzaumryxflkykpp.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGJ0Z3phdW1yeXhmbGt5a3BwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MzQ1NjMsImV4cCI6MjA2MzUxMDU2M30.8Y7wwEkyBmOy_wvzZUIYIzd2PE1MOrT8a25I2k9r1Cc"

interface SitemapEntry {
  path: string
  lastmod?: string
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"
  priority?: string
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/stories", changefreq: "weekly", priority: "0.9" },
  { path: "/courses", changefreq: "weekly", priority: "0.9" },
  { path: "/skill-paths", changefreq: "weekly", priority: "0.9" },
  { path: "/games", changefreq: "weekly", priority: "0.8" },
  { path: "/subscription", changefreq: "monthly", priority: "0.7" },
  { path: "/login", changefreq: "yearly", priority: "0.3" },
  { path: "/register", changefreq: "yearly", priority: "0.3" },
]

async function fetchDynamicEntries(): Promise<SitemapEntry[]> {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  const entries: SitemapEntry[] = []

  try {
    const { data: stories } = await supabase
      .from("stories")
      .select("id, updated_at")
      .eq("is_published", true)
    stories?.forEach(s =>
      entries.push({
        path: `/stories/${s.id}`,
        lastmod: s.updated_at?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.7",
      }),
    )

    const { data: courses } = await supabase
      .from("courses")
      .select("id, updated_at")
      .eq("is_published", true)
    courses?.forEach(c => {
      entries.push({
        path: `/courses/${c.id}`,
        lastmod: c.updated_at?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.7",
      })
      entries.push({
        path: `/courses/${c.id}/lessons`,
        lastmod: c.updated_at?.slice(0, 10),
        changefreq: "monthly",
        priority: "0.6",
      })
    })

    const { data: games } = await supabase
      .from("games")
      .select("game_id")
      .eq("is_active", true)
    games?.forEach(g =>
      entries.push({
        path: `/games/${g.game_id}`,
        changefreq: "monthly",
        priority: "0.6",
      }),
    )
  } catch (err) {
    console.warn("sitemap: skipping dynamic entries —", err)
  }

  return entries
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map(e =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  )

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n")
}

const dynamic = await fetchDynamicEntries()
const all = [...staticEntries, ...dynamic]
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(all))
console.log(`sitemap.xml written (${all.length} entries)`)
