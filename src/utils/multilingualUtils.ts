
import { Json } from "@/integrations/supabase/types";

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
