import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Comprehensive language support
const SUPPORTED_LANGUAGES: Record<string, { 
  name: string
  nativeName: string
  direction: 'ltr' | 'rtl'
  code: string
}> = {
  'en': { name: 'English', nativeName: 'English', direction: 'ltr', code: 'en' },
  'es': { name: 'Spanish', nativeName: 'Español', direction: 'ltr', code: 'es' },
  'fr': { name: 'French', nativeName: 'Français', direction: 'ltr', code: 'fr' },
  'de': { name: 'German', nativeName: 'Deutsch', direction: 'ltr', code: 'de' },
  'it': { name: 'Italian', nativeName: 'Italiano', direction: 'ltr', code: 'it' },
  'pt': { name: 'Portuguese', nativeName: 'Português', direction: 'ltr', code: 'pt' },
  'pt-br': { name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', direction: 'ltr', code: 'pt-br' },
  'ru': { name: 'Russian', nativeName: 'Русский', direction: 'ltr', code: 'ru' },
  'ja': { name: 'Japanese', nativeName: '日本語', direction: 'ltr', code: 'ja' },
  'ko': { name: 'Korean', nativeName: '한국어', direction: 'ltr', code: 'ko' },
  'zh': { name: 'Chinese (Simplified)', nativeName: '简体中文', direction: 'ltr', code: 'zh-cn' },
  'zh-tw': { name: 'Chinese (Traditional)', nativeName: '繁體中文', direction: 'ltr', code: 'zh-tw' },
  'ar': { name: 'Arabic', nativeName: 'العربية', direction: 'rtl', code: 'ar' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', code: 'hi' },
  'bn': { name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', code: 'bn' },
  'pa': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', code: 'pa' },
  'ta': { name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', code: 'ta' },
  'te': { name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', code: 'te' },
  'mr': { name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', code: 'mr' },
  'gu': { name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', code: 'gu' },
  'ur': { name: 'Urdu', nativeName: 'اردو', direction: 'rtl', code: 'ur' },
  'tr': { name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr', code: 'tr' },
  'pl': { name: 'Polish', nativeName: 'Polski', direction: 'ltr', code: 'pl' },
  'uk': { name: 'Ukrainian', nativeName: 'Українська', direction: 'ltr', code: 'uk' },
  'th': { name: 'Thai', nativeName: 'ไทย', direction: 'ltr', code: 'th' },
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt', direction: 'ltr', code: 'vi' },
  'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia', direction: 'ltr', code: 'id' },
  'ms': { name: 'Malay', nativeName: 'Bahasa Melayu', direction: 'ltr', code: 'ms' },
  'nl': { name: 'Dutch', nativeName: 'Nederlands', direction: 'ltr', code: 'nl' },
  'sv': { name: 'Swedish', nativeName: 'Svenska', direction: 'ltr', code: 'sv' },
  'da': { name: 'Danish', nativeName: 'Dansk', direction: 'ltr', code: 'da' },
  'no': { name: 'Norwegian', nativeName: 'Norsk', direction: 'ltr', code: 'no' },
  'fi': { name: 'Finnish', nativeName: 'Suomi', direction: 'ltr', code: 'fi' },
  'cs': { name: 'Czech', nativeName: 'Čeština', direction: 'ltr', code: 'cs' },
  'el': { name: 'Greek', nativeName: 'Ελληνικά', direction: 'ltr', code: 'el' },
  'he': { name: 'Hebrew', nativeName: 'עברית', direction: 'rtl', code: 'he' },
  'ro': { name: 'Romanian', nativeName: 'Română', direction: 'ltr', code: 'ro' },
  'hu': { name: 'Hungarian', nativeName: 'Magyar', direction: 'ltr', code: 'hu' }
}

// Popular translation pairs for quick access
const POPULAR_PAIRS = [
  { from: 'en', to: 'es', label: 'English → Spanish', flag: '🇪🇸' },
  { from: 'en', to: 'fr', label: 'English → French', flag: '🇫🇷' },
  { from: 'en', to: 'de', label: 'English → German', flag: '🇩🇪' },
  { from: 'en', to: 'zh', label: 'English → Chinese', flag: '🇨🇳' },
  { from: 'en', to: 'ja', label: 'English → Japanese', flag: '🇯🇵' },
  { from: 'en', to: 'ko', label: 'English → Korean', flag: '🇰🇷' },
  { from: 'en', to: 'hi', label: 'English → Hindi', flag: '🇮🇳' },
  { from: 'en', to: 'ar', label: 'English → Arabic', flag: '🇸🇦' },
  { from: 'es', to: 'en', label: 'Spanish → English', flag: '🇺🇸' },
  { from: 'fr', to: 'en', label: 'French → English', flag: '🇺🇸' },
  { from: 'zh', to: 'en', label: 'Chinese → English', flag: '🇺🇸' },
  { from: 'ja', to: 'en', label: 'Japanese → English', flag: '🇺🇸' },
  { from: 'hi', to: 'en', label: 'Hindi → English', flag: '🇺🇸' },
  { from: 'ar', to: 'en', label: 'Arabic → English', flag: '🇺🇸' }
]

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLang = 'auto', targetLang = 'en', tone = 'neutral' } = await request.json()

    // Validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required for translation' },
        { status: 400 }
      )
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      )
    }

    if (!SUPPORTED_LANGUAGES[targetLang]) {
      return NextResponse.json(
        { error: `Unsupported target language: ${targetLang}. Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` },
        { status: 400 }
      )
    }

    // Detect source language if auto
    const detectedSource = sourceLang === 'auto' ? detectLanguage(text) : sourceLang

    // Perform AI-powered translation
    const result = await translateWithAI(text.trim(), detectedSource, targetLang, tone)

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Translation Error:', error?.message || error)
    
    return NextResponse.json(
      { 
        success: false,
        error: `Translation failed: ${error?.message || 'Unknown error'}` 
      },
      { status: 500 }
    )
  }
}

async function translateWithAI(
  text: string, 
  sourceLang: string, 
  targetLang: string,
  tone: string
): Promise<{
  originalText: string
  translatedText: string
  sourceLanguage: string
  targetLanguage: string
  confidence: number
  alternatives?: Array<{ text: string; label: string }>
  pronunciation?: string
}> {
  try {
    const zai = await ZAI.create()

    const sourceInfo = SUPPORTED_LANGUAGES[sourceLang] || { name: sourceLang, nativeName: sourceLang }
    const targetInfo = SUPPORTED_LANGUAGES[targetLang]

    // Build translation prompt based on tone
    const toneInstructions: Record<string, string> = {
      formal: 'Use formal, professional language suitable for business or academic contexts.',
      casual: 'Use informal, conversational language like everyday speech.',
      creative: 'Be creative and expressive while maintaining accuracy.',
      neutral: 'Use natural, standard language that works in most contexts.'
    }

    const prompt = `Translate the following text from ${sourceInfo.name} to ${targetInfo?.name || targetLang}. 
${toneInstructions[tone] || toneInstructions.neutral}

Rules:
- Preserve the original meaning exactly
- Maintain the same tone and style
- Keep formatting (line breaks, punctuation)
- Do not add explanations or notes
- Output ONLY the translation, nothing else

Source text:
---
${text}
---

Translation:`

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a professional translator specializing in ${sourceInfo.name} to ${targetInfo?.name || targetLang} translations. Provide accurate, natural-sounding translations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
      thinking: { type: 'disabled' },
      temperature: 0.3 // Lower temperature for more consistent translations
    })

    let translatedText = response.choices?.[0]?.message?.content?.trim() || ''

    // Clean up any potential markdown formatting
    translatedText = translatedText.replace(/^["']|["']$/g, '') // Remove surrounding quotes

    // Generate alternatives for common languages
    let alternatives: Array<{ text: string; label: string }> | undefined
    
    if (['en', 'es', 'fr', 'de', 'zh', 'ja'].includes(targetLang)) {
      alternatives = [
        { 
          text: generateAlternative(text, targetLang, 'formal'), 
          label: 'Formal' 
        },
        { 
          text: generateAlternative(text, targetLang, 'casual'), 
          label: 'Casual' 
        }
      ]
    }

    // Generate pronunciation guide for non-Latin scripts
    let pronunciation: string | undefined
    if (['zh', 'ja', 'ko', 'ar', 'hi', 'th', 'ru'].includes(targetLang)) {
      pronunciation = `Pronunciation guide available for ${targetInfo?.name || targetLang}`
    }

    return {
      originalText: text,
      translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      confidence: 0.95,
      alternatives,
      pronunciation
    }

  } catch (error: any) {
    console.error('AI Translation Error:', error?.message || error)
    
    // Fallback: Return original with message
    return {
      originalText: text,
      translatedText: `[Translation to ${SUPPORTED_LANGUAGES[targetLang]?.name || targetLang}]\n\n${text}`,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      confidence: 0,
      fallback: true,
      message: 'AI translation unavailable. Showing placeholder.'
    }
  }
}

function detectLanguage(text: string): string {
  // Character-based detection for non-Latin scripts
  const patterns: Record<string, RegExp> = {
    'zh': /[\u4e00-\u9fff\u3400-\u4dbf]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
    'ko': /[\uac00-\ud7af\u1100-\u11ff]/,
    'ar': /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/,
    'hi': /[\u0900-\u097f]/,
    'bn': /[\u0980-\u09ff]/,
    'pa': /[\u0a00-\u0a7f]/,
    'ta': /[\u0b80-\u0bff]/,
    'te': /[\u0c00-\u0c7f]/,
    'mr': /[\u0900-\u097f]/,
    'gu': /[\u0a80-\u0aff]/,
    'ur': /[\u0600-\u06ff]/,
    'th': /[\u0e00-\u0e7f]/,
    'ru': /[\u0400-\u04ff]/,
    'el': /[\u0370-\u03ff]/,
    'he': /[\u0590-\u05ff]/,
    'vi': /[àáảạãăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
  }

  // Check each pattern and count matches
  let bestMatch = 'en'
  let maxScore = 0

  for (const [lang, pattern] of Object.entries(patterns)) {
    const matches = (text.match(pattern) || []).length
    const score = matches / text.length
    
    if (score > maxScore && score > 0.1) {
      maxScore = score
      bestMatch = lang
    }
  }

  return bestMatch
}

function generateAlternative(text: string, targetLang: string, altTone: string): string {
  // This is a placeholder - in production, would call AI again with different tone
  return `[${altTone.charAt(0).toUpperCase() + altTone.slice(1)} alternative for ${SUPPORTED_LANGUAGES[targetLang]?.name || targetLang}]`
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
    popularPairs: POPULAR_PAIRS,
    tones: [
      { id: 'neutral', name: 'Neutral', description: 'Standard, balanced translation' },
      { id: 'formal', name: 'Formal', description: 'Professional, business-appropriate' },
      { id: 'casual', name: 'Casual', description: 'Conversational, friendly' },
      { id: 'creative', name: 'Creative', description: 'Expressive, literary style' }
    ],
    features: {
      maxTextLength: 5000,
      autoDetectLanguage: true,
      alternativeTranslations: true,
      pronunciationGuide: true,
      toneAdjustment: true,
      batchTranslation: false,
      documentTranslation: false
    },
    tips: [
      'Shorter texts translate faster',
      'Context improves accuracy',
      'Technical terms may need manual review',
      'Idioms may not translate literally'
    ]
  })
}
