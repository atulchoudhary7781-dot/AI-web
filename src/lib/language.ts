/**
 * Language Detection Utility
 * Centralized language detection for text analysis
 */

/**
 * Language patterns for character-based detection
 * Covers major scripts: CJK, Arabic, Indic, Cyrillic, Greek, Hebrew, Thai, Vietnamese
 */
export const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  // Chinese (Simplified & Traditional)
  'zh': /[\u4e00-\u9fff\u3400-\u4dbf]/,
  
  // Japanese (Hiragana & Katakana)
  'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
  
  // Korean (Hangul)
  'ko': /[\uac00-\ud7af\u1100-\u11ff]/,
  
  // Arabic (including Urdu range)
  'ar': /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/,
  
  // Hindi/Devanagari
  'hi': /[\u0900-\u097f]/,
  
  // Bengali
  'bn': /[\u0980-\u09ff]/,
  
  // Punjabi/Gurmukhi
  'pa': /[\u0a00-\u0a7f]/,
  
  // Tamil
  'ta': /[\u0b80-\u0bff]/,
  
  // Telugu
  'te': /[\u0c00-\u0c7f]/,
  
  // Marathi (same as Hindi - Devanagari)
  'mr': /[\u0900-\u097f]/,
  
  // Gujarati
  'gu': /[\u0a80-\u0aff]/,
  
  // Urdu (Arabic script)
  'ur': /[\u0600-\u06ff]/,
  
  // Thai
  'th': /[\u0e00-\u0e7f]/,
  
  // Russian/Cyrillic
  'ru': /[\u0400-\u04ff]/,
  
  // Greek
  'el': /[\u0370-\u03ff]/,
  
  // Hebrew
  'he': /[\u0590-\u05ff]/,
  
  // Vietnamese (Latin with diacritics)
  'vi': /[àáảạãăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i,
}

/**
 * Language names mapping
 */
export const LANGUAGE_NAMES: Record<string, string> = {
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'ar': 'Arabic',
  'hi': 'Hindi',
  'bn': 'Bengali',
  'pa': 'Punjabi',
  'ta': 'Tamil',
  'te': 'Telugu',
  'mr': 'Marathi',
  'gu': 'Gujarati',
  'ur': 'Urdu',
  'th': 'Thai',
  'ru': 'Russian',
  'el': 'Greek',
  'he': 'Hebrew',
  'vi': 'Vietnamese',
  'en': 'English',
}

/**
 * Detect the primary language of a text using character-based heuristics
 * 
 * @param text - The text to analyze
 * @param options - Detection options
 * @returns The detected language code (e.g., 'zh', 'en', 'ja')
 * 
 * @example
 * detectLanguage('你好世界') // Returns 'zh'
 * detectLanguage('Hello World') // Returns 'en'
 * detectLanguage('こんにちは') // Returns 'ja'
 */
export function detectLanguage(
  text: string, 
  options?: { returnName?: boolean; threshold?: number }
): string {
  if (!text || text.trim().length === 0) {
    return options?.returnName ? 'English' : 'en'
  }

  const threshold = options?.threshold ?? 0.1
  
  // Check each pattern and count matches
  let bestMatch = 'en'
  let maxScore = 0

  for (const [lang, pattern] of Object.entries(LANGUAGE_PATTERNS)) {
    const matches = (text.match(pattern) || []).length
    const score = matches / text.length
    
    if (score > maxScore && score > threshold) {
      maxScore = score
      bestMatch = lang
    }
  }

  return options?.returnName 
    ? (LANGUAGE_NAMES[bestMatch] || bestMatch) 
    : bestMatch
}

/**
 * Get human-readable language name from code
 */
export function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code
}

/**
 * Check if text contains characters from a specific language script
 */
export function isLanguage(text: string, langCode: string): boolean {
  const pattern = LANGUAGE_PATTERNS[langCode]
  if (!pattern) return false
  return pattern.test(text)
}
