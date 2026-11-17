export const TEXT_EXTENSIONS = new Set([
  'txt', 'md', 'markdown', 'csv', 'tsv', 'json', 'jsonl', 'xml', 'html', 'htm',
  'css', 'scss', 'less', 'js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'py', 'java',
  'c', 'cc', 'cpp', 'h', 'hpp', 'cs', 'go', 'rs', 'rb', 'php', 'swift', 'kt',
  'kts', 'scala', 'r', 'm', 'sh', 'bash', 'zsh', 'ps1', 'bat', 'sql', 'yml',
  'yaml', 'toml', 'ini', 'env', 'log', 'cfg', 'conf', 'properties', 'vue',
  'svelte', 'astro', 'graphql', 'gql', 'proto', 'dart', 'lua', 'pl', 'tex',
  'rtf', 'svg', 'gitignore', 'dockerfile', 'makefile', 'editorconfig', 'map',
  'lock', 'gradle', 'cmake', 'diff', 'patch', 'ipynb', 'rst', 'adoc', 'org',
])

export const IMAGE_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp',
])

export function fileExtension(name: string): string {
  const base = name.split(/[/\\]/).pop() || name
  const i = base.lastIndexOf('.')
  return i > 0 ? base.slice(i + 1).toLowerCase() : ''
}

export function isTextLikeFile(name: string, mime = ''): boolean {
  const ext = fileExtension(name)
  if (ext && TEXT_EXTENSIONS.has(ext)) return true
  if (mime.startsWith('text/')) return true
  return [
    'application/json',
    'application/xml',
    'application/javascript',
    'application/typescript',
    'application/x-yaml',
    'application/yaml',
  ].includes(mime)
}

export function isImageFile(name: string, mime = ''): boolean {
  const ext = fileExtension(name)
  if (IMAGE_EXTENSIONS.has(ext)) return true
  return ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/bmp'].includes(mime)
}
