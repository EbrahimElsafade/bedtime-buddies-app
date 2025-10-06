import { getImageUrl } from '@/utils/imageUtils'
import { StorySectionForm } from '../hooks/useStoryForm'

export const parseTitle = (title: any): Record<string, string> => {
  let titleObj = { en: '', ar: '', fr: '' }

  if (typeof title === 'string') {
    try {
      const parsed = JSON.parse(title)
      titleObj = {
        en: parsed.en || '',
        ar: parsed.ar || '',
        fr: parsed.fr || '',
      }
    } catch {
      titleObj = { en: title, ar: '', fr: '' }
    }
  } else if (title && typeof title === 'object') {
    const existing = title as Record<string, string>
    titleObj = {
      en: existing.en || '',
      ar: existing.ar || '',
      fr: existing.fr || '',
    }
  }

  return titleObj
}

export const parseDescription = (description: any): Record<string, string> => {
  let descriptionObj = { en: '', ar: '', fr: '' }

  if (typeof description === 'string') {
    try {
      const parsed = JSON.parse(description)
      descriptionObj = {
        en: parsed.en || '',
        ar: parsed.ar || '',
        fr: parsed.fr || '',
      }
    } catch {
      descriptionObj = { en: description, ar: '', fr: '' }
    }
  } else if (description && typeof description === 'object') {
    const existing = description as Record<string, string>
    descriptionObj = {
      en: existing.en || '',
      ar: existing.ar || '',
      fr: existing.fr || '',
    }
  }

  return descriptionObj
}

export const parseStoryAudio = (storyAudio: any): Record<string, string> => {
  let audioObj = {}

  if (typeof storyAudio === 'string') {
    try {
      audioObj = JSON.parse(storyAudio)
    } catch {
      audioObj = { en: storyAudio }
    }
  } else if (storyAudio && typeof storyAudio === 'object') {
    audioObj = storyAudio as Record<string, string>
  }

  return audioObj
}

export const parseStorySections = (sections: any[]): StorySectionForm[] => {
  return sections.map(section => {
    let texts = {}
    if (typeof section.texts === 'string') {
      try {
        texts = JSON.parse(section.texts)
      } catch {
        texts = { en: section.texts }
      }
    } else if (section.texts && typeof section.texts === 'object') {
      texts = section.texts
    }

    let voices = {}
    if (typeof section.voices === 'string') {
      try {
        voices = JSON.parse(section.voices)
      } catch {
        voices = { en: section.voices }
      }
    } else if (section.voices && typeof section.voices === 'object') {
      voices = section.voices
    }

    const voicePreviews: Record<string, string> = {}
    if (voices && typeof voices === 'object') {
      Object.entries(voices as Record<string, string>).forEach(
        ([lang, voiceFile]) => {
          if (voiceFile) {
            voicePreviews[lang] = getImageUrl(voiceFile)
          }
        },
      )
    }

    return {
      id: section.id,
      order: section.order,
      texts: texts as Record<string, string>,
      voices: voices as Record<string, string>,
      image: section.image || undefined,
      imagePreview: section.image ? getImageUrl(section.image) : null,
      voicePreviews,
    }
  })
}
