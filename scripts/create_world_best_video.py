#!/usr/bin/env python3
"""
NEXUS AI - World's Best Advertisement Video Generator
Cinematic Quality | Premium Effects | Professional Editing
"""

import os
import random
import math
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import subprocess

# ============== CONFIGURATION ==============
WIDTH = 1920
HEIGHT = 1080
FPS = 60
DURATION = 45  # 45 seconds of pure awesomeness
TOTAL_FRAMES = FPS * DURATION

# Output paths
FRAME_DIR = "/home/z/my-project/video_frames"
OUTPUT_VIDEO = "/home/z/my-project/download/NEXUS_AI_Worlds_Best_Ad.mp4"

# Create frame directory
os.makedirs(FRAME_DIR, exist_ok=True)

# ============== COLOR PALETTES ==============
class Colors:
    # Primary gradients
    DEEP_SPACE = (10, 10, 35)
    COSMIC_PURPLE = (75, 0, 130)
    ELECTRIC_BLUE = (0, 150, 255)
    NEON_CYAN = (0, 255, 255)
    HOT_PINK = (255, 20, 147)
    GOLD = (255, 215, 0)
    PURE_WHITE = (255, 255, 255)
    
    # Gradient colors
    GRADIENT_START = (15, 10, 50)
    GRADIENT_MID = (40, 20, 80)
    GRADIENT_END = (10, 15, 45)

# ============== FONT SETUP ==============
def get_fonts():
    """Load fonts with fallbacks"""
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120)
        subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72)
        body_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48)
        small_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36)
        tiny_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        body_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
        tiny_font = ImageFont.load_default()
    
    return title_font, subtitle_font, body_font, small_font, tiny_font

# ============== EFFECT FUNCTIONS ==============

def create_gradient_background(width, height, frame_num, total_frames, style='cosmic'):
    """Create animated gradient background"""
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    
    # Animated gradient shift
    offset = (frame_num / total_frames) * 100
    
    if style == 'cosmic':
        # Deep space cosmic gradient
        for y in range(height):
            ratio = y / height
            r = int(Colors.GRADIENT_START[0] + (Colors.GRADIENT_MID[0] - Colors.GRADIENT_START[0]) * math.sin(ratio * math.pi + offset * 0.02))
            g = int(Colors.GRADIENT_START[1] + (Colors.GRADIENT_MID[1] - Colors.GRADIENT_START[1]) * math.sin(ratio * math.pi + offset * 0.02))
            b = int(Colors.GRADIENT_START[2] + (Colors.GRADIENT_MID[2] - Colors.GRADIENT_START[2]) * math.sin(ratio * math.pi + offset * 0.02))
            draw.line([(0, y), (width, y)], fill=(max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))))
    
    elif style == 'aurora':
        # Aurora borealis effect
        for y in range(height):
            ratio = y / height
            wave1 = math.sin(ratio * 4 + offset * 0.03) * 30
            wave2 = math.cos(ratio * 3 + offset * 0.02) * 20
            r = int(10 + wave1 + abs(math.sin(offset * 0.01)) * 40)
            g = int(20 + wave2 + abs(math.cos(offset * 0.015)) * 60)
            b = int(50 + wave1 * 0.5 + 100)
            draw.line([(0, y), (width, y)], fill=(max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))))
    
    elif style == 'fire':
        # Fire/intense gradient
        for y in range(height):
            ratio = y / height
            intensity = math.sin(offset * 0.05) * 0.3 + 0.7
            r = int((80 + 175 * ratio) * intensity)
            g = int((20 + 80 * (1-ratio)) * intensity * 0.5)
            b = int(30 * (1-ratio) * intensity * 0.3)
            draw.line([(0, y), (width, y)], fill=(max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b))))
    
    return img

def draw_glow_circle(draw, cx, cy, radius, color, intensity=1.0, layers=5):
    """Draw glowing circle with multiple layers"""
    for i in range(layers, 0, -1):
        factor = i / layers
        current_radius = int(radius * (1 + (1-factor) * 0.5))
        alpha = int(intensity * factor * 100)
        
        # Create color with reduced brightness for outer layers
        r = min(255, int(color[0] * factor))
        g = min(255, int(color[1] * factor))
        b = min(255, int(color[2] * factor))
        
        draw.ellipse(
            [cx - current_radius, cy - current_radius, 
             cx + current_radius, cy + current_radius],
            outline=(r, g, b), width=3
        )

def draw_particle_field(img, frame_num, num_particles=50, style='sparkle'):
    """Draw animated particle field"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    random.seed(frame_num * 7)  # Consistent randomness per frame but different each frame
    
    for _ in range(num_particles):
        x = random.randint(0, width)
        y = random.randint(0, height)
        
        # Animate position
        x_offset = math.sin(frame_num * 0.02 + random.random() * 10) * 20
        y_offset = math.cos(frame_num * 0.015 + random.random() * 10) * 20
        
        px = int(x + x_offset) % width
        py = int(y + y_offset) % height
        
        # Particle properties based on style
        if style == 'sparkle':
            size = random.randint(2, 5)
            brightness = random.randint(200, 255)
            color = (brightness, brightness, min(255, brightness + 50))
            
            # Twinkle effect
            twinkle = abs(math.sin(frame_num * 0.1 + random.random() * 5))
            if twinkle > 0.3:
                actual_size = int(size * twinkle)
                draw.ellipse([px-actual_size, py-actual_size, px+actual_size, py+actual_size], fill=color)
                
        elif style == 'firefly':
            size = random.randint(3, 8)
            hue_shift = (frame_num * 2 + random.randint(0, 360)) % 360
            
            # Golden-green firefly color
            r = min(255, 200 + int(55 * math.sin(hue_shift * 0.017)))
            g = min(255, 180 + int(75 * math.sin(hue_shift * 0.017 + 2)))
            b = random.randint(0, 50)
            
            # Glow effect
            for i in range(3, 0, -1):
                glow_size = size * i
                alpha_factor = 1 / i
                glow_color = (int(r * alpha_factor), int(g * alpha_factor), int(b * alpha_factor))
                draw.ellipse([px-glow_size, py-glow_size, px+glow_size, py+glow_size], fill=glow_color)
    
    return img

def draw_light_rays(img, frame_num, center_x, center_y, num_rays=12):
    """Draw animated light rays emanating from center"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    for i in range(num_rays):
        angle = (i / num_rays) * 360 + (frame_num * 0.5) % 360
        rad = math.radians(angle)
        
        # Ray length varies
        length = max(width, height) * (0.8 + 0.4 * math.sin(frame_num * 0.03 + i))
        
        end_x = center_x + math.cos(rad) * length
        end_y = center_y + math.sin(rad) * length
        
        # Gradient ray (multiple lines with decreasing opacity)
        for j in range(20, 0, -1):
            factor = j / 20
            inner_x = center_x + math.cos(rad) * length * (1 - factor)
            inner_y = center_y + math.sin(rad) * length * (1 - factor)
            outer_x = center_x + math.cos(rad) * length * (1 - factor + 0.05)
            outer_y = center_y + math.sin(rad) * length * (1 - factor + 0.05)
            
            alpha = int(30 * factor)
            color = (alpha, alpha + 20, min(255, alpha + 80))
            
            draw.line([(inner_x, inner_y), (outer_x, outer_y)], fill=color, width=2)
    
    return img

