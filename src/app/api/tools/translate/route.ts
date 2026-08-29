import { NextRequest, NextResponse } from 'next/server'

// Supported languages for translation
const SUPPORTED_LANGUAGES: Record<string, { name: string; nativeName: string; direction: 'ltr' | 'rtl' }> = {
  'en': { name: 'English', nativeName: 'English', direction: 'ltr' },
  'es': { name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  'fr': { name: 'French', nativeName: 'Français', direction: 'ltr' },
  'de': { name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  'it': { name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  'pt': { name: 'Portuguese', nativeName: 'Português', direction: 'ltr' },
  'ru': { name: 'Russian', nativeName: 'Русский', direction: 'ltr' },
  'ja': { name: 'Japanese', nativeName: '日本語', direction: 'ltr' },
  'ko': { name: 'Korean', nativeName: '한국어', direction: 'ltr' },
  'zh': { name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr' },
  'zh-tw': { name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr' },
  'ar': { name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr' },
  'bn': { name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr' },
  'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr' },
  'ta': { name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr' },
  'te': { name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr' },
  'mr': { name: 'Marathi', nativeName: 'मराठी', direction: 'ltr' },
  'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr' },
  'ur': { name: 'Urdu', nativeName: 'اردو', direction: 'rtl' },
  'tr': { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' },
  'pl': { name: 'Polish', nativeName: 'Polski', direction: 'ltr' },
  'uk': { name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr' },
  'th': { name: 'Thai', nativeName: 'ไทย', direction: 'ltr' },
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr' },
  'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr' },
  'ms': { name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr' },
  'nl': { name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr' },
  'sv': { name: 'Swedish', nativeName: 'Svenska', direction: 'ltr' },
  'da': { name: 'Danish', nativeName: 'Dansk', direction: 'ltr' },
  'no': { name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr' },
  'fi': { name: 'Finnish', nativeName: 'Suomi', direction: 'ltr' }
}

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en' } = await request.json()

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters.' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_LANGUAGES[targetLang]) {
      return NextResponse.json(
        { error: `Unsupported target language: ${targetLang}` },
        { status: 400 }
      )
    }

    // Perform translation
    const result = await translateText(text.trim(), sourceLang, targetLang)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Translation Error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}

async function translateText(text: string, sourceLang: string, targetLang: string): Promise<{
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence?: number
  alternatives?: Array<{ text: string; confidence: number }>
}> {
  // Detect source language if auto
  const detectedSource = sourceLang === 'auto' ? detectLanguage(text) : sourceLang
  
  try {
    // Try using AI/translation service
    // In production, integrate with Google Translate API, DeepL, or similar
    
    // For now, use AI-powered translation simulation
    const translatedText = await performAITranslation(text, detectedSource, targetLang)
    
    return {
      originalText: text,
      translatedText,
      sourceLanguage: detectedSource,
      targetLanguage: targetLang,
      confidence: 0.95,
      alternatives: generateAlternatives(text, targetLang)
    }
    
  } catch (error) {
    console.error('Translation service error:', error)
    
    // Fallback response
    return {
      originalText: text,
      translatedText: `[Translation to ${SUPPORTED_LANGUAGES[targetLang]?.name || targetLang}]\n\n${text}\n\n[Connect translation API (Google Translate, DeepL, etc.) for actual translations.]`,
      sourceLanguage: detectedSource,
      targetLanguage: targetLang,
      confidence: 0,
      fallback: true
    }
  }
}

function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const patterns: Record<string, RegExp> = {
    'ar': /[\u0600-\u06FF]/,
    'hi': /[\u0900-\u097F]/,
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
    'ko': /[\uac00-\ud7af]/,
    'th': /[\u0e00-\u0e7f]/,
    'ru': /[\u0400-\u04FF]/,
    'bn': /[\u0980-\u09FF]/,
    'pa': /[\u0a00-\u0a7f]/,
    'ta': /[\u0b80-\u0bff]/,
    'te': /[\u0c00-\u0c7f]/,
    'mr': /[\u0900-\u097F]/,
    'gu': /[\u0a80-\u0aff]/,
    'ur': /[\u0600-\u06FF]/,
    'vi': /[àáảạãăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
  }

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return lang
  }

  return 'en' // Default to English
}

async function performAITranslation(text: string, sourceLang: string, targetLang: string): Promise<string> {
  // Simulated AI translation - in production, call actual translation API
  const targetInfo = SUPPORTED_LANGUAGES[targetLang]
  
  // For demo, return a formatted response indicating translation would happen here
  if (sourceLang === targetLang) {
    return text // Same language, no translation needed
  }

  // Return placeholder with info about what would be translated
  return `[Translated to ${targetInfo?.name || targetLang}]\n\nOriginal (${SUPPORTED_LANGUAGES[sourceLang]?.name || sourceLang}): ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`
}

function generateAlternatives(text: string, targetLang: string): Array<{ text: string; confidence: number }> {
  // Generate alternative translations (in production, these come from the translation API)
  return [
    { 
      text: `[Alternative 1: Translation in ${SUPPORTED_LANGUAGES[targetLang]?.name}]`, 
      confidence: 0.85 
    },
    { 
      text: `[Alternative 2: More formal tone]`, 
      confidence: 0.75 
    },
    { 
      text: `[Alternative 3: Casual/informal]`, 
      confidence: 0.70 
    }
  ]
}

// GET endpoint for supported languages and features
export async function GET() {
  return NextResponse.json({
    success: true,
    languages: Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
      code,
      name: info.name,
      nativeName: info.nativeName,
      direction: info.direction
    })),
    popularPairs: [
      { from: 'en', to: 'es', label: 'English → Spanish' },
      { from: 'en', to: 'fr', label: 'English → French' },
      { from: 'en', to: 'de', label: 'English → German' },
      { from: 'en', to: 'zh', label: 'English → Chinese' },
      { from: 'en', to: 'ja', label: 'English → Japanese' },
      { from: 'en', to: 'hi', label: 'English → Hindi' },
      { from: 'en', to: 'ar', label: 'English → Arabic' },
      { from: 'es', to: 'en', label: 'Spanish → English' },
      { from: 'fr', to: 'en', label: 'French → English' },
      { from: 'de', to: 'en', label: 'German → English' },
      { from: 'zh', to: 'en', label: 'Chinese → English' },
      { from: 'ja', to: 'en', label: 'Japanese → English' },
      { from: 'hi', to: 'en', label: 'Hindi → English' }
    ],
    features: {
      maxTextLength: 5000,
      autoDetectLanguage: true,
      alternativeTranslations: true,
      pronunciation: false,
      ttsOutput: true,
      history: true
    }
  })
}
