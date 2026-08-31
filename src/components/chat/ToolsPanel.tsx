'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { 
  Search, Image, Mic, Code2, FileText, Languages, 
  X, Send, Loader2, Copy, Check, Download,
  Play, Square, Volume2, VolumeX, Upload,
  ExternalLink, Sparkles, AlertCircle, CheckCircle2,
  RefreshCw, FileImage, Zap, Lock, LogIn, Shield, Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolsPanelProps {
  isOpen: boolean
  onClose: () => void
  onInsertToChat: (text: string) => void
  isLoggedIn?: boolean
  onLoginRequired?: () => void
}

type ToolType = 'web-search' | 'image-gen' | 'voice-chat' | 'code-executor' | 'file-analyzer' | 'translator' | null

export default function ToolsPanel({ isOpen, onClose, onInsertToChat, isLoggedIn = false, onLoginRequired }: ToolsPanelProps) {
  const [activeTool, setActiveTool] = useState<ToolType>(null)
  
  // Tool states - Web Search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string>('')
  
  // Tool states - Image Generation
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [imageStyle, setImageStyle] = useState('natural')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [imageError, setImageError] = useState<string>('')
  
  // Tool states - Voice Chat
  const [voiceText, setVoiceText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [voiceStatus, setVoiceStatus] = useState<string>('')
  
  // Tool states - Code Executor
  const [code, setCode] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [codeOutput, setCodeOutput] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')
  const [isRunningCode, setIsRunningCode] = useState(false)
  
  // Tool states - File Analyzer
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisType, setAnalysisType] = useState('summary')
  
  // Tool states - Translator
  const [translateText, setTranslateText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('hi')
  const [translatedText, setTranslatedText] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const speechRecognitionRef = useRef<any>(null)

  // Copy state
  const [copiedItem, setCopiedItem] = useState<string>('')

  // Reset tool state when switching tools
  const resetToolState = useCallback(() => {
    setSearchResults([])
    setSearchError('')
    setGeneratedImage(null)
    setImageError('')
    setCodeOutput('')
    setCodeError('')
    setAnalysisResult(null)
    setTranslatedText('')
    setVoiceStatus('')
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setActiveTool(null)
      resetToolState()
    }
  }, [isOpen, resetToolState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [])

  // Copy to clipboard helper
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(itemId)
      setTimeout(() => setCopiedItem(''), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  if (!isOpen) return null

  // ==================== AUTH LOCK SCREEN ====================
  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm sm:bg-black/70 sm:backdrop-blur-md flex items-end sm:items-center justify-center animate-in fade-in duration-150">
        {/* Mobile: Full width bottom sheet | Desktop: Centered modal */}
        <div className="bg-gray-900/98 backdrop-blur-xl border border-gray-800/60 rounded-b-none sm:rounded-2xl w-full sm:w-auto sm:min-w-[420px] sm:max-w-md shadow-2xl shadow-black/50 animate-in slide-in-from-bottom-5 sm:zoom-in-95 sm:duration-200 max-h-[100vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
          
          {/* Lock Screen Header */}
          <div className="relative px-5 sm:px-7 py-6 sm:py-8 text-center bg-gradient-to-b from-cyan-500/10 via-purple-500/10 to-transparent flex-shrink-0">
            {/* Animated Lock Icon */}
            <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-5">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-pulse" />
              <div className="absolute inset-1 rounded-full bg-gray-800/80 flex items-center justify-center">
                <Lock className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-400" />
              </div>
              {/* Lock Badge */}
              <div className="absolute -top-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Crown className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-1.5 sm:mb-2">
              Premium Tools
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-[260px] sm:max-w-xs mx-auto">
              AI tools are exclusive for registered members. Create your free account to unlock all features.
            </p>
          </div>

          {/* Features List - Scrollable when needed */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-2 sm:space-y-3 border-t border-gray-800/50 overflow-y-auto flex-1 min-h-0">
            {[
              { icon: Search, label: 'Web Search', desc: 'Real-time internet search' },
              { icon: Image, label: 'AI Images', desc: 'Generate stunning visuals' },
              { icon: Mic, label: 'Voice Chat', desc: 'Talk with AI assistant' },
              { icon: Code2, label: 'Code Runner', desc: 'Execute code instantly' },
              { icon: FileText, label: 'File Analyzer', desc: 'Analyze documents & files' },
              { icon: Languages, label: 'Translator', desc: '100+ languages supported' }
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-3 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-lg bg-gray-800/30 group hover:bg-gray-800/50 transition-colors">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center group-hover:from-cyan-500/20 group-hover:to-purple-500/20 transition-colors flex-shrink-0">
                  <feature.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-white">{feature.label}</p>
                  <p className="text-[11px] sm:text-xs text-gray-500">{feature.desc}</p>
                </div>
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-500/60 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* CTA Section - Fixed at bottom */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gradient-to-t from-gray-800/40 to-transparent border-t border-gray-800/50 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400" />
              <span className="text-[11px] sm:text-xs text-gray-400">Free account • No credit card required</span>
            </div>
            
            <button
              onClick={onLoginRequired}
              className="w-full flex items-center justify-center gap-2 sm:gap-2.5 px-5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
            >
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
              Sign In to Unlock Tools
            </button>
            
            <button
              onClick={onClose}
              className="w-full mt-2.5 sm:mt-3 px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-xl transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ==================== TOOL HANDLERS ====================

  // Web Search Handler
  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    setSearchError('')
    
    try {
      const response = await fetch('/api/tools/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, numResults: 8 })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results || [])
        if (data.fallback) {
          setSearchError('Showing cached results')
        }
      } else {
        setSearchError(data.error || 'Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchError('Network error. Please try again.')
    }
    
    setIsSearching(false)
  }

  // Image Generation Handler
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return
    
    setIsGeneratingImage(true)
    setImageError('')
    setGeneratedImage(null)
    
    try {
      const response = await fetch('/api/tools/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: imagePrompt, 
          size: imageSize,
          style: imageStyle 
        })
      })
      
      const data = await response.json()
      
      if (data.success && data.image) {
        setGeneratedImage(data.image)
        if (data.fallback) {
          setImageError('Using placeholder image')
        }
      } else {
        setImageError(data.error || 'Generation failed')
      }
    } catch (error) {
      console.error('Image generation error:', error)
      setImageError('Network error. Please try again.')
    }
    
    setIsGeneratingImage(false)
  }

  // Download generated image
  const downloadImage = () => {
    if (!generatedImage) return
    
    const link = document.createElement('a')
    link.href = generatedImage
    link.download = `nexus-ai-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Voice Recording with browser Speech Recognition fallback
  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        // Try browser Speech Recognition first (better UX)
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition()
          recognition.continuous = true
          recognition.interimResults = true
          recognition.lang = targetLang === 'auto' ? 'en-US' : targetLang
          
          recognition.onresult = (event: any) => {
            let transcript = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
              transcript += event.results[i][0].transcript
            }
            setVoiceText(transcript)
          }
          
          recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            setVoiceStatus(`Error: ${event.error}`)
            setIsRecording(false)
          }
          
          recognition.onend = () => {
            setIsRecording(false)
          }
          
          speechRecognitionRef.current = recognition
          recognition.start()
          setIsRecording(true)
          setVoiceStatus('Listening...')
        } else {
          // Fallback to MediaRecorder + API
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
          mediaRecorderRef.current = new MediaRecorder(stream)
          const chunks: Blob[] = []
          
          mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
          mediaRecorderRef.current.onstop = async () => {
            const blob = new Blob(chunks, { type: 'audio/webm' })
            
            try {
              const arrayBuffer = await blob.arrayBuffer()
              const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
              
              const response = await fetch('/api/tools/voice-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stt', audioData: base64 })
              })
              
              const data = await response.json()
              
              if (data.success && data.text && !data.text.includes('[')) {
                setVoiceText(prev => prev + (prev ? ' ' : '') + data.text)
              }
            } catch (error) {
              console.error('STT error:', error)
            }
            
            stream.getTracks().forEach(track => track.stop())
          }
          
          mediaRecorderRef.current.start()
          setIsRecording(true)
          setVoiceStatus('Recording...')
        }
      } catch (error) {
        console.error('Microphone access denied:', error)
        setVoiceStatus('Microphone access denied')
        alert('Microphone access is required for voice input.')
      }
    } else {
      // Stop recording
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop()
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop()
      }
      setIsRecording(false)
      setVoiceStatus('')
    }
  }

  // Text-to-Speech with browser fallback
  const handleSpeak = async () => {
    if (!voiceText.trim() || isSpeaking) return
    
    setIsSpeaking(true)
    setVoiceStatus('Speaking...')
    
    try {
      const response = await fetch('/api/tools/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tts', text: voiceText, voice: selectedVoice })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (data.audioBase64) {
          // Play from base64 audio
          const audioBlob = new Blob(
            [Uint8Array.from(atob(data.audioBase64), c => c.charCodeAt(0))],
            { type: 'audio/mp3' }
          )
          const audioUrl = URL.createObjectURL(audioBlob)
          
          if (audioRef.current) {
            audioRef.current.pause()
          }
          
          audioRef.current = new Audio(audioUrl)
          audioRef.current.onended = () => {
            setIsSpeaking(false)
            setVoiceStatus('')
            URL.revokeObjectURL(audioUrl)
          }
          audioRef.current.onerror = () => {
            setIsSpeaking(false)
            setVoiceStatus('Playback failed')
          }
          await audioRef.current.play()
        } else if (data.useBrowserTTS) {
          // Fallback to browser TTS
          const utterance = new SpeechSynthesisUtterance(voiceText)
          utterance.voice = speechSynthesis.getVoices().find(v => v.name.toLowerCase().includes(selectedVoice)) || null
          utterance.onend = () => {
            setIsSpeaking(false)
            setVoiceStatus('')
          }
          utterance.onerror = () => {
            setIsSpeaking(false)
            setVoiceStatus('TTS failed')
          }
          speechSynthesis.speak(utterance)
        } else {
          setTimeout(() => {
            setIsSpeaking(false)
            setVoiceStatus('')
          }, 2000)
        }
      }
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
      setVoiceStatus('TTS failed')
    }
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    speechSynthesis.cancel()
    setIsSpeaking(false)
    setVoiceStatus('')
  }

  // Code Execution Handler
  const handleRunCode = async () => {
    if (!code.trim()) return
    
    setIsRunningCode(true)
    setCodeOutput('')
    setCodeError('')
    
    try {
      const response = await fetch('/api/tools/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language: codeLanguage })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setCodeOutput(data.output || '')
        setCodeError(data.error || '')
      } else {
        setCodeError(data.error || 'Execution failed')
      }
    } catch (error) {
      setCodeError('Network error. Failed to execute code.')
    }
    
    setIsRunningCode(false)
  }

  // Load example code
  const loadExample = () => {
    const examples: Record<string, string> = {
      javascript: `// Example: Fibonacci sequence
const fibonacci = (n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);

console.log("Fibonacci numbers:");
for (let i = 0; i <= 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
      python: `# Example: List comprehension
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

squares = [x**2 for x in numbers if x % 2 == 0]
even_sum = sum(x for x in numbers if x % 2 == 0)

print(f"Squares of evens: {squares}")
print(f"Sum of evens: {even_sum}")`,
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { 
      font-family: system-ui; 
      padding: 20px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    .card {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello World! 🎉</h1>
    <p>This is a live HTML preview</p>
  </div>
</body>
</html>`,
      json: `{
  "name": "NEXUS AI",
  "version": "2.0",
  "features": ["chat", "tools", "ai"],
  "config": {
    "theme": "dark"
  }
}`
    }
    
    setCode(examples[codeLanguage] || '')
  }

  // File Selection Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  // File Analysis Handler
  const handleAnalyzeFile = async () => {
    if (!selectedFile) return
    
    setIsAnalyzing(true)
    setAnalysisResult(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', analysisType)
      
      const response = await fetch('/api/tools/analyze-file', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAnalysisResult(data.analysis)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      setAnalysisResult({
        type: 'Error',
        summary: 'Failed to analyze file. Please try again.',
        error: true
      })
    }
    
    setIsAnalyzing(false)
  }

  // Translation Handler
  const handleTranslate = async () => {
    if (!translateText.trim()) return
    
    setIsTranslating(true)
    setTranslatedText('')
    
    try {
      const response = await fetch('/api/tools/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translateText, sourceLang, targetLang })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setTranslatedText(data.translatedText)
      } else {
        setTranslatedText(`Translation failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Translation error:', error)
      setTranslatedText('Network error. Translation failed.')
    }
    
    setIsTranslating(false)
  }

  // Swap languages
  const swapLanguages = () => {
    if (sourceLang === 'auto') return
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setTranslatedText(translateText)
    setTranslateText(translatedText)
  }

  // ==================== TOOLS CONFIGURATION ====================
  
  const tools = [
    { 
      id: 'web-search', 
      icon: Search, 
      label: 'Web Search', 
      color: 'from-blue-500 to-cyan-500', 
      description: 'Search the internet in real-time',
      badge: 'LIVE'
    },
    { 
      id: 'image-gen', 
      icon: Image, 
      label: 'AI Images', 
      color: 'from-purple-500 to-pink-500', 
      description: 'Generate stunning AI artwork',
      badge: 'AI'
    },
    { 
      id: 'voice-chat', 
      icon: Mic, 
      label: 'Voice Chat', 
      color: 'from-green-500 to-emerald-500', 
      description: 'Speak & listen to AI',
      badge: null
    },
    { 
      id: 'code-executor', 
      icon: Code2, 
      label: 'Code Runner', 
      color: 'from-orange-500 to-yellow-500', 
      description: 'Execute code instantly',
      badge: '⚡'
    },
    { 
      id: 'file-analyzer', 
      icon: FileText, 
      label: 'File Analyzer', 
      color: 'from-red-500 to-rose-500', 
      description: 'Analyze documents & files',
      badge: 'AI'
    },
    { 
      id: 'translator', 
      icon: Languages, 
      label: 'Translator', 
      color: 'from-indigo-500 to-violet-500', 
      description: '40+ languages supported',
      badge: '40+'
    }
  ]

  // Language options for translator
  const languageOptions = [
    { value: 'auto', label: '🔍 Auto Detect' },
    { value: 'en', label: '🇺🇸 English' },
    { value: 'es', label: '🇪🇸 Spanish' },
    { value: 'fr', label: '🇫🇷 French' },
    { value: 'de', label: '🇩🇪 German' },
    { value: 'it', label: '🇮🇹 Italian' },
    { value: 'pt', label: '🇵🇹 Portuguese' },
    { value: 'ru', label: '🇷🇺 Russian' },
    { value: 'ja', label: '🇯🇵 Japanese' },
    { value: 'ko', label: '🇰🇷 Korean' },
    { value: 'zh', label: '🇨🇳 Chinese' },
    { value: 'ar', label: '🇸🇦 Arabic' },
    { value: 'hi', label: '🇮🇳 Hindi' },
    { value: 'bn', label: '🇧🇩 Bengali' },
    { value: 'pa', label: '🇮🇳 Punjabi' },
    { value: 'ta', label: '🇮🇳 Tamil' },
    { value: 'te', label: '🇮🇳 Telugu' },
    { value: 'mr', label: '🇮🇳 Marathi' },
    { value: 'ur', label: '🇵🇰 Urdu' },
    { value: 'tr', label: '🇹🇷 Turkish' },
    { value: 'vi', label: '🇻🇳 Vietnamese' },
    { value: 'th', label: '🇹🇭 Thai' },
    { value: 'nl', label: '🇳🇱 Dutch' },
    { value: 'pl', label: '🇵🇱 Polish' },
    { value: 'uk', label: '🇺🇦 Ukrainian' }
  ]

  // Image size options
  const sizeOptions = [
    { value: '512x512', label: 'Small' },
    { value: '1024x1024', label: 'Square' },
    { value: '1344x768', label: 'Landscape' },
    { value: '768x1344', label: 'Portrait' }
  ]

  // Image style options
  const styleOptions = [
    { value: 'natural', label: 'Natural' },
    { value: 'vivid', label: 'Vivid' },
    { value: 'anime', label: 'Anime' },
    { value: 'photorealistic', label: 'Photo' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: '3d-render', label: '3D Render' }
  ]

  // Code language options
  const codeLanguages = [
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'typescript', label: 'TypeScript', icon: '💙' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'json', label: 'JSON', icon: '📋' },
    { value: 'sql', label: 'SQL', icon: '🗄️' }
  ]

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm sm:bg-black/70 sm:backdrop-blur-md flex items-end sm:items-center justify-center animate-in fade-in duration-150">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-800/60 rounded-b-none sm:rounded-2xl w-full sm:max-w-4xl max-h-[100vh] sm:max-h-[92vh] shadow-2xl shadow-black/50 flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 sm:duration-300 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-800/50 bg-gradient-to-r from-gray-900 to-gray-800/50 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-white">AI Tools</h2>
              <p className="text-[11px] sm:text-xs text-gray-400">Powered by NEXUS AI</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-800 transition-all hover:rotate-90 duration-200"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {!activeTool ? (
          /* Tool Selection Grid - Scrollable */
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-0">
            <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4">Choose a tool to get started</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolType)}
                  className="group relative p-4 rounded-xl bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/50 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 text-left overflow-hidden"
                >
                  {tool.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 text-[10px] font-bold bg-cyan-500/20 text-cyan-400 rounded">
                      {tool.badge}
                    </span>
                  )}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-lg`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-0.5">{tool.label}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Tool Panel - Scrollable */
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Back Button */}
            <button
              onClick={() => {
                setActiveTool(null)
                resetToolState()
              }}
              className="mx-4 sm:mx-5 mt-3 sm:mt-4 mb-1 flex items-center gap-2 text-xs sm:text-sm text-gray-400 hover:text-cyan-400 transition-colors group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Back to all tools
            </button>

            {/* ==================== WEB SEARCH ==================== */}
            {activeTool === 'web-search' && (
              <div className="px-5 pb-5 space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                    placeholder="Search anything on the internet..."
                    className="w-full pl-11 pr-24 py-3.5 bg-gray-800/60 border border-gray-700/80 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none transition-all"
                    autoFocus
                  />
                  <Button
                    onClick={handleWebSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white border-0"
                  >
                    {isSearching ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Search'
                    )}
                  </Button>
                </div>

                {searchError && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    {searchError}
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">
                        <CheckCircle2 className="w-4 h-4 inline mr-1 text-green-400" />
                        {searchResults.length} results found
                      </p>
                      <button 
                        onClick={() => setSearchResults([])}
                        className="text-xs text-gray-500 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                      {searchResults.map((result, i) => (
                        <a
                          key={i}
                          href={result.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3.5 rounded-xl bg-gray-800/40 hover:bg-gray-800/80 border border-gray-700/30 hover:border-cyan-500/30 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-white group-hover:text-cyan-400 line-clamp-1 transition-colors">
                                {result.title}
                              </h4>
                              <p className="text-xs text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                                {result.snippet}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500/10 text-cyan-400 rounded">
                                  {result.source}
                                </span>
                                {result.date && (
                                  <span className="text-[10px] text-gray-500">{result.date}</span>
                                )}
                              </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {!searchResults.length && !isSearching && !searchError && (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Enter a query to search the web</p>
                    <p className="text-xs mt-1 text-gray-600">Real-time results from multiple sources</p>
                  </div>
                )}
              </div>
            )}

            {/* ==================== IMAGE GENERATION ==================== */}
            {activeTool === 'image-gen' && (
              <div className="px-5 pb-5 space-y-4">
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to create... Be detailed for better results!"
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/80 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none resize-none transition-all"
                  autoFocus
                />
                
                {/* Size Options */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {sizeOptions.map(size => (
                      <button
                        key={size.value}
                        onClick={() => setImageSize(size.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          imageSize === size.value
                            ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                            : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {size.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Style Options */}
                <div>
                  <label className="text-xs text-gray-400 block mb-2">Style</label>
                  <div className="flex gap-2 flex-wrap">
                    {styleOptions.map(style => (
                      <button
                        key={style.value}
                        onClick={() => setImageStyle(style.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          imageStyle === style.value
                            ? 'bg-pink-500 text-white shadow-lg shadow-pink-500/25'
                            : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:opacity-90 text-white border-0 h-11"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {imageError && (
                  <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="w-3 h-3" />
                    {imageError}
                  </div>
                )}

                {generatedImage && (
                  <div className="mt-4 space-y-3">
                    <div className="relative group rounded-xl overflow-hidden bg-gray-800/40 border border-gray-700/30">
                      <img 
                        src={generatedImage} 
                        alt="Generated by AI" 
                        className="w-full rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={downloadImage}
                          className="bg-white/20 backdrop-blur border-0 text-white hover:bg-white/30"
                        >
                          <Download className="w-4 h-4 mr-1" /> Save
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={downloadImage}
                      >
                        <Download className="w-4 h-4 mr-2" /> Download
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-500"
                        onClick={() => onInsertToChat(`[Generated Image: ${imagePrompt}]`)}
                      >
                        <Send className="w-4 h-4 mr-2" /> Insert to Chat
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== VOICE CHAT ==================== */}
            {activeTool === 'voice-chat' && (
              <div className="px-5 pb-5 space-y-4">
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="Type your message here or use voice input..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/80 rounded-xl text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none resize-none transition-all"
                  autoFocus
                />

                {/* Voice Controls */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    className={`h-auto py-3 ${isRecording ? 'animate-pulse' : ''}`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" /> Speak
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={isSpeaking ? stopSpeaking : handleSpeak}
                    disabled={!voiceText.trim() && !isSpeaking}
                    variant="outline"
                    className="py-3"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" /> Listen
                      </>
                    )}
                  </Button>
                </div>

                {voiceStatus && (
                  <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg animate-pulse">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
                    {voiceStatus}
                  </div>
                )}

                {/* Voice Selection */}
                <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/30">
                  <label className="text-xs text-gray-400 block mb-2">Voice Selection</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-green-500 outline-none"
                  >
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="echo">Echo (Male, Deep)</option>
                    <option value="fable">Fable (Warm)</option>
                    <option value="onyx">Onyx (Serious)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Soft)</option>
                    <option value="tongtong">TongTong (Chinese)</option>
                  </select>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white border-0 h-11"
                  onClick={() => onInsertToChat(voiceText)}
                  disabled={!voiceText.trim()}
                >
                  <Send className="w-4 h-4 mr-2" /> Send to Chat
                </Button>
              </div>
            )}

            {/* ==================== CODE EXECUTOR ==================== */}
            {activeTool === 'code-executor' && (
              <div className="px-5 pb-5 space-y-4">
                {/* Language Selector */}
                <div className="flex gap-2 flex-wrap">
                  {codeLanguages.map(lang => (
                    <button
                      key={lang.value}
                      onClick={() => setCodeLanguage(lang.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        codeLanguage === lang.value
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <span className="mr-1">{lang.icon}</span>
                      {lang.label}
                    </button>
                  ))}
                </div>

                {/* Code Editor */}
                <div className="relative">
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={`// Write ${codeLanguage} code here...`}
                    rows={10}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-700/80 rounded-xl text-emerald-400 placeholder:text-gray-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none resize-none font-mono text-sm leading-relaxed"
                    spellCheck={false}
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={loadExample}
                    className="absolute top-2 right-2 text-xs text-gray-500 hover:text-orange-400 h-7"
                  >
                    Example
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleRunCode}
                    disabled={isRunningCode || !code.trim()}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-yellow-500 hover:opacity-90 text-white border-0 h-11"
                  >
                    {isRunningCode ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" /> Run Code
                      </>
                    )}
                  </Button>
                  
                  {(codeOutput || codeError) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(codeOutput || codeError, 'code-output')}
                      className="px-3"
                    >
                      {copiedItem === 'code-output' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Output Display */}
                {(codeOutput || codeError) && (
                  <div className={`rounded-xl overflow-hidden ${codeError ? 'border border-red-500/30' : 'border border-gray-700/30'}`}>
                    <div className={`flex items-center justify-between px-4 py-2.5 ${codeError ? 'bg-red-500/10' : 'bg-gray-800/40'}`}>
                      <span className={`text-xs font-medium flex items-center gap-1.5 ${codeError ? 'text-red-400' : 'text-green-400'}`}>
                        {codeError ? (
                          <><AlertCircle className="w-3.5 h-3.5" /> Error</>
                        ) : (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Output</>
                        )}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {codeLanguage.toUpperCase()} • {new Date().toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className={`px-4 py-3 text-xs font-mono max-h-48 overflow-auto ${codeError ? 'text-red-300 bg-red-500/5' : 'text-gray-300 bg-gray-900/50'} whitespace-pre-wrap`}>
                      {codeError || codeOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* ==================== FILE ANALYZER ==================== */}
            {activeTool === 'file-analyzer' && (
              <div className="px-5 pb-5 space-y-4">
                {/* Upload Area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    const file = e.dataTransfer.files[0]
                    if (file) setSelectedFile(file)
                  }}
                  className="border-2 border-dashed border-gray-700 hover:border-red-500/50 hover:bg-red-500/5 rounded-xl p-8 text-center cursor-pointer transition-all group"
                >
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500 group-hover:text-red-400 transition-colors" />
                  <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Excel, Word, Text, Code, Images • Max 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.md,.json,.xml,.js,.ts,.py,.png,.jpg,.jpeg,.gif,.csv"
                    className="hidden"
                  />
                </div>

                {/* Analysis Type */}
                <div className="flex gap-2">
                  {[
                    { id: 'summary', label: 'Summary' },
                    { id: 'detailed', label: 'Detailed' },
                    { id: 'extract', label: 'Extract' },
                    { id: 'improve', label: 'Improve' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setAnalysisType(type.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        analysisType === type.id
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-800/60 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Selected File */}
                {selectedFile && (
                  <div className="p-3.5 rounded-xl bg-gray-800/40 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                          <FileImage className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFile(null)} 
                        className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Button
                      onClick={handleAnalyzeFile}
                      disabled={isAnalyzing}
                      className="w-full mt-3 bg-gradient-to-r from-red-500 to-rose-500 hover:opacity-90 text-white border-0"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" /> Analyze File
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="rounded-xl bg-gray-800/40 border border-gray-700/30 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 to-transparent border-b border-gray-700/30">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-white flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          {analysisResult.type}
                        </h4>
                        {analysisResult.aiPowered && (
                          <span className="px-2 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded-full">
                            AI Enhanced
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 space-y-3">
                      <p className="text-sm text-gray-300">{analysisResult.summary}</p>
                      
                      {analysisResult.details && (
                        <div className="text-xs space-y-2">
                          {Object.entries(analysisResult.details).map(([key, val]) => (
                            <div key={key} className="flex justify-between py-1.5 border-b border-gray-700/30 last:border-0">
                              <span className="text-gray-400 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}:
                              </span>
                              <span className="text-white font-medium">
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {analysisResult.aiInsights && (
                        <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20">
                          <p className="text-xs text-purple-300 font-medium mb-1">AI Insights:</p>
                          <p className="text-xs text-gray-300 whitespace-pre-wrap">{analysisResult.aiInsights}</p>
                        </div>
                      )}

                      {analysisResult.capabilities && (
                        <div className="pt-2 border-t border-gray-700/30">
                          <p className="text-xs text-gray-400 mb-2">Available actions:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {analysisResult.capabilities.map((cap: string, i: number) => (
                              <span key={i} className="px-2 py-1 text-[10px] bg-cyan-500/10 text-cyan-400 rounded">
                                {cap}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== TRANSLATOR ==================== */}
            {activeTool === 'translator' && (
              <div className="px-5 pb-5 space-y-4">
                {/* Language Selectors */}
                <div className="flex items-center gap-2">
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-gray-800/60 border border-gray-700/80 rounded-xl text-white text-sm focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {languageOptions.slice(0, 13).map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={swapLanguages}
                    className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-indigo-400 transition-colors"
                    title="Swap languages"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="flex-1 px-3 py-2.5 bg-gray-800/60 border border-gray-700/80 rounded-xl text-white text-sm focus:border-indigo-500 outline-none appearance-none cursor-pointer"
                  >
                    {languageOptions.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </select>
                </div>

                {/* Source Text */}
                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800/60 border border-gray-700/80 rounded-xl text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none transition-all"
                  autoFocus
                />

                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !translateText.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 hover:opacity-90 text-white border-0 h-11"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-2" /> Translate Now
                    </>
                  )}
                </Button>

                {/* Translation Result */}
                {translatedText && (
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-500/5 border-b border-indigo-500/20">
                      <span className="text-xs font-medium text-indigo-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Translation
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => copyToClipboard(translatedText, 'translation')}
                          className="p-1.5 rounded hover:bg-indigo-500/20 text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedItem === 'translation' ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button 
                          onClick={() => onInsertToChat(translatedText)}
                          className="px-2 py-1 text-xs text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/20 rounded transition-colors"
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                    <p className="px-4 py-3 text-sm text-white leading-relaxed">{translatedText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
