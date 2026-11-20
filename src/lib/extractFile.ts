import { inflateRawSync, inflateSync } from 'zlib'
import { fileExtension, isTextLikeFile } from '@/lib/fileTypes'

const MAX_CHARS = 10000

function clip(text: string, extra = ''): string {
  const clean = readable(text)
  if (!clean) return ''
  const body = extra ? `${extra}\n\n${clean}` : clean
  if (body.length <= MAX_CHARS) return body
  return `${body.slice(0, MAX_CHARS)}\n\n[File truncated — first ${MAX_CHARS} characters shown]`
}

function readable(text: string): string {
  return text
    .replace(/\u0000/g, '')
    .replace(/[^\x09\x0A\x0D\x20-\x7E\u00A0-\uFFFF]/g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
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

function decodePdfLiteral(raw: string): string {
  return raw
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\(\d{1,3})/g, (_, oct: string) => String.fromCharCode(parseInt(oct, 8)))
}

function literalsFrom(src: string): string[] {
  const out: string[] = []
  const tj = /\((?:\\.|[^\\)])*\)\s*Tj/g
  let match: RegExpExecArray | null
  while ((match = tj.exec(src))) {
    const inner = match[0].slice(1, match[0].lastIndexOf(')'))
    out.push(decodePdfLiteral(inner))
  }
  const tjArray = /\[([\s\S]*?)\]\s*TJ/g
  while ((match = tjArray.exec(src))) {
    const parts = [...match[1].matchAll(/\((?:\\.|[^\\)])*\)/g)]
    out.push(parts.map((p) => decodePdfLiteral(p[0].slice(1, -1))).join(''))
  }
  return out
}

function extractPdfLite(buf: Buffer): string {
  const latin = buf.toString('latin1')
  const bits: string[] = [...literalsFrom(latin)]

  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g
  let match: RegExpExecArray | null
  while ((match = streamRe.exec(latin))) {
    const raw = Buffer.from(match[1], 'latin1')
    for (const unzip of [inflateSync, inflateRawSync]) {
      try {
        const out = unzip(raw)
        const inflated = out.toString('latin1')
        bits.push(...literalsFrom(inflated))
        const utf = out.toString('utf8')
        if (/[A-Za-z]{4,}/.test(utf) && !utf.includes('\u0000')) {
          bits.push(utf)
        }
        break
      } catch {
        /* try the other inflater */
      }
    }
  }

  return readable(bits.join('\n'))
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
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
  const lite = extractPdfLite(buf)
  if (lite.replace(/\s/g, '').length > 60) return lite

  try {
    const { extractText } = await import('unpdf')
    const result = await withTimeout(
      extractText(new Uint8Array(buf), { mergePages: true }),
      8000,
      'PDF parser',
    )
    const text = readable(result.text || '')
    if (text) return text
  } catch (error) {
    console.error('unpdf failed:', error instanceof Error ? error.message : error)
  }

  return lite
}

async function extractSpreadsheet(buf: Buffer): Promise<string> {
  const mod: any = await import('exceljs')
  const ExcelJS = mod.default ?? mod
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buf)
  const sheets: string[] = []
  workbook.eachSheet((sheet) => {
    if (sheets.length >= 8) return
    const rows: string[] = []
    sheet.eachRow((row) => {
      const values = Array.isArray(row.values) ? row.values.slice(1) : []
      rows.push(values.map((value) => (value == null ? '' : String(value))).join(','))
    })
    sheets.push(`## Sheet: ${sheet.name}\n${rows.join('\n')}`)
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
      const text = clip(await extractPdf(buf), `PDF: ${fileName}`)
      if (!text.replace(`PDF: ${fileName}`, '').trim()) {
        return {
          text: '',
          note: `${fileName} looks like a scanned/image PDF with no copyable text. Upload a screenshot or export it as a text PDF.`,
        }
      }
      return { text }
    }
    if (['xlsx', 'xls', 'xlsm', 'xlsb', 'ods', 'csv', 'tsv'].includes(ext)) {
      if (ext === 'csv' || ext === 'tsv') {
        return { text: clip(buf.toString('utf8'), `Spreadsheet: ${fileName}`) }
      }
      if (ext === 'ods') {
        return { text: clip(await extractZipText(buf, ext), `Spreadsheet: ${fileName}`) }
      }
      try {
        return { text: clip(await extractSpreadsheet(buf), `Spreadsheet: ${fileName}`) }
      } catch (error) {
        console.error('exceljs failed:', error instanceof Error ? error.message : error)
        if (ext === 'xls' || ext === 'xlsb') {
          return {
            text: '',
            note: `${fileName} could not be parsed as Excel. Save it as .xlsx and attach again.`,
          }
        }
        throw error
      }
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
