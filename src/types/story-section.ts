export interface StorySection {
  id?: string
  order: number
  texts: Record<string, string>
  voices?: Record<string, string>
  image?: string
  imageFile?: File | null
  imagePreview?: string | null
  voiceFiles?: Record<string, File>
  voicePreviews?: Record<string, string>
}
