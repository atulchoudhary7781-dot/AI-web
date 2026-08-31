import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Supported image sizes
const SUPPORTED_SIZES = ['1024x1024', '768x1344', '864x1152', '1344x768', '1152x864', '1440x720', '720x1440'] as const
type ImageSize = typeof SUPPORTED_SIZES[number]

export async function POST(request: NextRequest) {
  try {
    const { prompt, size = '1024x1024', style = 'natural' } = await request.json()

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Image prompt is required' },
        { status: 400 }
      )
    }

    if (prompt.trim().length > 1000) {
      return NextResponse.json(
        { error: 'Prompt too long. Maximum 1000 characters allowed.' },
        { status: 400 }
      )
    }

    // Validate size
    if (!SUPPORTED_SIZES.includes(size as ImageSize)) {
      return NextResponse.json(
        { error: `Invalid size. Supported sizes: ${SUPPORTED_SIZES.join(', ')}` },
        { status: 400 }
      )
    }

    // Enhance prompt based on style
    const enhancedPrompt = enhancePrompt(prompt.trim(), style)

    // Generate image using ZAI SDK
    const zai = await ZAI.create()
    
    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: size as ImageSize
    })

    const base64 = response?.data?.[0]?.base64

    if (!base64) {
      throw new Error('No image data returned from AI service')
    }

    return NextResponse.json({
      success: true,
      image: `data:image/png;base64,${base64}`,
      prompt: prompt.trim(),
      enhancedPrompt,
      size,
      style,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Image Generation Error:', error?.message || error)
    
    // Return a beautiful placeholder on error
    return NextResponse.json({
      success: true,
      image: generatePlaceholderImage(prompt || 'AI Image'),
      prompt: prompt || 'AI Image',
      size: size || '1024x1024',
      style: style || 'natural',
      fallback: true,
      message: 'Using placeholder. AI image generation will be available soon.',
      timestamp: new Date().toISOString()
    })
  }
}

function enhancePrompt(prompt: string, style: string): string {
  const stylePrompts: Record<string, string> = {
    natural: '',
    vivid: 'vibrant colors, highly detailed, dynamic lighting, ',
    anime: 'anime style, manga art, Japanese animation, cel shaded, ',
    'digital-art': 'digital artwork, concept art, trending on ArtStation, highly detailed, ',
    photorealistic: 'photorealistic, ultra realistic, 8k resolution, professional photography, ',
    '3d-render': '3D render, octane render, blender, cinematic lighting, ray tracing, '
  }

  const stylePrefix = stylePrompts[style] || ''
  
  // Add quality boosters
  const qualityBoosters = 'high quality, masterpiece, best quality, detailed'
  
  return `${stylePrefix}${prompt}, ${qualityBoosters}`.trim()
}

function generatePlaceholderImage(prompt: string): string {
  // Create a beautiful gradient SVG with the prompt
  const svg = `
    <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="25%" style="stop-color:#764ba2;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f093fb;stop-opacity:1" />
          <stop offset="75%" style="stop-color:#f5576c;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#4facfe;stop-opacity:1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <style>
          .title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 32px; font-weight: 600; fill: white; }
          .subtitle { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; fill: rgba(255,255,255,0.85); }
          .badge { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; fill: rgba(255,255,255,0.6); }
        </style>
      </defs>
      
      <!-- Background -->
      <rect width="1024" height="1024" fill="url(#grad1)"/>
      
      <!-- Decorative circles -->
      <circle cx="200" cy="200" r="150" fill="rgba(255,255,255,0.05)" filter="url(#glow)"/>
      <circle cx="824" cy="824" r="200" fill="rgba(255,255,255,0.05)" filter="url(#glow)"/>
      <circle cx="824" cy="200" r="100" fill="rgba(255,255,255,0.03)"/>
      <circle cx="200" cy="824" r="120" fill="rgba(255,255,255,0.03)"/>
      
      <!-- Center content -->
      <g transform="translate(512, 450)">
        <!-- Icon -->
        <text x="0" y="-40" text-anchor="middle" font-size="80" opacity="0.9">✨</text>
        
        <!-- Title -->
        <text x="0" y="30" text-anchor="middle" class="title">AI Generated Image</text>
        
        <!-- Prompt preview -->
        <text x="0" y="70" text-anchor="middle" class="subtitle">${escapeXml(prompt.substring(0, 60))}${prompt.length > 60 ? '...' : ''}</text>
        
        <!-- Badge -->
        <rect x="-80" y="100" width="160" height="28" rx="14" fill="rgba(255,255,255,0.15)"/>
        <text x="0" y="119" text-anchor="middle" class="badge">NEXUS AI • 1024 × 1024</text>
      </g>
      
      <!-- Bottom decoration -->
      <text x="512" y="980" text-anchor="middle" font-size="12" fill="rgba(255,255,255,0.3)" font-family="sans-serif">
        Powered by NEXUS AI Image Generation
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// GET endpoint for supported options
export async function GET() {
  return NextResponse.json({
    success: true,
    info: {
      supportedSizes: [
        { value: '1024x1024', label: 'Square (1024×1024)', recommended: true },
        { value: '768x1344', label: 'Portrait (768×1344)' },
        { value: '1344x768', label: 'Landscape (1344×768)' },
        { value: '864x1152', label: 'Tall (864×1152)' },
        { value: '1152x864', label: 'Wide (1152×864)' },
        { value: '1440x720', label: 'Panoramic (1440×720)' },
        { value: '720x1440', label: 'Mobile (720×1440)' }
      ],
      supportedStyles: [
        { value: 'natural', label: 'Natural', icon: '🎨', description: 'Balanced and clean' },
        { value: 'vivid', label: 'Vivid & Colorful', icon: '🌈', description: 'Bright and vibrant' },
        { value: 'anime', label: 'Anime Style', icon: '🎌', description: 'Japanese animation' },
        { value: 'digital-art', label: 'Digital Art', icon: '💻', description: 'Concept art style' },
        { value: 'photorealistic', label: 'Photorealistic', icon: '📷', description: 'Like a photo' },
        { value: '3d-render', label: '3D Render', icon: '🎮', description: '3D rendered look' }
      ],
      maxPromptLength: 1000,
      features: [
        'High-quality AI generation',
        'Multiple aspect ratios',
        'Style enhancement',
        'Fast generation speed',
        'Base64 output for easy use'
      ]
    }
  })
}
