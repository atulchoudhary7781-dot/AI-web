import { NextRequest, NextResponse } from 'next/server'

// Text-to-Speech (TTS) - Convert text to audio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, text, voice = 'alloy', language = 'en' } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required (tts or stt)' },
        { status: 400 }
      )
    }

    if (action === 'tts') {
      return await handleTextToSpeech(text, voice, language)
    } else if (action === 'stt') {
      return await handleSpeechToText(body.audioData)
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "tts" or "stt"' },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Voice Chat Error:', error)
    return NextResponse.json(
      { error: 'Voice processing failed' },
      { status: 500 }
    )
  }
}

async function handleTextToSpeech(text: string, voice: string, language: string): Promise<NextResponse> {
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      { error: 'Text is required for TTS' },
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
    // Try using TTS skill if available
    const ttsModule = await import('@/lib/tts').catch(() => null)
    
    if (ttsModule?.default?.speak || ttsModule?.speak) {
      const ttsFunction = ttsModule.default?.speak || ttsModule.speak
      const audioResult = await ttsFunction(text, { voice, language })
      
      if (audioResult) {
        // Return audio data
        if (typeof audioResult === 'string') {
          return NextResponse.json({
            success: true,
            action: 'tts',
            audioUrl: audioResult,
            audioBase64: null,
            text,
            voice,
            duration: estimateDuration(text),
            timestamp: new Date().toISOString()
          })
        } else if (audioResult.audioBase64 || audioResult.url) {
          return NextResponse.json({
            success: true,
            action: 'tts',
            audioUrl: audioResult.url || null,
            audioBase64: audioResult.audioBase64 || null,
            text,
            voice,
            duration: audioResult.duration || estimateDuration(text),
            timestamp: new Date().toISOString()
          })
        }
      }
    }
  } catch (error) {
    console.log('TTS skill not available, using fallback')
  }

  // Fallback: Return info about what would be spoken
  return NextResponse.json({
    success: true,
    action: 'tts',
    audioUrl: null,
    audioBase64: null,
    text: text.trim(),
    voice,
    fallback: true,
    message: 'TTS integration ready. Connect OpenAI API key or similar service for actual audio.',
    duration: estimateDuration(text),
    timestamp: new Date().toISOString()
  })
}

async function handleSpeechToText(audioData?: string): Promise<NextResponse> {
  if (!audioData) {
    return NextResponse.json(
      { error: 'Audio data is required for STT' },
      { status: 400 }
    )
  }

  try {
    // Try using ASR/STT skill if available
    const asrModule = await import('@/lib/asr').catch(() => null)
    
    if (asrModule?.default?.transcribe || asrModule?.transcribe) {
      const transcribeFn = asrModule.default?.transcribe || asrModule.transcribe
      const result = await transcribeFn(audioData)
      
      if (result?.text) {
        return NextResponse.json({
          success: true,
          action: 'stt',
          text: result.text,
          confidence: result.confidence || 0.95,
          language: result.language || 'en',
          timestamp: new Date().toISOString()
        })
      }
    }
  } catch (error) {
    console.log('ASR skill not available, using fallback')
  }

  // Fallback: Simulate transcription
  return NextResponse.json({
    success: true,
    action: 'stt',
    text: '[Speech detected - STT integration ready. Connect Whisper/OpenAI API for actual transcription.]',
    confidence: 0,
    language: 'en',
    fallback: true,
    timestamp: new Date().toISOString()
  })
}

function estimateDuration(text: string): number {
  // Average reading speed: ~150 words per minute, ~2.5 characters per word
  const wordCount = text.length / 2.5
  return Math.ceil((wordCount / 150) * 60) // Duration in seconds
}

// GET endpoint for voice options
export async function GET() {
  return NextResponse.json({
    success: true,
    voices: [
      { id: 'alloy', name: 'Alloy', gender: 'neutral', description: 'Balanced and natural' },
      { id: 'echo', name: 'Echo', gender: 'male', description: 'Deep and resonant' },
      { id: 'fable', name: 'Fable', gender: 'neutral', description: 'Expressive and warm' },
      { id: 'onyx', name: 'Onyx', gender: 'male', description: 'Low and serious' },
      { id: 'nova', name: 'Nova', gender: 'female', description: 'Bright and clear' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', description: 'Soft and gentle' }
    ],
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'hi', name: 'Hindi' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'ar', name: 'Arabic' }
    ],
    features: {
      maxTextLength: 4096,
      supportedFormats: ['mp3', 'opus', 'aac', 'flac'],
      streamingSupported: false
    }
  })
}
