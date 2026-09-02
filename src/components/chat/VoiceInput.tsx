'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/lib/i18n'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  disabled?: boolean
  className?: string
}

// Type for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function VoiceInput({ onTranscript, disabled = false, className }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [transcript, setTranscript] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { t } = useI18n()

  // Check browser support on mount
  useEffect(() => {
    const supported = typeof window !== 'undefined' && (
      'SpeechRecognition' in window || 
      'webkitSpeechRecognition' in window
    )
    setIsSupported(supported)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!isSupported || isListening || disabled) return

    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      
      if (!SpeechRecognitionAPI) {
        setIsSupported(false)
        return
      }

      const recognition = new SpeechRecognitionAPI()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US' // Default to English, can be changed based on i18n locale

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          if (result.isFinal) {
            finalTranscript += result[0].transcript + ' '
          }
        }

        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
          
          // Reset silence timer
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          
          // Auto-stop after 2 seconds of silence
          timeoutRef.current = setTimeout(() => {
            stopListening()
          }, 2000)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        
        if (event.error === 'not-allowed') {
          setIsSupported(false)
        }
        
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
      setTranscript('')
      recognition.start()
      setIsListening(true)
    } catch (error) {
      console.error('Failed to start speech recognition:', error)
      setIsSupported(false)
    }
  }, [isSupported, isListening, disabled])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    setIsListening(false)
    
    // Send transcript to parent
    if (transcript.trim()) {
      onTranscript(transcript.trim())
      setTranscript('')
    }
  }, [transcript, onTranscript])

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // If not supported, don't render or show disabled state
  if (!isSupported) {
    return (
      <button
        type="button"
        className={cn(
          "p-2 rounded-lg opacity-50 cursor-not-allowed",
          "bg-white/5 text-muted-foreground",
          className
        )}
        disabled={true}
        title="Voice input not supported in this browser"
      >
        <MicOff className="w-5 h-5" />
      </button>
    )
  }

  return (
    <>
      {/* Visual feedback when listening */}
      {isListening && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 glass-strong rounded-lg px-3 py-2 flex items-center gap-2 animate-pulse">
          <div className="flex gap-1">
            <span className="w-1 h-3 bg-neon-orange rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-neon-amber rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-neon-orange rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span className="text-xs font-medium text-foreground">Listening...</span>
        </div>
      )}

      <button
        type="button"
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          "relative p-2 rounded-lg transition-all duration-300",
          "focus:outline-none focus:ring-2 focus:ring-neon-orange/50",
          isListening
            ? "bg-red-500/20 text-red-400 hover:bg-red-500/30 scale-110"
            : "hover:bg-white/10 hover:text-neon-orange hover:scale-105 text-foreground/70",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        aria-label={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <>
            <MicOff className="w-5 h-5 relative z-10" />
            {/* Pulsing ring effect */}
            <span className="absolute inset-0 rounded-lg bg-red-500/30 animate-ping" />
          </>
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>
    </>
  )
}

export default VoiceInput
