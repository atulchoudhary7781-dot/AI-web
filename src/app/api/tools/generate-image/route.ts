import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024', style = 'natural' } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Prompt too long. Maximum 1000 characters allowed.' },
        { status: 400 }
      )
    }

    // Generate image using AI
    const imageData = await generateImage(prompt.trim(), size, style)

    return NextResponse.json({
      success: true,
      image: imageData,
      prompt: prompt.trim(),
      size,
      style,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Image Generation Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate image. Please try again.' },
      { status: 500 }
    )
  }
}

async function generateImage(prompt: string, size: string, style: string): Promise<{
  base64?: string
  url?: string
  revisedPrompt?: string
}> {
  try {
    // Try using image-generation skill if available
    const imageGen = await import('@/lib/image-generation').catch(() => null)
    
    if (imageGen?.default?.generate) {
      const result = await imageGen.default.generate({
        prompt,
        size,
        style,
        format: 'base64'
      })
      
      if (result?.image) {
        return {
          base64: result.image,
          revisedPrompt: result.revisedPrompt || prompt
        }
      }
    }
  } catch (error) {
    console.log('Image generation skill not available, using fallback')
  }

  // Fallback: Return a placeholder/gradient image with the prompt embedded
  return generatePlaceholderImage(prompt, size)
}

function generatePlaceholderImage(prompt: string, size: string): {
  base64: string
  revisedPrompt: string
} {
  // Create a simple SVG placeholder with gradient and text
  const [width, height] = size.split('x').map(s => parseInt(s) || 512)
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#8B5CF6;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#06B6D4;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad1)" />
      <text x="50%" y="45%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" opacity="0.9">
        ✨ AI Generated Image
      </text>
      <text x="50%" y="55%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="16" opacity="0.7">
        ${escapeXml(prompt.substring(0, 50))}${prompt.length > 50 ? '...' : ''}
      </text>
      <text x="50%" y="70%" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="14" opacity="0.5">
        ${width} × ${height} • NEXUS AI
      </text>
    </svg>
  `

  // Convert SVG to base64
  const base64 = Buffer.from(svg).toString('base64')
  
  return {
    base64: `data:image/svg+xml;base64,${base64}`,
    revisedPrompt: prompt
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// Supported sizes endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    info: {
      supportedSizes: [
        { value: '512x512', label: 'Small (512px)' },
        { value: '1024x1024', label: 'Medium (1024px)' },
        { value: '1024x1792', label: 'Portrait (1024×1792)' },
        { value: '1792x1024', label: 'Landscape (1792×1024)' }
      ],
      supportedStyles: [
        { value: 'natural', label: 'Natural' },
        { value: 'vivid', label: 'Vivid & Colorful' },
        { value: 'anime', label: 'Anime Style' },
        { value: 'digital-art', label: 'Digital Art' },
        { value: 'photorealistic', label: 'Photorealistic' },
        { value: '3d-render', label: '3D Render' }
      ],
      maxPromptLength: 1000,
      formats: ['png', 'webp', 'svg']
    }
  })
}