def draw_pulsing_ring(draw, cx, cy, base_radius, color, frame_num, speed=0.05, thickness=3):
    """Draw pulsating ring animation"""
    pulse = math.sin(frame_num * speed) * 0.3 + 1
    radius = int(base_radius * pulse)
    
    # Multiple rings for depth
    for i in range(3):
        r = radius + i * 10
        alpha = 1 - (i * 0.25)
        c = (int(color[0] * alpha), int(color[1] * alpha), int(color[2] * alpha))
        draw.ellipse([cx-r, cy-r, cx+r, cy+r], outline=c, width=thickness-i)

def draw_text_with_effect(draw, text, x, y, font, fill_color, shadow=True, glow=False, glow_color=None):
    """Draw text with shadow/glow effects"""
    if glow and glow_color:
        # Glow effect - multiple offset draws
        for offset in range(20, 0, -2):
            alpha = offset / 20
            gc = (int(glow_color[0] * alpha * 0.3), 
                  int(glow_color[1] * alpha * 0.3), 
                  int(glow_color[2] * alpha * 0.3))
            draw.text((x+offset, y+offset), text, font=font, fill=gc)
    
    if shadow:
        # Drop shadow
        draw.text((x+4, y+4), text, font=font, fill=(0, 0, 0, 128))
    
    # Main text
    draw.text((x, y), text, font=font, fill=fill_color)

def draw_corner_decorations(draw, width, height, frame_num, style='tech'):
    """Draw animated corner decorations"""
    # Top-left corner
    tl_length = 100 + int(30 * math.sin(frame_num * 0.05))
    draw.line([(0, 0), (tl_length, 0)], fill=Colors.NEON_CYAN, width=3)
    draw.line([(0, 0), (0, tl_length)], fill=Colors.NEON_CYAN, width=3)
    
    # Small accent
    draw.line([(tl_length, 0), (tl_length + 30, 0)], fill=Colors.ELECTRIC_BLUE, width=2)
    draw.line([(0, tl_length), (0, tl_length + 30)], fill=Colors.ELECTRIC_BLUE, width=2)
    
    # Top-right corner
    tr_start = width - tl_length
    draw.line([(width, 0), (tr_start, 0)], fill=Colors.HOT_PINK, width=3)
    draw.line([(width, 0), (width, tl_length)], fill=Colors.HOT_PINK, width=3)
    draw.line([(tr_start - 30, 0), (tr_start, 0)], fill=Colors.ELECTRIC_BLUE, width=2)
    draw.line([(width, tl_length), (width, tl_length + 30)], fill=Colors.ELECTRIC_BLUE, width=2)
    
    # Bottom-left corner
    bl_length = 80 + int(20 * math.cos(frame_num * 0.04))
    draw.line([(0, height), (bl_length, height)], fill=Colors.HOT_PINK, width=3)
    draw.line([(0, height), (0, height - bl_length)], fill=Colors.HOT_PINK, width=3)
    
    # Bottom-right corner
    br_start = width - bl_length
    draw.line([(width, height), (br_start, height)], fill=Colors.NEON_CYAN, width=3)
    draw.line([(width, height), (width, height - bl_length)], fill=Colors.NEON_CYAN, width=3)

