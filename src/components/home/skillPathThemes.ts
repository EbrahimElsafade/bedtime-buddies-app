export type SkillPathTheme =
  | 'blue-neon'
  | 'purple-pulse'
  | 'orange-energy'
  | 'cyber-grid'
  | 'space-glow'
  | 'matrix-flow'

export interface SkillPathThemeMeta {
  id: SkillPathTheme
  label: string
}

export const SKILL_PATH_THEMES: SkillPathThemeMeta[] = [
  { id: 'blue-neon', label: 'Blue Neon' },
  { id: 'purple-pulse', label: 'Purple Pulse' },
  { id: 'orange-energy', label: 'Orange Energy' },
  { id: 'cyber-grid', label: 'Cyber Grid' },
  { id: 'space-glow', label: 'Space Glow' },
  { id: 'matrix-flow', label: 'Matrix Flow' },
]

export const isSkillPathTheme = (v: unknown): v is SkillPathTheme =>
  typeof v === 'string' &&
  SKILL_PATH_THEMES.some((t) => t.id === v)
