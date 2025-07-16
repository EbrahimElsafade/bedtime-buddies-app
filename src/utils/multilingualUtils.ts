
import { Json } from "@/integrations/supabase/types";

// Map website language codes to story language codes (for content)
export const getStoryLanguageCode = (websiteLanguage: string): string => {
  switch (websiteLanguage) {
    case 'ar':
      return 'ar-eg'; // Map Arabic website language to Egyptian Arabic story language
    case 'en':
      return 'en';
    case 'fr':
      return 'fr';
    default:
      return 'en';
  }
};

// Map website language codes to app language codes (for titles/descriptions)
export const getAppLanguageCode = (websiteLanguage: string): string => {
  switch (websiteLanguage) {
    case 'ar':
      return 'ar'; // Use 'ar' for Arabic titles/descriptions
    case 'en':
      return 'en';
    case 'fr':
      return 'fr';
    default:
      return 'en';
  }
};

export const getMultilingualText = (
  textObj: Json | string | undefined,
  preferredLanguage: string = 'en',
  fallbackLanguage: string = 'en'
): string => {
  // Handle legacy string format
  if (typeof textObj === 'string') {
    return textObj;
  }
  
  // Handle null or undefined
  if (!textObj) {
    return '';
  }
  
  // Handle JSONB object format
  if (typeof textObj === 'object' && textObj !== null && !Array.isArray(textObj)) {
    const langObj = textObj as Record<string, any>;
    
    // Try preferred language first
    if (langObj[preferredLanguage] && typeof langObj[preferredLanguage] === 'string') {
      return langObj[preferredLanguage];
    }
    
    // Try fallback language
    if (langObj[fallbackLanguage] && typeof langObj[fallbackLanguage] === 'string') {
      return langObj[fallbackLanguage];
    }
    
    // Try first available language
    const availableKeys = Object.keys(langObj);
    for (const key of availableKeys) {
      if (langObj[key] && typeof langObj[key] === 'string') {
        return langObj[key];
      }
    }
  }
  
  return '';
};
