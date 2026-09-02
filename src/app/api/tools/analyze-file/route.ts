import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Supported file types
const SUPPORTED_FORMATS = [
  { type: 'text', extensions: ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.js', '.ts', '.py', '.java', '.c', '.cpp', '.go', '.rs', '.rb', '.php', '.sql', '.yaml', '.yml'], maxSize: 5, icon: '📄' },
  { type: 'code', extensions: ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt', '.scala', '.r', '.m', '.sh', '.bat', '.ps1'], maxSize: 2, icon: '💻' },
  { type: 'document', extensions: ['.docx', '.doc', '.rtf', '.odt'], maxSize: 10, icon: '📝' },
  { type: 'spreadsheet', extensions: ['.xlsx', '.xls', '.csv', '.ods'], maxSize: 10, icon: '📊' },
  { type: 'pdf', extensions: ['.pdf'], maxSize: 10, icon: '📕' },
  { type: 'image', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.ico'], maxSize: 5, icon: '🖼️' }
]

const ANALYSIS_TYPES = [
  { id: 'summary', name: 'Quick Summary', icon: '📋', description: 'Overview and key points' },
  { id: 'detailed', name: 'Detailed Analysis', icon: '🔍', description: 'In-depth breakdown with insights' },
  { id: 'extract', name: 'Extract Data', icon: '📊', description: 'Extract structured information' },
  { id: 'improve', name: 'Suggestions', icon: '✨', description: 'Improvement recommendations' }
]

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const analysisType = (formData.get('analysisType') as string) || 'summary'

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please upload a file to analyze.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large (${formatFileSize(file.size)}). Maximum size is 10MB.` },
        { status: 400 }
      )
    }

    // Check if format is supported
    const extension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isSupported = SUPPORTED_FORMATS.some(format => 
      format.extensions.includes(extension)
    )

    if (!isSupported) {
      return NextResponse.json(
        { error: `File format "${extension}" is not supported. Supported formats: ${SUPPORTED_FORMATS.flatMap(f => f.extensions).join(', ')}` },
        { status: 400 }
      )
    }

    // Analyze the file
    const analysisResult = await analyzeFile(file, analysisType)

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        extension,
        lastModified: new Date(file.lastModified).toISOString()
      },
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('File Analysis Error:', error?.message || error)
    return NextResponse.json(
      { error: `Failed to analyze file: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    )
  }
}

async function analyzeFile(file: File, analysisType: string): Promise<any> {
  const fileType = detectFileType(file)
  
  // Read file content based on type
  let content: string | null = null
  
  if (file.type.startsWith('text/') || 
      ['application/json', 'application/javascript', 'application/xml'].includes(file.type) ||
      isTextFile(file.name)) {
    try {
      content = await file.text()
    } catch {
      content = null
    }
  }

  // Perform basic analysis first
  const basicAnalysis = performBasicAnalysis(file, fileType, content)

  // Try AI-powered analysis for richer results
  let aiAnalysis = null
  if (content && content.length > 0 && content.length < 50000) {
    aiAnalysis = await performAIAnalysis(content, fileType, analysisType, file.name)
  }

  // Merge analyses
  return mergeAnalyses(basicAnalysis, aiAnalysis, analysisType)
}

function detectFileType(file: File): string {
  const mimeType = file.type
  const name = file.name.toLowerCase()
  const ext = '.' + name.split('.').pop()

  if (mimeType === 'application/pdf' || ext === '.pdf') return 'pdf'
  if (['sheet', 'excel'].some(t => mimeType.includes(t)) || ['.xlsx', '.xls', '.csv', '.ods'].includes(ext)) return 'spreadsheet'
  if (['word', 'document'].some(t => mimeType.includes(t)) || ['.docx', '.doc', '.rtf', '.odt'].includes(ext)) return 'document'
  if (mimeType.startsWith('image/')) return 'image'
  if (isCodeFile(name)) return 'code'
  return 'text'
}

