export interface StorySection {
  id?: string
  order: number
  texts: Record<string, string>
  voices?: Record<string, string>
  image?: string
  video?: string
  imageFile?: File | null
  videoFile?: File | null
  imagePreview?: string | null
  videoPreview?: string | null
  voiceFiles?: Record<string, File>
  voicePreviews?: Record<string, string>
}
