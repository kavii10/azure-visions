// Translation service using a free translation API
interface TranslationResponse {
  translatedText: string;
  sourceLanguage?: string;
}

const LANGUAGE_CODES = {
  'en': 'English',
  'ta': 'Tamil',
  'hi': 'Hindi', 
  'fr': 'French',
  'de': 'German',
  'te': 'Telugu'
};

// Using MyMemory Translation API (free, no API key required)
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  if (targetLanguage === 'en' || !text.trim()) {
    return text; // Return original if English or empty
  }

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLanguage}`
    );
    
    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    // Fallback: return original text if translation fails
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Return original text if API fails
  }
};

export const getLanguageName = (code: string): string => {
  return LANGUAGE_CODES[code as keyof typeof LANGUAGE_CODES] || code;
};

export const getSpeechLanguageCode = (code: string): string => {
  const speechCodes: { [key: string]: string } = {
    'en': 'en-US',
    'ta': 'ta-IN',
    'hi': 'hi-IN',
    'fr': 'fr-FR', 
    'de': 'de-DE',
    'te': 'te-IN'
  };
  return speechCodes[code] || 'en-US';
};