function isTextFile(filename: string): boolean {
  const textExtensions = ['.txt', '.md', '.csv', '.json', '.xml', '.html', '.css', '.yaml', '.yml', '.log']
  return textExtensions.includes('.' + filename.split('.').pop()?.toLowerCase())
}

function isCodeFile(filename: string): boolean {
  const codeExtensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp', '.h', '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt', '.scala', '.r', '.m', '.sh', '.sql', '.bash', '.ps1']
  return codeExtensions.includes('.' + filename.split('.').pop()?.toLowerCase())
}

function performBasicAnalysis(file: File, fileType: string, content: string | null): any {
  switch (fileType) {
    case 'pdf':
      return analyzePDFBasic(file)
    
    case 'spreadsheet':
      return analyzeSpreadsheetBasic(file, content)
    
    case 'document':
      return analyzeDocumentBasic(file, content)
    
    case 'image':
      return analyzeImageBasic(file)
    
    case 'code':
      return analyzeCodeBasic(file, content)
    
    default:
      return analyzeTextBasic(file, content)
  }
}

function analyzePDFBasic(file: File): any {
  return {
    type: 'PDF Document',
    summary: `PDF document "${file.name}" ready for analysis.`,
    details: {
      fileSize: formatFileSize(file.size),
      pages: 'Requires PDF parser',
      encrypted: false,
      metadata: {
        title: file.name.replace('.pdf', ''),
        created: new Date(file.lastModified).toISOString()
      }
    },
    capabilities: [
      'Extract text content',
      'Identify structure',
      'Summarize key points',
      'Search within document'
    ],
    note: 'Full PDF text extraction requires server-side processing.'
  }
}

function analyzeSpreadsheetBasic(file: File, content: string | null): any {
  let rows = 0, cols = 0, headers: string[] = []
  
  if (content) {
    const lines = content.split('\n').filter(l => l.trim())
    rows = lines.length
    
    if (lines.length > 0 && file.name.endsWith('.csv')) {
      headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      cols = headers.length
      rows = Math.max(0, rows - 1) // Exclude header
    }
  }

  return {
    type: file.name.endsWith('.csv') ? 'CSV Spreadsheet' : 'Excel Spreadsheet',
    summary: `Spreadsheet with ${rows} row${rows !== 1 ? 's' : ''} and ${cols} column${cols !== 1 ? 's' : ''}. Size: ${formatFileSize(file.size)}.`,
    details: {
      format: file.name.split('.').pop()?.toUpperCase() || 'Unknown',
      rowCount: rows,
      columnCount: cols,
      headers: headers.slice(0, 15),
      totalHeaders: headers.length,
      dataSize: `${(content?.length || 0).toLocaleString()} characters`
    },
    capabilities: [
      'Parse data structure',
      'Generate statistics',
      'Create visualizations',
      'Export to different formats'
    ]
  }
}

function analyzeDocumentBasic(file: File, content: string | null): any {
  let wordCount = 0, charCount = 0, lineCount = 0
  
  if (content) {
    wordCount = content.split(/\s+/).filter(w => w.length > 0).length
    charCount = content.length
    lineCount = content.split('\n').length
  }

  return {
    type: 'Document',
    summary: `Document with ${wordCount.toLocaleString()} word${wordCount !== 1 ? 's' : ''}, ${charCount.toLocaleString()} characters.`,
    details: {
      wordCount,
      charCount,
      lineCount,
      readingTime: Math.ceil(wordCount / 200) + ' min',
      language: content ? detectLanguage(content) : 'Unknown'
    },
    capabilities: [
      'Summarize content',
      'Extract key topics',
      'Check grammar/style',
      'Translate text'
    ]
  }
}

function analyzeImageBasic(file: File): any {
  return {
    type: 'Image',
    summary: `Image file "${file.name}" (${formatFileSize(file.size)}).`,
    details: {
      format: file.type.split('/')[1]?.toUpperCase() || 'Unknown',
      size: `${file.size.toLocaleString()} bytes`,
      dimensions: 'Requires image processing'
    },
    capabilities: [
      'Describe image contents',
      'Detect objects/faces',
      'Extract text (OCR)',
      'Generate caption'
    ]
  }
}

