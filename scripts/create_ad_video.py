#!/usr/bin/env python3
"""
NEXUS AI - Professional Advertisement Video Generator (Optimized)
Uses PIL + FFmpeg - Memory efficient version
"""

import numpy as np
from PIL import Image, ImageDraw, ImageFont
import subprocess
import os
import tempfile
import random

# Video Settings
WIDTH = 1280  # Reduced for faster processing
HEIGHT = 720
FPS = 24     # Reduced FPS

# Colors
BG_DARK = (10, 10, 20)
CYAN = (0, 245, 255)
VIOLET = (124, 58, 237)
WHITE = (255, 255, 255)
GRAY = (150, 150, 170)

def get_font(size, bold=False):
    try:
        if bold:
            return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
        return ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", size)
    except:
        return ImageFont.load_default()

def create_gradient(width, height, c1, c2):
    img = Image.new('RGB', (width, height))
    draw = ImageDraw.Draw(img)
    for y in range(height):
        r = int(c1[0] + (c2[0] - c1[0]) * y / height)
        g = int(c1[1] + (c2[1] - c1[1]) * y / height)
        b = int(c1[2] + (c2[2] - c1[2]) * y / height)
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    return img

def draw_centered(draw, text, y, font, color, w=WIDTH):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    draw.text(((w - tw) // 2, y), text, fill=color, font=font)

def add_glow(draw, cx, cy, r, color, rings=4):
    for i in range(rings, 0, -1):
        a = int(60 * (1 - i/rings))
        off = i * 6
        draw.ellipse([cx-r-off, cy-r-off, cx+r+off, cy+r+off], 
                    outline=(min(color[0],a), min(color[1],a), min(color[2],a)), width=2)

def gen_title(output_dir):
    print("🎬 Title screen...")
    frames_dir = os.path.join(output_dir, 'title')
    os.makedirs(frames_dir, exist_ok=True)
    
    for f in range(FPS * 4):  # 4 seconds
        p = f / (FPS * 4)
        bg = create_gradient(WIDTH, HEIGHT, BG_DARK, (20, 10, 40))
        d = ImageDraw.Draw(bg)
        
        # Logo glow
        add_glow(d, WIDTH//2, HEIGHT//2-80, 50, CYAN, 5)
        
        # Logo circle
        if f > FPS*0.3:
            a = min(1, (f-FPS*0.3)/(FPS*0.3))
            s = int(45*a)
            d.ellipse([WIDTH//2-s, HEIGHT//2-80-s, WIDTH//2+s, HEIGHT//2-80+s], fill=CYAN)
            d.text((WIDTH//2-12, HEIGHT//2-100), "✨", fill=WHITE, font=get_font(int(30*a)))
        
        # Title
        if f > FPS*0.6:
            a = min(1, (f-FPS*0.6)/(FPS*0.3))
            draw_centered(d, "NEXUS AI", 340, get_font(int(80*a), bold=True), CYAN)
        
        # Subtitle
        if f > FPS*1.2:
            a = min(1, (f-FPS*1.2)/(FPS*0.3))
            draw_centered(d, "The Future of Intelligence", 450, get_font(int(36*a)), WHITE)
        
        # Tagline
        if f > FPS*2:
            a = min(1, (f-FPS*2)/(FPS*0.3))
            draw_centered(d, "⚡ Powered by Llama 3.1 • Next.js • OpenRouter", 540, 
                        get_font(int(22*a)), GRAY)
        
        bg.save(f"{frames_dir}/frame_{f:05d}.png")
    
    return frames_dir

def gen_feature(title, desc, icon, idx, output_dir):
    print(f"✨ Feature {idx+1}: {title}")
    frames_dir = os.path.join(output_dir, f'feature_{idx}')
    os.makedirs(frames_dir, exist_ok=True)
    
    for f in range(FPS * 3):  # 3 seconds each
        p = f / (FPS * 3)
        bg = create_gradient(WIDTH, HEIGHT, BG_DARK, (15, 15, 35))
        d = ImageDraw.Draw(bg)
        
        # Icon
        scale = 0.9 + 0.1 * abs(p-0.5)*2
        draw_centered(d, icon, 180, get_font(int(70*scale)), CYAN)
        add_glow(d, WIDTH//2, 220, 55, CYAN, 4)
        
        # Title
        draw_centered(d, title, 320, get_font(48, bold=True), WHITE)
        
        # Description with reveal
        words = desc.split()
        show = min(len(words), int(len(words) * p * 1.5))
        draw_centered(d, ' '.join(words[:show]), 400, get_font(26), GRAY)
        
        # Progress bar
        bw = int((WIDTH-300) * p)
        d.rounded_rectangle([150, 500, 150+bw, 508], radius=2, fill=VIOLET)
        
        # Number
        d.text((30, 25), f"{idx+1}/4", fill=GRAY, font=get_font(18))
        
        bg.save(f"{frames_dir}/frame_{f:05d}.png")
    
    return frames_dir

def gen_ui_demo(output_dir):
    print("🖥️ UI Demo...")
    frames_dir = os.path.join(output_dir, 'ui_demo')
    os.makedirs(frames_dir, exist_ok=True)
    
    for f in range(FPS * 6):  # 6 seconds
        p = f / (FPS * 6)
        bg = Image.new('RGB', (WIDTH, HEIGHT), BG_DARK)
        d = ImageDraw.Draw(bg)
        
        # Header
        d.rectangle([0, 0, WIDTH, 55], fill=(22, 22, 35))
        d.text((40, 16), "☰ AI Chat", fill=WHITE, font=get_font(22, bold=True))
        d.text((WIDTH-160, 18), "+ New Chat", fill=tuple(CYAN), font=get_font(18))
        
        # Sidebar toggle
        d.rectangle([0, 55, 45, HEIGHT], fill=(16, 16, 28))
        d.text((12, 75), "☰", fill=tuple(CYAN), font=get_font(18))
        
        # Welcome area
        cx = WIDTH // 2 + 22
        
        # Logo
        bounce = abs(p%0.4-0.2)*8
        add_glow(d, cx, 175+bounce, 40, CYAN, 4)
        d.ellipse([cx-35, 140+bounce, cx+35, 210+bounce], fill=(0,170,210))
        d.text((cx-16, 158+bounce), "✨", fill=WHITE, font=get_font(28))
        
        # Title
        if p > 0.1:
            draw_centered(d, "Welcome to NEXUS AI", 270, get_font(32, bold=True), WHITE)
        
        # Subtitle
        if p > 0.25:
            draw_centered(d, "Your advanced AI assistant powered by Llama 3.1", 315, get_font(18), GRAY)
        
        # Quick actions
        actions = [("💡","Explain"),("💻","Code"),("📝","Write"),("🎯","Ideas")]
        bw, bh = 120, 55
        sx = cx - len(actions)*(bw+14)//2
        by = 380
        
        for i,(ic,lb) in enumerate(actions):
            x = sx + i*(bw+14)
            delay = i*0.06
            bp = max(0, min(1, (p-delay)*2))
            if bp>0:
                d.rounded_rectangle([x,by,x+bw,by+bh], radius=10, 
                                 fill=(int(35+15*bp),)*3, outline=(60,60,85))
                d.text((x+bw//2-10, by+8), ic, fill=WHITE, font=get_font(18))
                d.text((x+bw//2-18, by+32), lb, fill=GRAY, font=get_font(12))
        
        # Input box
        iy = HEIGHT-90
        d.rounded_rectangle([50,iy,WIDTH-50,iy+55], radius=15, 
                         fill=(28,28,48), outline=(55,55,85))
        d.text((65, iy+12), "Ask NEXUS AI anything...", fill=GRAY, font=get_font(15))
        
        # Send button
        sx_pos = WIDTH-105
        d.rounded_rectangle([sx_pos,iy+5,sx_pos+45,iy+50], radius=12, fill=tuple(CYAN))
        d.text((sx_pos+12, iy+13), "➤", fill=BG_DARK, font=get_font(20, bold=True))
        
        # Typing indicator
        if 0.4 < p < 0.8:
            tp = (p-0.4)*2.5
            dots = "."*(int(tp*3)%4)
            draw_centered(d, f"NEXUS is thinking{dots}", HEIGHT-108, get_font(14), tuple(CYAN))
        
        bg.save(f"{frames_dir}/frame_{f:05d}.png")
    
    return frames_dir

def gen_before_after(output_dir):
    print("📊 Before/After...")
    frames_dir = os.path.join(output_dir, 'before_after')
    os.makedirs(frames_dir, exist_ok=True)
    
    for f in range(FPS * 4):  # 4 seconds
        p = f / (FPS * 4)
        bg = create_gradient(WIDTH, HEIGHT, (12,12,24), (18,18,35))
        d = ImageDraw.Draw(bg)
        
        mid = WIDTH//2
        
        # BEFORE (left)
        d.rounded_rectangle([15,70,mid-25,HEIGHT-35], radius=12, 
                         fill=(35,30,38), outline=(90,65,75))
        draw_centered(d, "❌ BEFORE", 95, get_font(30, bold=True), (255,120,120), mid-10)
        
        old_items = ["Basic design ✗", "Limited features ✗", "No sidebar ✗", "Plain chat ✗"]
        for i,item in enumerate(old_items):
            d.text((35,155+i*48), item, fill=(170,135,135), font=get_font(17))
            d.line([35,173+i*48,200,173+i*48], fill=(255,100,100), width=2)
        
        # AFTER (right)
        d.rounded_rectangle([mid+25,70,WIDTH-15,HEIGHT-35], radius=12, 
                         fill=(15,25,40), outline=tuple(CYAN))
        draw_centered(d, "✅ AFTER", 95, get_font(30, bold=True), tuple(CYAN), WIDTH-mid-10)
        
        new_items = ["Full-screen chat ✓", "Left sidebar menu ✓", "Beautiful gradients ✓", "Professional design ✓"]
        for i,item in enumerate(new_items):
            delay = i*0.08
            if p>delay:
                a = min(1,(p-delay)*2.5)
                c = (int(CYAN[0]*a),int(CYAN[1]*a),int(CYAN[2]*a))
                d.text((mid+45,155+i*48), item, fill=c, font=getfont(17))
        
        # Arrow
        ay = HEIGHT//2
        ap = 1+0.08*abs(p%0.4-0.2)*2
        asz = int(18*ap)
        d.polygon([mid-asz,ay-25,mid+asz,ay,mid-asz,ay+25], fill=VIOLET)
        add_glow(d, mid, ay, 28, VIOLET, 3)
        
        bg.save(f"{frames_dir}/frame_{f:05d}.png")
    
    return frames_dir

def gen_cta(output_dir):
    print("🚀 CTA Screen...")
    frames_dir = os.path.join(output_dir, 'cta')
    os.makedirs(frames_dir, exist_ok=True)
    
    for f in range(FPS * 5):  # 5 seconds
        p = f / (FPS * 5)
        hs = int(p*15)
        bg = create_gradient(WIDTH, HEIGHT, (15+hs,10,30), (10,10,25))
        d = ImageDraw.Draw(bg)
        
        # Particles
        random.seed(123+f)
        for _ in range(40):
            px=int(random.random()*WIDTH)
            py=int(random.random()*HEIGHT)
            ps=random.randint(2,4)
            colors=[CYAN,VIOLET,(255,100,170)]
            pc=colors[_%3]
            d.ellipse([px,py,px+ps,py+ps], fill=(pc[0],pc[1],pc[2],60))
        
        # CTA text
        sc = 1+0.03*abs(p-0.3)*2 if p<0.7 else 1
        draw_centered(d, "Experience the Future", 280, get_font(int(56*sc), bold=True), WHITE)
        
        # URL
        if p>0.3:
            a=min(1,(p-0.3)*2)
            add_glow(d, WIDTH//2, 360, 150, CYAN, 3)
            draw_centered(d, "ai-web.vercel.app", 350, get_font(int(38*a), bold=True), tuple(CYAN))
        
        # GitHub
        if p>0.5:
            a=min(1,(p-0.5)*2)
            draw_centered(d, "⭐ Star on GitHub: github.com/atulchoudhary7781-dot/AI-web", 
                        430, get_font(int(20*a)), GRAY)
        
        # Branding
        if p>0.7:
            a=min(1,(p-0.7)*3)
            draw_centered(d, "Built with ❤️ | Next.js 16 | Llama 3.1 | OpenRouter", 
                        500, get_font(int(18*a)), (100,100,140))
        
        # Corner decorations
        cl = int(60*min(1,p*2))
        d.line([0,0,cl,0], fill=CYAN, width=2)
        d.line([0,0,0,cl], fill=CYAN, width=2)
        d.line([WIDTH-cl,0,WIDTH,0], fill=VIOLET, width=2)
        d.line([WIDTH,0,WIDTH,cl], fill=VIOLET, width=2)
        
        bg.save(f"{frames_dir}/frame_{f:05d}.png")
    
    return frames_dir

def getfont(size, bold=False):
    """Alias for get_font"""
    return get_font(size, bold)

def combine_and_encode(frame_dirs, output_path):
    """Combine frame directories and encode to video"""
    print("\n💾 Combining and encoding video...")
    
    # Create file list for ffmpeg concat
    list_file = output_path.replace('.mp4', '_filelist.txt')
    
    with open(list_file, 'w') as f:
        for dir_path in frame_dirs:
            if os.path.exists(dir_path):
                files = sorted([fl for fl in os.listdir(dir_path) if fl.endswith('.png')])
                for i, file in enumerate(files):
                    f.write(f"file '{os.path.abspath(os.path.join(dir_path, file))}'\n")
                    if i < len(files) - 1:
                        f.write(f"duration {1/FPS}\n")
        
        # Add final frame
        if frame_dirs:
            last_dir = frame_dirs[-1]
            if os.path.exists(last_dir):
                files = sorted([fl for fl in os.listdir(last_dir) if fl.endswith('.png')])
                if files:
                    f.write(f"file '{os.path.abspath(os.path.join(last_dir, files[-1]))}'\n")
    
    # Encode with ffmpeg
    cmd = [
        'ffmpeg', '-y', '-f', 'concat', '-safe', '0',
        '-i', list_file,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-preset', 'medium', '-crf', '20',
        '-movflags', '+faststart',
        output_path
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    # Cleanup
    if os.path.exists(list_file):
        os.remove(list_file)
    
    if result.returncode == 0:
        return output_path
    else:
        print(f"FFmpeg error: {result.stderr}")
        return None

def main():
    print("=" * 60)
    print("🎬 NEXUS AI - Ad Video Generator (Optimized)")
    print("=" * 60)
    print(f"📐 Resolution: {WIDTH}x{HEIGHT}")
    print(f"⏱️  Duration: ~22 seconds")
    print()
    
    temp_dir = tempfile.mkdtemp(prefix='nexus_ad_')
    
    try:
        # Generate sections
        dirs = []
        dirs.append(gen_title(temp_dir))
        
        features = [
            ("Neural Processing", "Advanced deep learning that understands context", "🧠"),
            ("Code Generation", "Production-ready code in 50+ languages", "💻"),
            ("Quantum Security", "Military-grade encryption protection", "🔒"),
            ("Global Network", "Lightning-fast responses worldwide", "🌐")
        ]
        
        for i,(t,d,ic) in enumerate(features):
            dirs.append(gen_feature(t, d, ic, i, temp_dir))
        
        dirs.append(gen_ui_demo(temp_dir))
        dirs.append(gen_before_after(temp_dir))
        dirs.append(gen_cta(temp_dir))
        
        # Combine and encode
        output_path = "/home/z/my-project/download/NEXUS_AI_Advertisement.mp4"
        result = combine_and_encode(dirs, output_path)
        
        if result and os.path.exists(result):
            size = os.path.getsize(result) / (1024*1024)
            
            print("\n" + "=" * 60)
            print("✅ VIDEO CREATED SUCCESSFULLY!")
            print("=" * 60)
            print(f"📁 Location: {output_path}")
            print(f"📊 Size: {size:.2f} MB")
            print(f"🎬 Resolution: {WIDTH}x{HEIGHT}")
            print("=" * 60)
            print("\n🎉 Your ad is ready! Share it! 🚀")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        import shutil
        shutil.rmtree(temp_dir, ignore_errors=True)

if __name__ == "__main__":
    main()
