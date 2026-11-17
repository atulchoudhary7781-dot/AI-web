import { fileExtension, isTextLikeFile } from '@/lib/fileTypes'

const MAX_CHARS = 16000

function clip(text: string, extra = ''): string {
  const clean = text.replace(/\u0000/g, '').trim()
  if (!clean) return extra
  if (clean.length <= MAX_CHARS) return extra ? `${extra}\n\n${clean}` : clean
  return `${extra ? extra + '\n\n' : ''}${clean.slice(0, MAX_CHARS)}\n\n[File truncated — first ${MAX_CHARS} characters shown]`
}

function stripXml(xml: string): string {
  return xml
    .replace(/<\/(w:p|a:p|text:p|p)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function looksLikeText(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 4096))
  if (sample.length === 0) return false
  let weird = 0
  for (const byte of sample) {
    if (byte === 0) return false
    if (byte < 9 || (byte > 13 && byte < 32) || byte === 127) weird++
  }
  return weird / sample.length < 0.12
}

async function extractZipText(buf: Buffer, ext: string): Promise<string> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(buf)

  if (ext === 'docx') {
    const xml = await zip.file('word/document.xml')?.async('string')
    return xml ? stripXml(xml) : ''
  }

  if (ext === 'pptx') {
    const slides = Object.keys(zip.files)
      .filter((n) => /^ppt\/slides\/slide\d+\.xml$/i.test(n))
      .sort()
    const parts: string[] = []
    for (const name of slides.slice(0, 30)) {
      const xml = await zip.file(name)?.async('string')
      if (!xml) continue
      const text = stripXml(xml)
      if (text) parts.push(`Slide ${parts.length + 1}:\n${text}`)
    }
    return parts.join('\n\n')
  }

  if (ext === 'odt' || ext === 'odp' || ext === 'ods') {
    const xml = await zip.file('content.xml')?.async('string')
    return xml ? stripXml(xml) : ''
  }

  const names = Object.keys(zip.files).filter((n) => !zip.files[n].dir).slice(0, 80)
  const listing = names.map((n) => `- ${n}`).join('\n')
  const texts: string[] = [`Archive contents:\n${listing}`]
  for (const name of names.slice(0, 20)) {
    if (!isTextLikeFile(name)) continue
    const inner = await zip.file(name)?.async('nodebuffer')
    if (!inner || inner.length > 400_000 || !looksLikeText(inner)) continue
    texts.push(`### ${name}\n${inner.toString('utf8').slice(0, 4000)}`)
  }
  return texts.join('\n\n')
}

async function extractPdf(buf: Buffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import('unpdf')
  const pdf = await getDocumentProxy(new Uint8Array(buf))
  const result = await extractText(pdf, { mergePages: true })
  if (typeof result === 'string') return result
  if (Array.isArray((result as { text?: unknown }).text)) {
    return ((result as { text: string[] }).text).join('\n')
  }
  return String((result as { text?: unknown }).text || result || '')
}

async function extractSpreadsheet(buf: Buffer): Promise<string> {
  const XLSX = await import('xlsx')
  const workbook = XLSX.read(buf, { type: 'buffer' })
  const sheets = workbook.SheetNames.slice(0, 8).map((name) => {
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[name] || {})
    return `## Sheet: ${name}\n${csv}`
  })
  return sheets.join('\n\n')
}

function extractRtf(raw: string): string {
  return raw
    .replace(/\\'[0-9a-fA-F]{2}/g, ' ')
    .replace(/\\[a-zA-Z]+-?\d* ?/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function extractFileContent(params: {
  fileName: string
  fileType?: string | null
  base64: string
}): Promise<{ text: string; note?: string }> {
  const { fileName } = params
  const ext = fileExtension(fileName)
  const buf = Buffer.from(params.base64, 'base64')
  if (!buf.length) return { text: '', note: 'File was empty.' }

  try {
    if (ext === 'pdf') {
      return { text: clip(await extractPdf(buf), `PDF: ${fileName}`) }
    }
    if (['xlsx', 'xls', 'xlsm', 'xlsb', 'ods', 'csv', 'tsv'].includes(ext)) {
      if (ext === 'csv' || ext === 'tsv') {
        return { text: clip(buf.toString('utf8'), `Spreadsheet: ${fileName}`) }
      }
      return { text: clip(await extractSpreadsheet(buf), `Spreadsheet: ${fileName}`) }
    }
    if (['docx', 'pptx', 'odt', 'odp', 'ods', 'zip'].includes(ext)) {
      return { text: clip(await extractZipText(buf, ext), `Document: ${fileName}`) }
    }
    if (ext === 'rtf') {
      return { text: clip(extractRtf(buf.toString('utf8')), `RTF: ${fileName}`) }
    }
    if (ext === 'ipynb' || ext === 'json' || ext === 'jsonl') {
      return { text: clip(buf.toString('utf8'), `JSON: ${fileName}`) }
    }
    if (isTextLikeFile(fileName, params.fileType || '') || looksLikeText(buf)) {
      return { text: clip(buf.toString('utf8'), `File: ${fileName}`) }
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'parse error'
    console.error('extractFileContent failed:', fileName, reason)
    if (looksLikeText(buf)) {
      return { text: clip(buf.toString('utf8'), `File: ${fileName}`) }
    }
    return {
      text: '',
      note: `Could not extract text from ${fileName} (${reason}).`,
    }
  }

  return {
    text: '',
    note: `${fileName} looks like a binary file (${Math.round(buf.length / 1024)} KB). I can still discuss the filename/type, but there is no readable text to analyze.`,
  }
}