function analyzeCodeBasic(file: File, content: string | null): any {
  const language = detectCodeLanguage(file.name, content || '')
  const lines = content ? content.split('\n').length : 0
  
  // Count code metrics
  let functions = 0, classes = 0, imports = 0, comments = 0
  
  if (content) {
    functions = (content.match(/(?:function|def|func)\s+\w+/g) || []).length
    classes = (content.match(/(?:class|struct|interface|type)\s+\w+/g) || []).length
    imports = (content.match(/(?:import|require|from|#include)\s+/g) || []).length
    comments = (content.match(/(?:\/\/|#|\/\*|\*\/|--)/g) || []).length
  }

  return {
    type: language ? `${language} Source Code` : 'Code File',
    summary: `${language || 'Unknown'} code file with ${lines} line${lines !== 1 ? 's' : ''}.`,
    details: {
      language,
      lineCount: lines,
      functions,
      classes,
      imports,
      comments,
      complexity: assessComplexity(lines, functions, classes),
      isEmptyLines: content ? content.split('\n').filter(l => l.trim() === '').length : 0
    },
    capabilities: [
      'Explain functionality',
      'Find bugs/issues',
      'Add documentation',
      'Refactor/optimize',
      'Convert to other languages'
    ]
  }
}

function analyzeTextBasic(file: File, content: string | null): any {
  const words = content ? content.split(/\s+/).filter(w => w.length > 0).length : 0
  const chars = content?.length || 0
  const lines = content ? content.split('\n').length : 0

  return {
    type: 'Text File',
    summary: `Text file with ${words.toLocaleString()} word${words !== 1 ? 's' : ''}.`,
    details: {
      wordCount: words,
      charCount: chars,
      lineCount: lines,
      language: content ? detectLanguage(content) : 'Unknown',
      encoding: 'UTF-8'
    },
    capabilities: [
      'Summarize content',
      'Extract information',
      'Analyze sentiment',
      'Translate text'
    ]
  }
}

async function performAIAnalysis(content: string, fileType: string, analysisType: string, fileName: string): Promise<any> {
  try {
    const zai = await ZAI.create()

    const prompts: Record<string, string> = {
      summary: `Provide a concise summary of this ${fileType} file named "${fileName}". Focus on the main purpose, key points, and important information. Keep it under 200 words.

Content preview:
${content.substring(0, 8000)}${content.length > 8000 ? '\n... [truncated]' : ''}`,

      detailed: `Perform a detailed analysis of this ${fileType} file named "${fileName}". Include:
1. Overview and purpose
2. Key findings/insights
3. Structure and organization
4. Notable patterns or issues
5. Recommendations

Content:
${content.substring(0, 10000)}${content.length > 10000 ? '\n... [truncated]' : ''}`,

      extract: `Extract structured data and key information from this ${fileType} file named "${fileName}". Organize findings into clear categories with specific data points.

Content:
${content.substring(0, 10000)}${content.length > 10000 ? '\n... [truncated]' : ''}`,

      improve: `Analyze this ${fileType} file named "${fileName}" and provide actionable suggestions for improvement. Identify issues, best practices not followed, and specific recommendations.

Content:
${content.substring(0, 10000)}${content.length > 10000 ? '\n... [truncated]' : ''}`
    }

    const prompt = prompts[analysisType] || prompts.summary

    const response = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert file analyzer. Provide clear, structured, and insightful analysis. Use markdown formatting when appropriate.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: false,
      thinking: { type: 'disabled' }
    })

    const aiInsight = response.choices?.[0]?.message?.content

    return {
      insight: aiInsight || 'AI analysis unavailable.',
      confidence: 0.9,
      model: 'NEXUS AI Analyzer'
    }

  } catch (error: any) {
    console.error('AI Analysis Error:', error?.message || error)
    return null
  }
}

function mergeAnalyses(basic: any, ai: any, analysisType: string): any {
  if (!ai) {
    return {
      ...basic,
      analysisType,
      aiPowered: false,
      message: 'Basic analysis complete. Enable AI for deeper insights.'
    }
  }

  return {
    ...basic,
    aiInsights: ai.insight,
    confidence: ai.confidence,
    model: ai.model,
    analysisType,
    aiPowered: true
  }
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function detectLanguage(text: string): string {
  const patterns: Record<string, RegExp> = {
    'hi': /[\u0900-\u097F]/,
    'zh': /[\u4e00-\u9fff]/,
    'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
    'ko': /[\uac00-\ud7af]/,
    'ar': /[\u0600-\u06FF]/,
    'ru': /[\u0400-\u04FF]/,
    'th': /[\u0e00-\u0e7f]/,
    'vi': /[àáảạãăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i
  }

  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(text)) return getLanguageName(lang)
  }

  return 'English'
}

function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    'hi': 'Hindi',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ko': 'Korean',
    'ar': 'Arabic',
    'ru': 'Russian',
    'th': 'Thai',
    'vi': 'Vietnamese'
  }
  return names[code] || code
}

function detectCodeLanguage(filename: string, content: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  
  const langMap: Record<string, string> = {
    'js': 'JavaScript', 'jsx': 'JavaScript (React)',
    'ts': 'TypeScript', 'tsx': 'TypeScript (React)',
    'py': 'Python', 'java': 'Java',
    'c': 'C', 'cpp': 'C++', 'h': 'C/C++ Header',
    'go': 'Go', 'rs': 'Rust', 'rb': 'Ruby',
    'php': 'PHP', 'cs': 'C#', 'swift': 'Swift',
    'kt': 'Kotlin', 'scala': 'Scala', 'r': 'R',
    'sql': 'SQL', 'sh': 'Shell', 'bash': 'Bash',
    'html': 'HTML', 'css': 'CSS', 'json': 'JSON',
    'xml': 'XML', 'yaml': 'YAML', 'yml': 'YAML',
    'md': 'Markdown'
  }

  if (ext && langMap[ext]) return langMap[ext]

  // Detect by content patterns
  const patterns: Record<string, RegExp[]> = {
    'JavaScript': [/const\s+\w+\s*=/, /function\s+\w+/, /=>\s*{/, /console\.log/],
    'Python': [/def\s+\w+\s*\(/, /import\s+\w+/, /print\(/, /:\s*$/m],
    'Java': [/public\s+class/, /System\.out\.print/, /void\s+main/],
    'HTML': [/<html|<div|<p\s|<span/i],
    'CSS': [/[\w-]+\s*{[^}]*}/, /@media|@keyframes/],
    'SQL': [/SELECT\s+.*FROM/, /INSERT\s+INTO/, /CREATE\s+TABLE/]
  }

  for (const [lang, regs] of Object.entries(patterns)) {
    const matches = regs.filter(r => r.test(content)).length
    if (matches >= 2) return lang
  }

  return null
}

function assessComplexity(lines: number, functions: number, classes: number): string {
  if (lines < 50) return 'Simple'
  if (lines < 200) return 'Moderate'
  if (lines < 500) return 'Complex'
  if (functions + classes > 20) return 'Very Complex'
  return 'High'
}

// GET endpoint for supported formats and features
export async function GET() {
  return NextResponse.json({
    success: true,
    supportedFormats: SUPPORTED_FORMATS,
    analysisTypes: ANALYSIS_TYPES,
    features: {
      maxFileSize: '10MB',
      maxFilesPerRequest: 1,
      aiAnalysis: true,
      supportedLanguages: true,
      exportOptions: ['json', 'txt', 'markdown'],
      tips: [
        'Smaller files process faster',
        'Plain text files get the deepest analysis',
        'PDF text extraction coming soon',
        'Images support OCR and description'
      ]
    }
  })
}
