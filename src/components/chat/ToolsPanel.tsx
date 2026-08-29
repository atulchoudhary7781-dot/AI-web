'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Search, Image, Mic, Code2, FileText, Languages, 
  X, Send, Loader2, Copy, Check, Download,
  Play, Square, Volume2, VolumeX, Upload,
  ExternalLink, ChevronDown, ChevronUp, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ToolsPanelProps {
  isOpen: boolean
  onClose: () => void
  onInsertToChat: (text: string) => void
}

type ToolType = 'web-search' | 'image-gen' | 'voice-chat' | 'code-executor' | 'file-analyzer' | 'translator' | null

export default function ToolsPanel({ isOpen, onClose, onInsertToChat }: ToolsPanelProps) {
  const [activeTool, setActiveTool] = useState<ToolType>(null)
  
  // Tool states
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageSize, setImageSize] = useState('1024x1024')
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  
  const [voiceText, setVoiceText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  
  const [code, setCode] = useState('')
  const [codeLanguage, setCodeLanguage] = useState('javascript')
  const [codeOutput, setCodeOutput] = useState<string>('')
  const [codeError, setCodeError] = useState<string>('')
  const [isRunningCode, setIsRunningCode] = useState(false)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const [translateText, setTranslateText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('hi')
  const [translatedText, setTranslatedText] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  // Reset states when tool changes
  useEffect(() => {
    setActiveTool(null)
    setSearchResults([])
    setGeneratedImage(null)
    setCodeOutput('')
    setCodeError('')
    setAnalysisResult(null)
    setTranslatedText('')
  }, [])

  if (!isOpen) return null

  // Tool handlers
  const handleWebSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const response = await fetch('/api/tools/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, numResults: 5 })
      })
      const data = await response.json()
      
      if (data.success) {
        setSearchResults(data.results)
      }
    } catch (error) {
      console.error('Search error:', error)
    }
    setIsSearching(false)
  }

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return
    
    setIsGeneratingImage(true)
    try {
      const response = await fetch('/api/tools/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: imagePrompt, size: imageSize })
      })
      const data = await response.json()
      
      if (data.success && data.image) {
        setGeneratedImage(data.image.base64 || data.image.url)
      }
    } catch (error) {
      console.error('Image generation error:', error)
    }
    setIsGeneratingImage(false)
  }

  const toggleRecording = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorderRef.current = new MediaRecorder(stream)
        const chunks: Blob[] = []
        
        mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data)
        mediaRecorderRef.current.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          
          // Send to STT API
          try {
            const formData = new FormData()
            formData.append('audioData', blob)
            
            const response = await fetch('/api/tools/voice-chat', {
              method: 'POST',
              body: JSON.stringify({ action: 'stt', audioData: await blob.arrayBuffer() }),
              headers: { 'Content-Type': 'application/json' }
            })
            const data = await response.json()
            
            if (data.success && data.text) {
              setVoiceText(prev => prev + (prev ? ' ' : '') + data.text.replace(/\[.*?\]/g, '').trim())
            }
          } catch (error) {
            console.error('STT error:', error)
          }
          
          stream.getTracks().forEach(track => track.stop())
        }
        
        mediaRecorderRef.current.start()
        setIsRecording(true)
      } catch (error) {
        console.error('Microphone access denied:', error)
        alert('Microphone access is required for voice input.')
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    }
  }

  const handleSpeak = async () => {
    if (!voiceText.trim() || isSpeaking) return
    
    setIsSpeaking(true)
    try {
      const response = await fetch('/api/tools/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'tts', text: voiceText, voice: selectedVoice })
      })
      const data = await response.json()
      
      if (data.success && data.audioUrl) {
        // Play audio
        const audio = new Audio(data.audioUrl)
        audio.onended = () => setIsSpeaking(false)
        audio.play()
      } else {
        setTimeout(() => setIsSpeaking(false), 2000)
      }
    } catch (error) {
      console.error('TTS error:', error)
      setIsSpeaking(false)
    }
  }

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
      setCodeError('Failed to execute code')
    }
    
    setIsRunningCode(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  const handleAnalyzeFile = async () => {
    if (!selectedFile) return
    
    setIsAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('analysisType', 'summary')
      
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
    }
    setIsAnalyzing(false)
  }

  const handleTranslate = async () => {
    if (!translateText.trim()) return
    
    setIsTranslating(true)
    try {
      const response = await fetch('/api/tools/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: translateText, sourceLang, targetLang })
      })
      const data = await response.json()
      
      if (data.success) {
        setTranslatedText(data.translatedText)
      }
    } catch (error) {
      console.error('Translation error:', error)
    }
    setIsTranslating(false)
  }

  const tools = [
    { id: 'web-search', icon: Search, label: 'Web Search', color: 'from-blue-500 to-cyan-500', description: 'Search the internet' },
    { id: 'image-gen', icon: Image, label: 'AI Images', color: 'from-purple-500 to-pink-500', description: 'Generate images' },
    { id: 'voice-chat', icon: Mic, label: 'Voice Chat', color: 'from-green-500 to-emerald-500', description: 'Speak & listen' },
    { id: 'code-executor', icon: Code2, label: 'Code Runner', color: 'from-orange-500 to-yellow-500', description: 'Execute code' },
    { id: 'file-analyzer', icon: FileText, label: 'File Analyzer', color: 'from-red-500 to-rose-500', description: 'Analyze files' },
    { id: 'translator', icon: Languages, label: 'Translator', color: 'from-indigo-500 to-violet-500', description: 'Translate text' }
  ]

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-900/95">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">AI Tools</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {!activeTool ? (
          /* Tool Selection Grid */
          <div className="p-4 overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id as ToolType)}
                  className="group p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-500/30 transition-all duration-200 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{tool.label}</h3>
                  <p className="text-xs text-gray-400">{tool.description}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Active Tool Panel */
          <div className="flex-1 overflow-y-auto">
            {/* Back Button */}
            <button
              onClick={() => setActiveTool(null)}
              className="mx-4 mt-3 mb-2 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Back to tools
            </button>

            {/* Web Search */}
            {activeTool === 'web-search' && (
              <div className="px-4 pb-4 space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleWebSearch()}
                    placeholder="Search the web..."
                    className="w-full px-4 py-3 pl-11 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 outline-none"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Button
                    onClick={handleWebSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">{searchResults.length} results found</p>
                    {searchResults.map((result, i) => (
                      <a
                        key={i}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-cyan-500/30 transition-all group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white group-hover:text-cyan-400 truncate">{result.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{result.snippet}</p>
                            <span className="text-xs text-cyan-500/70 mt-1 inline-block">{result.source}</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 flex-shrink-0 mt-1" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Image Generation */}
            {activeTool === 'image-gen' && (
              <div className="px-4 pb-4 space-y-4">
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the image you want to generate..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 outline-none resize-none"
                />
                
                <div className="flex gap-2">
                  {['512x512', '1024x1024', '1024x1792'].map(size => (
                    <button
                      key={size}
                      onClick={() => setImageSize(size)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        imageSize === size
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {size.split('x')[0]}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Image className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {generatedImage && (
                  <div className="mt-4">
                    <img src={generatedImage} alt="Generated" className="w-full rounded-xl" />
                    <div className="flex gap-2 mt-3">
                      <Button variant="outline" size="sm" className="flex-1">
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

            {/* Voice Chat */}
            {activeTool === 'voice-chat' && (
              <div className="px-4 pb-4 space-y-4">
                <textarea
                  value={voiceText}
                  onChange={(e) => setVoiceText(e.target.value)}
                  placeholder="Type or speak your message..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 outline-none resize-none"
                />

                <div className="flex gap-2">
                  <Button
                    onClick={toggleRecording}
                    variant={isRecording ? "destructive" : "outline"}
                    className={`flex-1 ${isRecording ? 'animate-pulse' : ''}`}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4 mr-2" /> Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 mr-2" /> Start Speaking
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleSpeak}
                    disabled={!voiceText.trim() || isSpeaking}
                    variant="outline"
                    className="flex-1"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 mr-2" /> Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 mr-2" /> Speak Aloud
                      </>
                    )}
                  </Button>
                </div>

                <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                  <label className="text-xs text-gray-400 block mb-2">Select Voice:</label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="alloy">Alloy (Neutral)</option>
                    <option value="echo">Echo (Male)</option>
                    <option value="fable">Fable (Warm)</option>
                    <option value="nova">Nova (Female)</option>
                    <option value="shimmer">Shimmer (Soft)</option>
                  </select>
                </div>

                <Button 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500"
                  onClick={() => onInsertToChat(voiceText)}
                  disabled={!voiceText.trim()}
                >
                  <Send className="w-4 h-4 mr-2" /> Send to Chat
                </Button>
              </div>
            )}

            {/* Code Executor */}
            {activeTool === 'code-executor' && (
              <div className="px-4 pb-4 space-y-4">
                <div className="flex gap-2">
                  {['javascript', 'python', 'html', 'json'].map(lang => (
                    <button
                      key={lang}
                      onClick={() => setCodeLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                        codeLanguage === lang
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {lang.toUpperCase().slice(0, 3)}
                    </button>
                  ))}
                </div>

                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// Write your ${codeLanguage} code here...\nconsole.log("Hello, World!");`}
                  rows={8}
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-700 rounded-xl text-green-400 placeholder:text-gray-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 outline-none resize-none font-mono text-sm"
                />

                <Button
                  onClick={handleRunCode}
                  disabled={isRunningCode || !code.trim()}
                  className="w-full bg-gradient-to-r from-orange-500 to-yellow-500"
                >
                  {isRunningCode ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" /> Run Code
                    </>
                  )}
                </Button>

                {(codeOutput || codeError) && (
                  <div className={`rounded-lg p-3 ${codeError ? 'bg-red-500/10 border border-red-500/30' : 'bg-gray-800/50 border border-gray-700/50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium ${codeError ? 'text-red-400' : 'text-green-400'}`}>
                        {codeError ? '⚠ Error' : '✓ Output'}
                      </span>
                      <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                    </div>
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono max-h-40 overflow-auto">
                      {codeError || codeOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* File Analyzer */}
            {activeTool === 'file-analyzer' && (
              <div className="px-4 pb-4 space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-700 hover:border-red-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
                >
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-500" />
                  <p className="text-sm text-gray-400">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, Excel, Word, Text, Code, Images (max 10MB)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.xlsx,.xls,.doc,.docx,.txt,.md,.json,.xml,.js,.ts,.py,.png,.jpg,.jpeg,.gif,.csv"
                    className="hidden"
                  />
                </div>

                {selectedFile && (
                  <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-400" />
                        <span className="text-sm text-white">{selectedFile.name}</span>
                        <span className="text-xs text-gray-500">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-red-400">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Button
                      onClick={handleAnalyzeFile}
                      disabled={isAnalyzing}
                      className="w-full mt-3 bg-gradient-to-r from-red-500 to-rose-500"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" /> Analyze File
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {analysisResult && (
                  <div className="rounded-lg bg-gray-800/50 border border-gray-700/50 p-4 space-y-3">
                    <h4 className="font-medium text-white">{analysisResult.type}</h4>
                    <p className="text-sm text-gray-300">{analysisResult.summary}</p>
                    
                    {analysisResult.details && (
                      <div className="text-xs text-gray-400 space-y-1">
                        {Object.entries(analysisResult.details).map(([key, val]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                            <span>{typeof val === 'object' ? JSON.stringify(val) : String(val)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {analysisResult.suggestions && (
                      <div className="pt-2 border-t border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Suggestions:</p>
                        <ul className="list-disc list-inside text-xs text-cyan-400 space-y-1">
                          {analysisResult.suggestions.map((suggestion: string, i: number) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Translator */}
            {activeTool === 'translator' && (
              <div className="px-4 pb-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="auto">Auto Detect</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                  </select>
                  
                  <select
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="zh">Chinese</option>
                    <option value="ar">Arabic</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>

                <textarea
                  value={translateText}
                  onChange={(e) => setTranslateText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 outline-none resize-none"
                />

                <Button
                  onClick={handleTranslate}
                  disabled={isTranslating || !translateText.trim()}
                  className="w-full bg-gradient-to-r from-indigo-500 to-violet-500"
                >
                  {isTranslating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="w-4 h-4 mr-2" /> Translate
                    </>
                  )}
                </Button>

                {translatedText && (
                  <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/30 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-indigo-400">Translation</span>
                      <div className="flex gap-2">
                        <Copy className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
                        <button 
                          onClick={() => onInsertToChat(translatedText)}
                          className="text-xs text-indigo-400 hover:text-indigo-300"
                        >
                          Insert
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-white">{translatedText}</p>
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
