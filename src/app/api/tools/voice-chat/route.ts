import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Voice options configuration
const VOICE_OPTIONS = [
  { id: 'tongtong', name: 'TongTong', gender: 'neutral', description: 'Natural Chinese voice', language: 'zh' },
  { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced and natural', language: 'en' },
  { id: 'echo', name: 'Echo', gender: 'male', description: 'Deep and resonant', language: 'en' },
  { id: 'fable', name: 'Fable', gender: 'neutral', description: 'Expressive and warm', language: 'en' },
  { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Low and serious', language: 'en' },
  { id: 'nova', name: 'Nova', gender: 'female', description: 'Bright and clear', language: 'en' },
  { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft and gentle', language: 'en' }
]

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' }
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, text, voice = 'alloy', language = 'en', audioData } = body

    if (!action || !['tts', 'stt'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use "tts" (text-to-speech) or "stt" (speech-to-text)' },
        { status: 400 }
      )
    }

    if (action === 'tts') {
      return await handleTextToSpeech(text, voice, language)
    } else {
      return await handleSpeechToText(audioData)
    }

  } catch (error: any) {
    console.error('Voice Chat Error:', error?.message || error)
    return NextResponse.json(
      { error: `Voice processing failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

async function handleTextToSpeech(text: string, voice: string, language: string): Promise<NextResponse> {
  // Validation
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      { error: 'Text is required for text-to-speech' },
      { status: 400 }
    )
  }

  if (text.length > 4096) {
    return NextResponse.json(
      { error: 'Text too long. Maximum 4096 characters.' },
      { status: 400 }
    )
  }

  try {
    // Use ZAI SDK for real TTS
    const zai = await ZAI.create()

    const response = await zai.audio.tts.create({
      input: text.trim(),
      voice: voice,
      speed: 1.0,
      response_format: 'mp3',
      stream: false
    })

    // Convert to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64Audio = Buffer.from(new Uint8Array(arrayBuffer)).toString('base64')

    return NextResponse.json({
      success: true,
      action: 'tts',
      audioBase64: base64Audio,
      audioUrl: null, // Client will create blob URL from base64
      format: 'mp3',
      text: text.trim(),
      voice,
      duration: estimateDuration(text),
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('TTS Error:', error?.message || error)
    
    // Return info about browser fallback
    return NextResponse.json({
      success: true,
      action: 'tts',
      audioBase64: null,
      audioUrl: null,
      format: null,
      text: text.trim(),
      voice,
      fallback: true,
      useBrowserTTS: true, // Tell client to use Web Speech API
      message: 'Using browser Text-to-Speech. Click play to hear the audio.',
      duration: estimateDuration(text),
      timestamp: new Date().toISOString()
    })
  }
}

async function handleSpeechToText(audioData?: string): Promise<NextResponse> {
  if (!audioData) {
    return NextResponse.json(
      { error: 'Audio data is required for speech-to-text' },
      { status: 400 }
    )
  }

  try {
    // Use ZAI SDK for real ASR
    const zai = await ZAI.create()

    const result = await zai.audio.asr.create({
      file_base64: audioData
    })

    return NextResponse.json({
      success: true,
      action: 'stt',
      text: result.text || '',
      confidence: result.confidence || 0.95,
      language: result.language || 'auto-detected',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('ASR Error:', error?.message || error)
    
    return NextResponse.json({
      success: true,
      action: 'stt',
      text: '',
      confidence: 0,
      language: 'unknown',
      fallback: true,
      useBrowserSTT: true, // Tell client to use Web Speech API
      message: 'Using browser Speech Recognition. Please allow microphone access.',
      timestamp: new Date().toISOString()
    })
  }
}

function estimateDuration(text: string): number {
  // Average speaking rate: ~150 words per minute, ~4.5 characters per word
  const wordCount = text.length / 4.5
  return Math.ceil((wordCount / 150) * 60) // Duration in seconds
}

// GET endpoint for voice options and features
export async function GET() {
  return NextResponse.json({
    success: true,
    voices: VOICE_OPTIONS,
    languages: SUPPORTED_LANGUAGES,
    features: {
      maxTextLength: 4096,
      supportedFormats: ['mp3', 'wav'],
      streamingSupported: false,
      browserFallback: {
        tts: 'Web Speech API (SpeechSynthesis)',
        stt: 'Web Speech API (SpeechRecognition)'
      },
      tips: [
        'For best results, use clear pronunciation',
        'Background noise may affect accuracy',
        'Maximum audio length: 5 minutes recommended'
      ]
    },
    browserSupport: {
      speechSynthesis: 'Most modern browsers support TTS',
      speechRecognition: 'Chrome, Edge, Safari support STT'
    }
  })
}
