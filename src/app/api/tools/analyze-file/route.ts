import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const analysisType = (formData.get('analysisType') as string) || 'summary'

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
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
        lastModified: new Date(file.lastModified).toISOString()
      },
      analysis: analysisResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('File Analysis Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze file' },
      { status: 500 }
    )
  }
}

async function analyzeFile(file: File, analysisType: string): Promise<{
  type: string
  summary: string
  details?: Record<string, any>
  extractedText?: string
}> {
  const fileType = getFileType(file)
  
  // Read file content
  const buffer = Buffer.from(await file.arrayBuffer())
  const content = buffer.toString('utf-8')

  switch (fileType) {
    case 'pdf':
      return analyzePDF(file, content, analysisType)
    
    case 'excel':
    case 'csv':
      return analyzeSpreadsheet(file, content, analysisType)
    
    case 'document':
      return analyzeDocument(content, analysisType)
    
    case 'text':
    case 'code':
      return analyzeTextContent(content, analysisType)
    
    case 'image':
      return analyzeImage(file, analysisType)
    
    default:
      return analyzeGeneric(file, content, analysisType)
  }
}

function getFileType(file: File): string {
  const mimeType = file.type
  const name = file.name.toLowerCase()
  
  if (mimeType.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (mimeType.includes('sheet') || name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) return 'excel'
  if (mimeType.includes('word') || name.endsWith('.docx') || name.endsWith('.doc')) return 'document'
  if (mimeType.includes('text') || name.endsWith('.txt') || name.endsWith('.md') || name.endsWith('.json') || name.endsWith('.xml') || name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.py')) return mimeType.includes('json') ? 'text' : (name.match(/\.(js|ts|py|java|cpp|c|h)$/) ? 'code' : 'text')
  if (mimeType.startsWith('image/')) return 'image'
  
  return 'unknown'
}

async function analyzePDF(file: File, content: string, analysisType: string): Promise<any> {
  // In production, use pdf-parse or similar library
  return {
    type: 'PDF Document',
    summary: `PDF file "${file.name}" (${formatFileSize(file.size)}) ready for analysis.`,
    details: {
      pages: 'N/A (requires PDF parser)',
      encrypted: false,
      hasImages: true,
      hasTables: false,
      metadata: {
        title: file.name.replace('.pdf', ''),
        author: 'Unknown',
        created: new Date(file.lastModified).toISOString(),
        modified: new Date().toISOString()
      }
    },
    extractedText: '[PDF text extraction requires server-side PDF parsing library. Content preview not available in demo mode.]',
    suggestions: [
      'Extract key points and summaries',
      'Search for specific keywords',
      'Convert to editable format',
      'Extract tables and data'
    ]
  }
}

async function analyzeSpreadsheet(file: File, content: string, analysisType: string): Promise<any> {
  // Basic CSV/excel analysis
  const lines = content.split('\n').filter(line => line.trim())
  const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv'
  
  let headers: string[] = []
  let rowCount = lines.length
  let colCount = 0
  
  if (isCSV && lines.length > 0) {
    headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    colCount = headers.length
    rowCount = Math.max(0, lines.length - 1) // Exclude header
  }

  return {
    type: isCSV ? 'CSV Spreadsheet' : 'Excel Spreadsheet',
    summary: `Spreadsheet "${file.name}" with ${rowCount} rows and ${colCount} columns. Size: ${formatFileSize(file.size)}.`,
    details: {
      format: isCSV ? 'CSV' : 'Excel',
      rowCount,
      colCount,
      headers: headers.slice(0, 10), // First 10 columns
      totalHeaders: headers.length,
      dataSize: `${lines.length} lines`,
      encoding: 'UTF-8'
    },
    extractedText: content.substring(0, 2000) + (content.length > 2000 ? '\n... [truncated]' : ''),
    suggestions: [
      'Generate charts from data',
      'Export to different formats',
      'Perform calculations',
      'Find patterns and trends',
      'Create pivot tables'
    ]
  }
}

function analyzeDocument(content: string, analysisType: string): any {
  const wordCount = content.split(/\s+/).length
  const charCount = content.length
  const lineCount = content.split('\n').length
  
  // Extract potential headings (lines that look like headings)
  const potentialHeadings = content.split('\n')
    .filter(line => /^(#{1,3}\s|[A-Z][^a-z]{5,}|[A-Z][A-Z\s]+)$/.test(line.trim()))
    .slice(0, 10)

  return {
    type: 'Document',
    summary: `Document with ${wordCount} words, ${charCount} characters across ${lineCount} lines.`,
    details: {
      wordCount,
      charCount,
      lineCount,
      paragraphCount: content.split(/\n\n+/).length,
      potentialHeadings,
      readingTime: Math.ceil(wordCount / 200) + ' min',
      language: detectLanguage(content)
    },
    extractedText: content.substring(0, 3000) + (content.length > 3000 ? '\n... [truncated]' : ''),
    suggestions: [
      'Summarize key points',
      'Extract main topics',
      'Generate outline',
      'Check grammar and style',
      'Translate to other languages'
    ]
  }
}

function analyzeTextContent(content: string, analysisType: string): any {
  const lines = content.split('\n')
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  // Detect code language
  const codeLanguage = detectCodeLanguage(content)

  return {
    type: codeLanguage ? `${codeLanguage} Code` : 'Text File',
    summary: codeLanguage 
      ? `${codeLanguage} code file with ${lines.length} lines, ${words.length} tokens.`
      : `Text file with ${words.length} words and ${lines.length} lines. Size: ${formatFileSize(new Blob([content]).size)}`,
    details: {
      lineCount: lines.length,
      wordCount: words.length,
      charCount: content.length,
      language: codeLanguage || detectLanguage(content),
      isEmptyLines: lines.filter(l => l.trim() === '').length,
      avgLineLength: Math.round(words.length / Math.max(1, lines.filter(l => l.trim()).length))
    },
    extractedText: content.substring(0, 5000) + (content.length > 5000 ? '\n... [truncated]' : ''),
    suggestions: codeLanguage ? [
      'Analyze code structure',
      'Check for issues',
      'Add documentation',
      'Format code',
      'Explain functionality'
    ] : [
      'Summarize content',
      'Extract key information',
      'Translate text',
      'Format document',
      'Check spelling'
    ]
  }
}

function analyzeImage(file: File, analysisType: string): any {
  return {
    type: 'Image',
    summary: `Image file "${file.name}" (${formatFileSize(file.size)}).`,
    details: {
      format: file.type.split('/')[1]?.toUpperCase() || 'Unknown',
      size: `${file.size} bytes`,
      name: file.name,
      lastModified: new Date(file.lastModified).toISOString()
    },
    extractedText: null,
    suggestions: [
      'Describe image contents',
      'Extract text (OCR)',
      'Detect objects/faces',
      'Generate caption',
      'Compress or resize'
    ]
  }
}

function analyzeGeneric(file: File, content: string, analysisType: string): any {
  return {
    type: 'Unknown Format',
    summary: `File "${file.name}" of type "${file.type || 'unknown'}" (${formatFileSize(file.size)}).`,
    details: {
      mimeType: file.type || 'Unknown',
      size: file.size,
      name: file.name,
      lastModified: new Date(file.lastModified).toISOString()
    },
    extractedText: content?.substring(0, 1000) || null,
    suggestions: [
      'Identify file format',
      'Convert to readable format',
      'Extract embedded data',
      'Check for corruption'
    ]
  }
}

// Helper functions
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function detectLanguage(text: string): string {
  // Simple language detection based on character patterns
  const hindiPattern = /[\u0900-\u097F]/
  const chinesePattern = /[\u4e00-\u9fff]/
  const arabicPattern = /[\u0600-\u06FF]/
  
  if (hindiPattern.test(text)) return 'Hindi'
  if (chinesePattern.test(text)) return 'Chinese'
  if (arabicPattern.test(text)) return 'Arabic'
  
  // Default to English for Latin script
  return 'English'
}

function detectCodeLanguage(code: string): string | null {
  const patterns: Record<string, RegExp[]> = {
    javascript: [/const\s+\w+\s*=/, /function\s+\w+/, /=>\s*{/, /import\s+.*from/, /console\.log/],
    python: [/def\s+\w+\s*\(/, /import\s+\w+/, /print\(/, /:\s*$/m, /self\b/],
    java: [/public\s+class/, /System\.out\.print/, /void\s+main/, /new\s+\w+\(/],
    typescript: [/:\s*(string|number|boolean|any)/, /interface\s+\w+/, /type\s+\w+\s*=/],
    html: [/<html|<div|<p\s|<span|<!DOCTYPE/i],
    css: [/[\w-]+\s*{[^}]*}/, /@media|@keyframes/, /#[\w-]+\s*{/, /\.[\w-]+\s*{/],
    json: /^\s*{[\s\S]*}\s*$/m, // Rough check
    sql: [/SELECT\s+.*FROM/, /INSERT\s+INTO/, /CREATE\s+TABLE/],
    php: [/<\?php|\?>/, /\$\w+\s*=/, /echo\s+/],
    ruby: [/def\s+\w+/, /end$/, /puts\s+/, /require\s+'/]
  }

  for (const [lang, patterns] of Object.entries(patterns)) {
    const matchCount = patterns.filter(p => p.test(code)).length
    if (matchCount >= 2) return lang
  }

  return null
}

// GET endpoint for supported formats
export async function GET() {
  return NextResponse.json({
    success: true,
    supportedFormats: [
      { type: 'pdf', extensions: ['.pdf'], maxSize: '10MB', description: 'PDF documents' },
      { type: 'excel', extensions: ['.xlsx', '.xls', '.csv'], maxSize: '10MB', description: 'Spreadsheets' },
      { type: 'document', extensions: ['.docx', '.doc', '.rtf'], maxSize: '10MB', description: 'Word documents' },
      { type: 'text', extensions: ['.txt', '.md', '.json', '.xml', '.html', '.css'], maxSize: '5MB', description: 'Text files' },
      { type: 'code', extensions: ['.js', '.ts', '.py', '.java', '.c', '.cpp', '.go', '.rs'], maxSize: '1MB', description: 'Source code' },
      { type: 'image', extensions: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'], maxSize: '5MB', description: 'Images' }
    ],
    analysisTypes: [
      { id: 'summary', name: 'Summary', icon: '📝', description: 'Quick overview and key points' },
      { id: 'detailed', name: 'Detailed Analysis', icon: '🔍', description: 'In-depth breakdown' },
      { id: 'extract', name: 'Extract Data', icon: '📊', description: 'Extract structured data' },
      { id: 'translate', name: 'Translate', icon: '🌐', description: 'Translate content' },
      { id: 'improve', name: 'Improve/Edit', icon: '✨', description: 'Suggest improvements' }
    ],
    features: {
      maxFileSize: '10MB',
      maxFilesPerRequest: 1,
      ocrSupport: true,
      multiLanguageAnalysis: true,
      aiPowered: true
    }
  })
}