def draw_progress_bar(draw, x, y, width, height, progress, color1, color2, frame_num):
    """Draw animated progress bar with glow"""
    # Background
    draw.rounded_rectangle([x, y, x+width, y+height], radius=height//2, fill=(30, 30, 50))
    
    # Progress fill
    fill_width = int(width * progress)
    if fill_width > 0:
        # Gradient effect on progress
        for i in range(fill_width):
            ratio = i / width
            r = int(color1[0] + (color2[0] - color1[0]) * ratio)
            g = int(color1[1] + (color2[1] - color1[1]) * ratio)
            b = int(color1[2] + (color2[2] - color1[2]) * ratio)
            draw.line([(x+i, y+2), (x+i, y+height-2)], fill=(r, g, b))
        
        # Glow at leading edge
        glow_x = x + fill_width
        for i in range(10, 0, -1):
            alpha = i / 10
            gc = (int(color2[0] * alpha), int(color2[1] * alpha), int(color2[2] * alpha))
            draw.line([(glow_x+i, y), (glow_x+i, y+height)], fill=gc)
    
    # Shine effect
    shine_x = x + int((math.sin(frame_num * 0.1) * 0.5 + 0.5) * width)
    if shine_x < x + fill_width:
        draw.line([(shine_x, y+2), (shine_x+10, y+2)], fill=(255, 255, 255, 100))

def draw_hexagon_grid(img, frame_num, spacing=150):
    """Draw animated hexagon pattern overlay"""
    draw = ImageDraw.Draw(img)
    width, height = img.size
    
    hex_height = spacing * 0.866  # sqrt(3)/2
    
    for row in range(int(height / hex_height) + 2):
        for col in range(int(width / spacing) + 2):
            x = col * spacing
            if row % 2 == 1:
                x += spacing / 2
            y = row * hex_height
            
            # Pulse animation
            dist_from_center = math.sqrt(((x - width/2)/(width/2))**2 + ((y - height/2)/(height/2))**2)
            pulse = math.sin(frame_num * 0.03 - dist_from_center * 3) * 0.5 + 0.5
            
            if pulse > 0.6:
                alpha = int((pulse - 0.6) * 2.5 * 40)
                size = 20 + int(pulse * 10)
                
                # Draw hexagon (simplified as circle for performance)
                color = (alpha, alpha + 10, alpha + 30)
                draw.ellipse([x-size//2, y-size//2, x+size//2, y+size//2], outline=color, width=1)

# ============== SCENE GENERATORS ==============

def scene_epic_intro(frame_num, local_frame, fonts):
    """Scene 1: Epic Cinematic Introduction (0-5 seconds)"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, 'cosmic')
    draw = ImageDraw.Draw(img)
    
    # Light rays from center
    draw_light_rays(img, frame_num, WIDTH//2, HEIGHT//2, 16)
    
    # Particle field
    draw_particle_field(img, frame_num, 80, 'sparkle')
    
    # Central glow
    glow_intensity = min(1.0, local_frame / 30)
    draw_glow_circle(draw, WIDTH//2, HEIGHT//2, 300, Colors.COSMIC_PURPLE, glow_intensity, 8)
    draw_glow_circle(draw, WIDTH//2, HEIGHT//2, 200, Colors.ELECTRIC_BLUE, glow_intensity * 0.8, 6)
    
    # Corner decorations
    draw_corner_decorations(draw, WIDTH, HEIGHT, frame_num)
    
    # Animated rings
    draw_pulsing_ring(draw, WIDTH//2, HEIGHT//2, 350, Colors.NEON_CYAN, frame_num, 0.04, 4)
    draw_pulsing_ring(draw, WIDTH//2, HEIGHT//2, 400, Colors.ELECTRIC_BLUE, frame_num, 0.03, 2)
    
    # Title text with dramatic entrance
    if local_frame > 20:
        text_alpha = min(1.0, (local_frame - 20) / 30)
        scale = 0.9 + 0.1 * math.sin(local_frame * 0.05)
        
        # Main title
        title = "N E X U S"
        bbox = draw.textbbox((0, 0), title, font=title_font)
        text_width = bbox[2] - bbox[0]
        text_x = (WIDTH - text_width) // 2
        text_y = HEIGHT // 2 - 100
        
        draw_text_with_effect(draw, title, text_x, text_y, title_font, 
                             Colors.PURE_WHITE, glow=True, glow_color=Colors.COSMIC_PURPLE)
        
        # Subtitle
        if local_frame > 50:
            sub_alpha = min(1.0, (local_frame - 50) / 25)
            subtitle = "A I"
            bbox = draw.textbbox((0, 0), subtitle, font=subtitle_font)
            sub_width = bbox[2] - bbox[0]
            sub_x = (WIDTH - sub_width) // 2
            
            # Pulsing glow on AI
            ai_glow = abs(math.sin(frame_num * 0.08)) * 0.5 + 0.5
            ai_color = (
                int(Colors.NEON_CYAN[0] * ai_glow + Colors.PURE_WHITE[0] * (1-ai_glow)),
                int(Colors.NEON_CYAN[1] * ai_glow + Colors.PURE_WHITE[1] * (1-ai_glow)),
                int(Colors.NEON_CYAN[2] * ai_glow + Colors.PURE_WHITE[2] * (1-ai_glow))
            )
            
            draw_text_with_effect(draw, subtitle, sub_x, text_y + 130, subtitle_font, 
                                 ai_color, glow=True, glow_color=Colors.ELECTRIC_BLUE)
        
        # Tagline
        if local_frame > 80:
            tagline = "THE FUTURE OF INTELLIGENCE"
            bbox = draw.textbbox((0, 0), tagline, font=small_font)
            tag_width = bbox[2] - bbox[0]
            tag_x = (WIDTH - tag_width) // 2
            
            # Fade in
            tag_alpha = min(1.0, (local_frame - 80) / 30)
            tag_color = (int(200 * tag_alpha), int(200 * tag_alpha), int(220 * tag_alpha))
            draw.text((tag_x, text_y + 240), tagline, font=small_font, fill=tag_color)
    
    # Bottom line decoration
    line_width = min(WIDTH - 200, int((local_frame / 300) * (WIDTH - 200)))
    if line_width > 0:
        line_x = (WIDTH - line_width) // 2
        draw.line([(line_x, HEIGHT - 100), (line_x + line_width, HEIGHT - 100)], 
                 fill=Colors.GOLD, width=2)
    
    return img

def scene_problem_statement(frame_num, local_frame, fonts):
    """Scene 2: The Problem (5-10 seconds)"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, 'aurora')
    draw = ImageDraw.Draw(img)
    
    # Dark overlay for drama
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 100))
    img.paste(overlay, (0, 0), overlay)
    
    draw = ImageDraw.Draw(img)
    
    # Floating particles (slower, more ominous)
    draw_particle_field(img, frame_num, 30, 'firefly')
    
    # Problem icons/text
    problems = [
        ("❌", "Information Overload"),
        ("⏰", "Wasted Hours"),
        ("😰", "Decision Fatigue"),
        ("📉", "Lost Productivity")
    ]
    
    start_y = 250
    for idx, (icon, text) in enumerate(problems):
        if local_frame > idx * 30:
            entry_progress = min(1.0, (local_frame - idx * 30) / 25)
            
            x = 300
            y = start_y + idx * 150
            
            # Slide in from left
            offset_x = int((1 - entry_progress) * -200)
            
            # Red tinted problem boxes
            box_alpha = int(200 * entry_progress)
            draw.rounded_rectangle(
                [x + offset_x, y, x + offset_x + 1320, y + 110],
                radius=15,
                fill=(40, 20, 30),
                outline=(150, 50, 70, int(200 * entry_progress)),
                width=2
            )
            
            # Icon
            draw.text((x + 40 + offset_x, y + 25), icon, font=body_font, fill=(255, 100, 100))
            
            # Text
            text_color = (int(220 * entry_progress), int(220 * entry_progress), int(230 * entry_progress))
            draw.text((x + 150 + offset_x, y + 30), text, font=body_font, fill=text_color)
    
    # Header
    if local_frame > 10:
        header = "THE CHALLENGE WE FACE"
        bbox = draw.textbbox((0, 0), header, font=subtitle_font)
        header_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        header_alpha = min(1.0, (local_frame - 10) / 20)
        draw.text((header_x, 120), header, font=subtitle_font, 
                 fill=(int(255 * header_alpha), int(80 * header_alpha), int(100 * header_alpha)))
    
    return img

def scene_solution_reveal(frame_num, local_frame, fonts):
    """Scene 3: The Solution Reveal (10-16 seconds)"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, 'cosmic')
    draw = ImageDraw.Draw(img)
    
    # Epic central reveal effect
    if local_frame < 90:
        # Expanding circle reveal
        reveal_progress = local_frame / 90
        reveal_radius = int(reveal_progress * max(WIDTH, HEIGHT))
        
        # Create circular mask for reveal
        mask = Image.new('L', (WIDTH, HEIGHT), 0)
        mask_draw = ImageDraw.Draw(mask)
        mask_draw.ellipse(
            [WIDTH//2 - reveal_radius, HEIGHT//2 - reveal_radius,
             WIDTH//2 + reveal_radius, HEIGHT//2 + reveal_radius],
            fill=255
        )
        
        # Apply bright center
        center_img = Image.new('RGB', (WIDTH, HEIGHT), (30, 20, 60))
        img = Image.composite(img, center_img, mask)
    
    draw = ImageDraw.Draw(img)
    
    # Intense light rays during reveal
    draw_light_rays(img, frame_num, WIDTH//2, HEIGHT//2, 24)
    
    # Massive central glow
    glow_size = 400 + int(100 * math.sin(frame_num * 0.06))
    draw_glow_circle(draw, WIDTH//2, HEIGHT//2, glow_size, Colors.ELECTRIC_BLUE, 1.0, 10)
    draw_glow_circle(draw, WIDTH//2, HEIGHT//2, glow_size * 0.7, Colors.NEON_CYAN, 0.9, 8)
    
    # Particles exploding outward
    draw_particle_field(img, frame_num, 100, 'sparkle')
    
    # Solution text
    if local_frame > 30:
        main_text = "NEXUS AI"
        bbox = draw.textbbox((0, 0), main_text, font=title_font)
        text_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        text_y = HEIGHT // 2 - 120
        
        # Scale up effect
        scale = min(1.1, 0.8 + (local_frame - 30) / 150)
        
        draw_text_with_effect(draw, main_text, text_x, text_y, title_font,
                             Colors.PURE_WHITE, glow=True, glow_color=Colors.ELECTRIC_BLUE)
    
    if local_frame > 70:
        sub_text = "YOUR ULTIMATE AI COMPANION"
        bbox = draw.textbbox((0, 0), sub_text, font=subtitle_font)
        sub_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        
        # Rainbow shimmer effect
        shimmer = (frame_num * 2) % 360
        sub_color = (
            int(127 + 127 * math.sin(shimmer * 0.017)),
            int(127 + 127 * math.sin(shimmer * 0.017 + 2)),
            int(127 + 127 * math.sin(shimmer * 0.017 + 4))
        )
        
        draw.text((sub_x, HEIGHT//2 + 40), sub_text, font=subtitle_font, fill=sub_color)
    
    return img

def scene_feature_showcase(frame_num, local_frame, fonts):
    """Scene 4: Feature Showcase (16-26 seconds) - 4 features, 2.5 sec each"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    feature_duration = 150  # 2.5 seconds per feature at 60fps
    current_feature = local_frame // feature_duration
    feature_progress = (local_frame % feature_duration) / feature_duration
    
    features = [
        {
            "icon": "🧠",
            "title": "SUPERINTELLIGENT",
            "subtitle": "Neural Processing",
            "desc": "Advanced AI that understands context, nuance, and intent like never before",
            "color": Colors.ELECTRIC_BLUE,
            "stat": "10X",
            "stat_label": "Faster Responses"
        },
        {
            "icon": "⚡",
            "title": "LIGHTNING FAST",
            "subtitle": "Real-time Results",
            "desc": "Get instant answers powered by cutting-edge optimization technology",
            "color": Colors.NEON_CYAN,
            "stat": "<1s",
            "stat_label": "Response Time"
        },
        {
            "icon": "🔒",
            "title": "PRIVACY FIRST",
            "subtitle": "Your Data, Your Rules",
            "desc": "Enterprise-grade encryption with zero data retention policies",
            "color": Colors.HOT_PINK,
            "stat": "100%",
            "stat_label": "Secure"
        },
        {
            "icon": "🌐",
            "title": "UNIVERSAL ACCESS",
            "subtitle": "Anywhere, Anytime",
            "desc": "Seamless experience across all devices with cloud synchronization",
            "color": Colors.GOLD,
            "stat": "24/7",
            "stat_label": "Available"
        }
    ]
    
    if current_feature >= len(features):
        current_feature = len(features) - 1
    
    feature = features[current_feature]
    
    # Background changes per feature
    bg_styles = ['cosmic', 'aurora', 'fire', 'cosmic']
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, bg_styles[current_feature])
    draw = ImageDraw.Draw(img)
    
    # Transition wipe effect
    if feature_progress < 0.15:
        # Wipe from right
        wipe_x = int(WIDTH * (1 - feature_progress / 0.15))
        draw.rectangle([wipe_x, 0, WIDTH, HEIGHT], fill=(0, 0, 0))
    
    # Animated background elements
    draw_light_rays(img, frame_num, WIDTH//2, HEIGHT//2, 8)
    draw_particle_field(img, frame_num, 40, 'sparkle')
    
    # Feature card
    card_x = 200
    card_y = 200
    card_w = WIDTH - 400
    card_h = HEIGHT - 400
    
    # Card entrance animation
    card_scale = min(1.0, feature_progress * 2) if feature_progress < 0.5 else 1.0
    card_actual_w = int(card_w * card_scale)
    card_actual_h = int(card_h * card_scale)
    card_offset_x = (card_w - card_actual_w) // 2
    card_offset_y = (card_h - card_actual_h) // 2
    
    # Card background with glassmorphism effect
    draw.rounded_rectangle(
        [card_x + card_offset_x, card_y + card_offset_y,
         card_x + card_offset_x + card_actual_w, card_y + card_offset_y + card_actual_h],
        radius=30,
        fill=(20, 15, 40, 200),
        outline=feature["color"],
        width=3
    )
    
    # Inner glow
    draw_glow_circle(draw, WIDTH//2, HEIGHT//2, 300, feature["color"], 0.3, 5)
    
    # Icon
    icon_y = card_y + 80 + card_offset_y
    draw.text((WIDTH//2 - 50, icon_y), feature["icon"], font=title_font, fill=feature["color"])
    
    # Title
    if feature_progress > 0.2:
        title = feature["title"]
        bbox = draw.textbbox((0, 0), title, font=subtitle_font)
        title_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        title_y = icon_y + 160
        
        draw_text_with_effect(draw, title, title_x, title_y, subtitle_font,
                             feature["color"], glow=True, glow_color=feature["color"])
    
    # Subtitle
    if feature_progress > 0.35:
        subtitle = feature["subtitle"]
        bbox = draw.textbbox((0, 0), subtitle, font=body_font)
        sub_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        sub_y = title_y + 100
        
        draw.text((sub_x, sub_y), subtitle, font=body_font, fill=(180, 180, 200))
    
    # Description
    if feature_progress > 0.5:
        desc = feature["desc"]
        bbox = draw.textbbox((0, 0), desc, font=small_font)
        desc_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        desc_y = sub_y + 80
        
        draw.text((desc_x, desc_y), desc, font=small_font, fill=(150, 150, 170))
    
    # Stat badge
    if feature_progress > 0.65:
        stat = feature["stat"]
        stat_label = feature["stat_label"]
        
        stat_y = desc_y + 120
        
        # Stat value
        draw.text((WIDTH//2 - 60, stat_y), stat, font=title_font, fill=feature["color"])
        
        # Label
        bbox = draw.textbbox((0, 0), stat_label, font=tiny_font)
        label_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        draw.text((label_x, stat_y + 120), stat_label, font=tiny_font, fill=(120, 120, 140))
    
    # Progress indicator dots
    dot_y = HEIGHT - 120
    dot_spacing = 30
    start_x = WIDTH//2 - (len(features) - 1) * dot_spacing // 2
    
    for i in range(len(features)):
        dot_x = start_x + i * dot_spacing
        if i == current_feature:
            # Active dot - larger, glowing
            draw.ellipse([dot_x-8, dot_y-8, dot_x+8, dot_y+8], fill=feature["color"])
            draw.ellipse([dot_x-12, dot_y-12, dot_x+12, dot_y+12], outline=feature["color"], width=2)
        else:
            draw.ellipse([dot_x-5, dot_y-5, dot_x+5, dot_y+5], fill=(60, 60, 80))
    
    return img

def scene_demo_simulation(frame_num, local_frame, fonts):
    """Scene 5: UI Demo Simulation (26-33 seconds)"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, 'cosmic')
    draw = ImageDraw.Draw(img)
    
    # Simulated chat interface
    chat_x = 250
    chat_y = 150
    chat_w = WIDTH - 500
    chat_h = HEIGHT - 300
    
    # Chat window frame
    draw.rounded_rectangle(
        [chat_x, chat_y, chat_x + chat_w, chat_y + chat_h],
        radius=20,
        fill=(15, 12, 35),
        outline=(60, 50, 100),
        width=2
    )
    
    # Title bar
    draw.rectangle([chat_x, chat_y, chat_x + chat_w, chat_y + 60], fill=(25, 20, 50))
    
    # Window buttons
    draw.ellipse([chat_x + 20, chat_y + 20, chat_x + 36, chat_y + 36], fill=(255, 95, 86))
    draw.ellipse([chat_x + 45, chat_y + 20, chat_x + 61, chat_y + 36], fill=(255, 189, 46))
    draw.ellipse([chat_x + 70, chat_y + 20, chat_x + 86, chat_y + 36], fill=(39, 201, 63))
    
    # Title bar text
    draw.text((chat_x + chat_w//2 - 80, chat_y + 15), "NEXUS AI Chat", font=small_font, fill=(200, 200, 220))
    
    # Simulated conversation
    messages = [
        {"user": False, "text": "Hello! How can I help you today?", "time": 0},
        {"user": True, "text": "Explain quantum computing", "time": 40},
        {"user": False, "text": "Quantum computing harnesses quantum mechanics...", "time": 80},
        {"user": True, "text": "That's amazing! Give me code examples", "time": 140},
        {"user": False, "text": "Here's a Python implementation:", "time": 190},
    ]
    
    msg_y = chat_y + 90
    for msg in messages:
        if local_frame >= msg["time"]:
            msg_alpha = min(1.0, (local_frame - msg["time"]) / 20)
            
            if msg["user"]:
                # User message - right aligned
                msg_x = chat_x + chat_w - 500
                draw.rounded_rectangle(
                    [msg_x, msg_y, msg_x + 450, msg_y + 70],
                    radius=15,
                    fill=(int(80 * msg_alpha), int(100 * msg_alpha), int(200 * msg_alpha))
                )
                draw.text((msg_x + 20, msg_y + 18), msg["text"], font=tiny_font, 
                         fill=(int(255 * msg_alpha), int(255 * msg_alpha), int(255 * msg_alpha)))
            else:
                # AI message - left aligned
                msg_x = chat_x + 30
                draw.rounded_rectangle(
                    [msg_x, msg_y, msg_x + 480, msg_y + 70],
                    radius=15,
                    fill=(int(40 * msg_alpha), int(35 * msg_alpha), int(60 * msg_alpha)),
                    outline=(int(80 * msg_alpha), int(70 * msg_alpha), int(120 * msg_alpha)),
                    width=1
                )
                draw.text((msg_x + 20, msg_y + 18), msg["text"], font=tiny_font,
                         fill=(int(200 * msg_alpha), int(200 * msg_alpha), int(220 * msg_alpha)))
            
            msg_y += 90
    
    # Typing indicator (appears after last message)
    if local_frame > 250:
        typing_alpha = (math.sin(frame_num * 0.15) + 1) / 2
        typing_x = chat_x + 50
        typing_y = msg_y + 20
        
        for i in range(3):
            dot_x = typing_x + i * 25
            dot_offset = int(5 * math.sin(frame_num * 0.1 + i * 0.5))
            draw.ellipse(
                [dot_x, typing_y + dot_offset, dot_x + 12, typing_y + 12 + dot_offset],
                fill=(int(100 * typing_alpha), int(150 * typing_alpha), int(255 * typing_alpha))
            )
    
    # Input area
    input_y = chat_y + chat_h - 80
    draw.rounded_rectangle(
        [chat_x + 30, input_y, chat_x + chat_w - 150, input_y + 50],
        radius=25,
        fill=(25, 22, 45),
        outline=(50, 45, 80),
        width=1
    )
    
    # Input placeholder
    placeholder_alpha = (math.sin(frame_num * 0.08) + 1) / 2 * 0.5 + 0.25
    draw.text((chat_x + 50, input_y + 12), "Ask me anything...", font=tiny_font,
             fill=(int(100 * placeholder_alpha), int(100 * placeholder_alpha), int(120 * placeholder_alpha)))
    
    # Send button
    send_x = chat_x + chat_w - 130
    btn_glow = (math.sin(frame_num * 0.1) + 1) / 2
    btn_color = (
        int(Colors.ELECTRIC_BLUE[0] * (0.7 + 0.3 * btn_glow)),
        int(Colors.ELECTRIC_BLUE[1] * (0.7 + 0.3 * btn_glow)),
        int(Colors.ELECTRIC_BLUE[2] * (0.7 + 0.3 * btn_glow))
    )
    draw.rounded_rectangle(
        [send_x, input_y, send_x + 100, input_y + 50],
        radius=25,
        fill=btn_color
    )
    draw.text((send_x + 18, input_y + 12), "Send →", font=tiny_font, fill=Colors.PURE_WHITE)
    
    # Side label
    label = "LIVE DEMO"
    bbox = draw.textbbox((0, 0), label, font=small_font)
    draw.text((chat_x + chat_w//2 - (bbox[2]-bbox[0])//2, chat_y - 50), label, 
             font=small_font, fill=Colors.NEON_CYAN)
    
    return img

def scene_testimonials(frame_num, local_frame, fonts):
    """Scene 6: Social Proof/Testimonials (33-38 seconds)"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, 'aurora')
    draw = ImageDraw.Draw(img)
    
    # Header
    header = "TRUSTED BY INNOVATORS"
    bbox = draw.textbbox((0, 0), header, font=subtitle_font)
    header_x = (WIDTH - (bbox[2] - bbox[0])) // 2
    
    if local_frame > 10:
        header_alpha = min(1.0, (local_frame - 10) / 20)
        draw.text((header_x, 80), header, font=subtitle_font,
                 fill=(int(255 * header_alpha), int(215 * header_alpha), int(header_alpha)))
    
    # Testimonial cards
    testimonials = [
        {
            "quote": "NEXUS AI transformed our workflow completely!",
            "author": "Sarah Chen",
            "role": "CTO, TechVision",
            "stars": 5
        },
        {
            "quote": "The most intuitive AI assistant I've ever used.",
            "author": "Marcus Johnson",
            "role": "Lead Developer, StartupXYZ",
            "stars": 5
        },
        {
            "quote": "Game-changing technology for our research team.",
            "author": "Dr. Emily Park",
            "role": "Research Director, FutureLabs",
            "stars": 5
        }
    ]
    
    card_width = 500
    card_spacing = 60
    total_width = len(testimonials) * card_width + (len(testimonials) - 1) * card_spacing
    start_x = (WIDTH - total_width) // 2
    card_y = 220
    
    for idx, testimonial in enumerate(testimonials):
        card_x = start_x + idx * (card_width + card_spacing)
        
        if local_frame > 30 + idx * 15:
            card_progress = min(1.0, (local_frame - 30 - idx * 15) / 25)
            
            # Card background
            draw.rounded_rectangle(
                [card_x, card_y, card_x + card_width, card_y + 380],
                radius=20,
                fill=(25, 20, 45, int(230 * card_progress)),
                outline=(int(100 * card_progress), int(80 * card_progress), int(150 * card_progress)),
                width=2
            )
            
            # Stars
            star_y = card_y + 30
            star_text = "★" * testimonial["stars"]
            draw.text((card_x + 30, star_y), star_text, font=body_font, fill=Colors.GOLD)
            
            # Quote
            quote_words = testimonial["quote"].split()
            words_to_show = int(len(quote_words) * card_progress)
            visible_quote = " ".join(quote_words[:words_to_show])
            
            # Word wrap for quote
            draw.text((card_x + 30, card_y + 100), visible_quote, font=small_font,
                     fill=(int(200 * card_progress), int(200 * card_progress), int(210 * card_progress)))
            
            # Author
            if card_progress > 0.7:
                author_alpha = (card_progress - 0.7) / 0.3
                draw.text((card_x + 30, card_y + 280), testimonial["author"], font=small_font,
                         fill=(int(150 * author_alpha), int(150 * author_alpha), int(255 * author_alpha)))
                draw.text((card_x + 30, card_y + 330), testimonial["role"], font=tiny_font,
                         fill=(int(120 * author_alpha), int(120 * author_alpha), int(140 * author_alpha)))
    
    # Stats bar at bottom
    if local_frame > 120:
        stats_alpha = min(1.0, (local_frame - 120) / 30)
        stats_y = HEIGHT - 150
        
        stats = [
            ("1M+", "Users"),
            ("99.9%", "Uptime"),
            ("4.9/5", "Rating"),
            ("150+", "Countries")
        ]
        
        stat_width = 280
        stat_start = (WIDTH - len(stats) * stat_width - (len(stats)-1) * 40) // 2
        
        for i, (value, label) in enumerate(stats):
            sx = stat_start + i * (stat_width + 40)
            
            draw.text((sx, stats_y), value, font=subtitle_font,
                     fill=(int(Colors.NEON_CYAN[0] * stats_alpha),
                           int(Colors.NEON_CYAN[1] * stats_alpha),
                           int(Colors.NEON_CYAN[2] * stats_alpha)))
            draw.text((sx, stats_y + 70), label, font=small_font,
                     fill=(int(180 * stats_alpha), int(180 * stats_alpha), int(190 * stats_alpha)))
    
    return img

def scene_cta_finale(frame_num, local_frame, fonts):
    """Scene 7: Call to Action Finale (38-45 seconds)"""
    title_font, subtitle_font, body_font, small_font, tiny_font = fonts
    
    img = create_gradient_background(WIDTH, HEIGHT, frame_num, TOTAL_FRAMES, 'cosmic')
    draw = ImageDraw.Draw(img)
    
    # INTENSE visual effects for finale
    # Maximum light rays
    draw_light_rays(img, frame_num, WIDTH//2, HEIGHT//2, 32)
    
    # Massive particle explosion
    draw_particle_field(img, frame_num, 150, 'sparkle')
    
    # Multiple layered glows
    for i in range(5):
        size = 500 - i * 80
        intensity = 1.0 - i * 0.15
        colors_list = [Colors.HOT_PINK, Colors.ELECTRIC_BLUE, Colors.NEON_CYAN, Colors.GOLD, Colors.COSMIC_PURPLE]
        draw_glow_circle(draw, WIDTH//2, HEIGHT//2, size, colors_list[i], intensity, 8)
    
    # Pulsing rings
    draw_pulsing_ring(draw, WIDTH//2, HEIGHT//2, 450, Colors.NEON_CYAN, frame_num, 0.04, 5)
    draw_pulsing_ring(draw, WIDTH//2, HEIGHT//2, 550, Colors.ELECTRIC_BLUE, frame_num, 0.03, 3)
    draw_pulsing_ring(draw, WIDTH//2, HEIGHT//2, 650, Colors.HOT_PINK, frame_num, 0.02, 2)
    
    # Corner decorations - extra intense
    draw_corner_decorations(draw, WIDTH, HEIGHT, frame_num)
    
    # MAIN CTA TEXT
    if local_frame > 15:
        cta_main = "JOIN THE REVOLUTION"
        bbox = draw.textbbox((0, 0), cta_main, font=title_font)
        cta_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        cta_y = HEIGHT // 2 - 180
        
        # Pulsing scale effect
        scale = 1 + 0.03 * math.sin(frame_num * 0.08)
        
        # Color cycling
        hue = (frame_num * 3) % 360
        main_color = (
            int(127 + 127 * math.sin(hue * 0.017)),
            int(127 + 127 * math.sin(hue * 0.017 + 2.094)),
            int(127 + 127 * math.sin(hue * 0.017 + 4.189))
        )
        
        draw_text_with_effect(draw, cta_main, cta_x, cta_y, title_font,
                             main_color, glow=True, glow_color=main_color)
    
    if local_frame > 45:
        cta_sub = "Experience NEXUS AI Today"
        bbox = draw.textbbox((0, 0), cta_sub, font=subtitle_font)
        sub_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        sub_y = HEIGHT //2 - 20
        
        draw_text_with_effect(draw, cta_sub, sub_x, sub_y, subtitle_font,
                             Colors.PURE_WHITE, glow=True, glow_color=Colors.ELECTRIC_BLUE)
    
    # CTA Button
    if local_frame > 70:
        btn_progress = min(1.0, (local_frame - 70) / 25)
        
        btn_w = 400
        btn_h = 80
        btn_x = (WIDTH - btn_w) // 2
        btn_y = HEIGHT // 2 + 100
        
        # Button glow
        btn_glow_intensity = (math.sin(frame_num * 0.1) + 1) / 2
        for i in range(5, 0, -1):
            glow_expand = i * 8
            glow_alpha = (1 - i/5) * btn_glow_intensity * btn_progress
            draw.rounded_rectangle(
                [btn_x - glow_expand, btn_y - glow_expand,
                 btn_x + btn_w + glow_expand, btn_y + btn_h + glow_expand],
                radius=40,
                outline=(int(Colors.NEON_CYAN[0] * glow_alpha),
                        int(Colors.NEON_CYAN[1] * glow_alpha),
                        int(Colors.NEON_CYAN[2] * glow_alpha)),
                width=3
            )
        
        # Button itself
        btn_color = (
            int(Colors.ELECTRIC_BLUE[0] * btn_progress),
            int(Colors.ELECTRIC_BLUE[1] * btn_progress),
            int(Colors.ELECTRIC_BLUE[2] * btn_progress)
        )
        draw.rounded_rectangle(
            [btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
            radius=40,
            fill=btn_color
        )
        
        # Button text
        btn_text = "GET STARTED FREE"
        bbox = draw.textbbox((0, 0), btn_text, font=body_font)
        text_x = btn_x + (btn_w - (bbox[2] - bbox[0])) // 2
        text_y = btn_y + (btn_h - (bbox[3] - bbox[1])) // 2
        
        draw.text((text_x, text_y), btn_text, font=body_font,
                 fill=(int(255 * btn_progress), int(255 * btn_progress), int(255 * btn_progress)))
    
    # Website URL
    if local_frame > 100:
        url_alpha = min(1.0, (local_frame - 100) / 30)
        url = "www.nexusai.com"
        bbox = draw.textbbox((0, 0), url, font=body_font)
        url_x = (WIDTH - (bbox[2] - bbox[0])) // 2
        url_y = HEIGHT // 2 + 220
        
        # URL with underline
        draw.text((url_x, url_y), url, font=body_font,
                 fill=(int(Colors.NEON_CYAN[0] * url_alpha),
                       int(Colors.NEON_CYAN[1] * url_alpha),
                       int(Colors.NEON_CYAN[2] * url_alpha)))
        
        underline_width = bbox[2] - bbox[0]
        draw.line([(url_x, url_y + 55), (url_x + underline_width, url_y + 55)],
                 fill=(int(Colors.NEON_CYAN[0] * url_alpha),
                       int(Colors.NEON_CYAN[1] * url_alpha),
                       int(Colors.NEON_CYAN[2] * url_alpha)), width=2)
    
    # Final flash effect
    if local_frame > 240:
        flash_alpha = min(1.0, (local_frame - 240) / 30) * (1 - (local_frame - 240) / 60) if local_frame < 300 else 0
        if flash_alpha > 0:
            flash_overlay = Image.new('RGB', (WIDTH, HEIGHT), 
                                     (int(255 * flash_alpha), int(255 * flash_alpha), int(255 * flash_alpha)))
            img = Image.blend(img, flash_overlay, flash_alpha * 0.3)
            draw = ImageDraw.Draw(img)
    
    return img

# ============== MAIN RENDER LOOP ==============

def render_frame(frame_num, fonts):
    """Determine which scene to render and call appropriate function"""
    
    # Scene timings (in frames at 60fps)
    scenes = [
        (0, 300, scene_epic_intro),           # 0-5 sec: Epic Intro
        (300, 600, scene_problem_statement),   # 5-10 sec: Problem
        (600, 960, scene_solution_reveal),     # 10-16 sec: Solution
        (960, 1560, scene_feature_showcase),   # 16-26 sec: Features
        (1560, 1980, scene_demo_simulation),   # 26-33 sec: Demo
        (1980, 2280, scene_testimonials),      # 33-38 sec: Testimonials
        (2280, 2700, scene_cta_finale),        # 38-45 sec: CTA Finale
    ]
    
    for start, end, scene_func in scenes:
        if start <= frame_num < end:
            local_frame = frame_num - start
            return scene_func(frame_num, local_frame, fonts)
    
    # Default: last frame
    return scene_cta_finale(frame_num, 2699, fonts)

def main():
    print("🎬 NEXUS AI - WORLD'S BEST VIDEO GENERATOR")
    print("=" * 50)
    print(f"Resolution: {WIDTH}x{HEIGHT}")
    print(f"Frame Rate: {FPS} fps")
    print(f"Duration: {DURATION} seconds")
    print(f"Total Frames: {TOTAL_FRAMES}")
    print("=" * 50)
    
    # Load fonts
    print("\n📝 Loading fonts...")
    fonts = get_fonts()
    
    # Render all frames
    print(f"\n🎨 Rendering {TOTAL_FRAMES} frames...")
    
    for frame_num in range(TOTAL_FRAMES):
        # Progress reporting
        if frame_num % 60 == 0:
            progress = (frame_num / TOTAL_FRAMES) * 100
            print(f"  Progress: {progress:.1f}% ({frame_num}/{TOTAL_FRAMES})")
        
        # Render frame
        frame = render_frame(frame_num, fonts)
        
        # Save frame
        frame_path = os.path.join(FRAME_DIR, f"frame_{frame_num:05d}.png")
        frame.save(frame_path, "PNG")
    
    print("\n  ✓ All frames rendered!")
    
    # Create video with FFmpeg
    print(f"\n🎬 Encoding video with FFmpeg...")
    print(f"  Output: {OUTPUT_VIDEO}")
    
    # Create file list for FFmpeg concat
    list_file = os.path.join(FRAME_DIR, "filelist.txt")
    with open(list_file, "w") as f:
        for frame_num in range(TOTAL_FRAMES):
            frame_path = os.path.join(FRAME_DIR, f"frame_{frame_num:05d}.png")
            f.write(f"file '{frame_path}'\n")
            f.write(f"duration {1/FPS}\n")
        # Add last frame again to fix duration
        f.write(f"file '{os.path.join(FRAME_DIR, f'frame_{TOTAL_FRAMES-1:05d}.png')}'\n")
    
    # FFmpeg command
    cmd = [
        "ffmpeg", "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", list_file,
        "-vf", "format=yuv420p",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "18",
        "-pix_fmt", "yuv420p",
        OUTPUT_VIDEO
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        print("\n✅ VIDEO CREATED SUCCESSFULLY!")
        
        # Get file size
        size_bytes = os.path.getsize(OUTPUT_VIDEO)
        size_mb = size_bytes / (1024 * 1024)
        
        print(f"\n📊 Video Details:")
        print(f"  📍 Location: {OUTPUT_VIDEO}")
        print(f"  📐 Resolution: {WIDTH}x{HEIGHT} (Full HD)")
        print(f"  ⏱️ Duration: {DURATION} seconds")
        print(f"  📦 File Size: {size_mb:.2f} MB")
        print(f"  🎬 Format: H.264 (MP4)")
        print(f"  ⚡ Frame Rate: {FPS} fps")
        
        # Cleanup frames
        print(f"\n🧹 Cleaning up temporary files...")
        import shutil
        shutil.rmtree(FRAME_DIR)
        print("  ✓ Temporary frames deleted")
        
        print("\n" + "=" * 50)
        print("🎉 WORLD'S BEST VIDEO READY!")
        print("=" * 50)
        
    else:
        print(f"\n❌ Error creating video:")
        print(result.stderr)

if __name__ == "__main__":
    main()
