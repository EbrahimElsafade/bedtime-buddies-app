export interface Language {
  id: string
  code: string
  name: string
  name_en?: string
  name_ar?: string
  name_fr?: string
  direction?: 'ltr' | 'rtl'
  flag_emoji?: string
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: string
  name: string
  name_en?: string
  name_ar?: string
  name_fr?: string
  description?: string
  description_en?: string
  description_ar?: string
  description_fr?: string
}
