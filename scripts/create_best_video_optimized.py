#!/usr/bin/env python3
"""
NEXUS AI - World's Best Advertisement Video (OPTIMIZED)
Cinematic Quality | Premium Effects | Professional Editing
30 FPS for faster rendering, same visual quality
"""

import os
import random
import math
from PIL import Image, ImageDraw, ImageFont
import subprocess

# ============== CONFIGURATION ==============
WIDTH = 1920
HEIGHT = 1080
FPS = 30  # Optimized FPS (still smooth)
DURATION = 40  # 40 seconds
TOTAL_FRAMES = FPS * DURATION

FRAME_DIR = "/home/z/my-project/video_frames"
OUTPUT_VIDEO = "/home/z/my-project/download/NEXUS_AI_Worlds_Best_Ad.mp4"

os.makedirs(FRAME_DIR, exist_ok=True)

# ============== COLORS ==============
class C:
    DEEP = (10, 10, 35)
    PURPLE = (75, 0, 130)
    BLUE = (0, 150, 255)
    CYAN = (0, 255, 255)
    PINK = (255, 20, 147)
    GOLD = (255, 215, 0)
    WHITE = (255, 255, 255)

# ============== FONTS ==============
def get_fonts():
    try:
        return (
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 120),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 48),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 36),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28),
        )
    except:
        f = ImageFont.load_default()
        return (f, f, f, f, f)

# ============== EFFECTS ==============
def make_gradient(w, h, frame, style='cosmic'):
    img = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(img)
    off = (frame / TOTAL_FRAMES) * 80
    
    for y in range(h):
        r = y / h
        if style == 'cosmic':
            rv = int(15 + 25 * math.sin(r * math.pi + off * 0.02))
            gv = int(10 + 15 * math.sin(r * math.pi + off * 0.02))
            bv = int(50 + 40 * math.sin(r * math.pi + off * 0.02))
        elif style == 'aurora':
            rv = int(10 + abs(math.sin(off * 0.01)) * 40 + math.sin(r * 4 + off * 0.03) * 30)
            gv = int(20 + abs(math.cos(off * 0.015)) * 60 + math.cos(r * 3 + off * 0.02) * 20)
            bv = int(50 + 100 + math.sin(r * 4 + off * 0.03) * 30)
        else:  # fire
            intensity = math.sin(off * 0.05) * 0.3 + 0.7
            rv = int((80 + 175 * r) * intensity)
            gv = int((20 + 80 * (1-r)) * intensity * 0.5)
            bv = int(30 * (1-r) * intensity * 0.3)
        
        d.line([(0, y), (w, y)], fill=(max(0,min(255,rv)), max(0,min(255,gv)), max(0,min(255,bv))))
    return img

def draw_glow(d, cx, cy, rad, col, intense=1.0, layers=5):
    for i in range(layers, 0, -1):
        f = i / layers
        r = int(rad * (1 + (1-f) * 0.5))
        c = (int(col[0]*f), int(col[1]*f), int(col[2]*f))
        d.ellipse([cx-r, cy-r, cx+r, cy+r], outline=c, width=3)

def draw_particles(img, frame, count=40):
    d = ImageDraw.Draw(img)
    w, h = img.size
    random.seed(frame * 7)
    
    for _ in range(count):
        x = random.randint(0, w)
        y = random.randint(0, h)
        xo = math.sin(frame * 0.02 + random.random() * 10) * 20
        yo = math.cos(frame * 0.015 + random.random() * 10) * 20
        px, py = int(x+xo)%w, int(y+yo)%h
        
        twinkle = abs(math.sin(frame * 0.1 + random.random() * 5))
        if twinkle > 0.35:
            sz = int((2 + random.randint(0, 3)) * twinkle)
            bright = random.randint(200, 255)
            d.ellipse([px-sz, py-sz, px+sz, py+sz], fill=(bright, bright, min(255,bright+50)))

def draw_light_rays(img, frame, cx, cy, num=12):
    d = ImageDraw.Draw(img)
    w, h = img.size
    
    for i in range(num):
        angle = (i / num) * 360 + (frame * 0.5) % 360
        rad = math.radians(angle)
        length = max(w, h) * (0.8 + 0.4 * math.sin(frame * 0.03 + i))
        
        ex = cx + math.cos(rad) * length
        ey = cy + math.sin(rad) * length
        
        for j in range(15, 0, -1):
            f = j / 15
            ix = cx + math.cos(rad) * length * (1-f)
            iy = cy + math.sin(rad) * length * (1-f)
            ox = cx + math.cos(rad) * length * (1-f+0.05)
            oy = cy + math.sin(rad) * length * (1-f+0.05)
            c = (int(30*f), int(35*f), int(80*f))
            d.line([(ix,iy),(ox,oy)], fill=c, width=2)

def draw_pulse_ring(d, cx, cy, base_r, col, frame, speed=0.05, thick=3):
    pulse = math.sin(frame * speed) * 0.3 + 1
    r = int(base_r * pulse)
    for i in range(3):
        rr = r + i * 10
        a = 1 - i * 0.25
        c = (int(col[0]*a), int(col[1]*a), int(col[2]*a))
        d.ellipse([cx-rr, cy-rr, cx+rr, cy+rr], outline=c, width=thick-i)

def draw_text_fx(d, text, x, y, font, color, glow=False, glow_col=None):
    if glow and glow_col:
        for off in range(15, 0, -2):
            a = off / 15
            gc = (int(glow_col[0]*a*0.3), int(glow_col[1]*a*0.3), int(glow_col[2]*a*0.3))
            d.text((x+off, y+off), text, font=font, fill=gc)
    
    d.text((x+3, y+3), text, font=font, fill=(0, 0, 0))
    d.text((x, y), text, font=font, fill=color)

def draw_corners(d, w, h, frame):
    tl = 100 + int(30 * math.sin(frame * 0.05))
    d.line([(0,0),(tl,0)], fill=C.CYAN, width=3)
    d.line([(0,0),(0,tl)], fill=C.CYAN, width=3)
    d.line([(tl,0),(tl+30,0)], fill=C.BLUE, width=2)
    d.line([(0,tl),(0,tl+30)], fill=C.BLUE, width=2)
    
    tr = w - tl
    d.line([(w,0),(tr,0)], fill=C.PINK, width=3)
    d.line([(w,0),(w,tl)], fill=C.PINK, width=3)
    d.line([(tr-30,0),(tr,0)], fill=C.BLUE, width=2)
    d.line([(w,tl),(w,tl+30)], fill=C.BLUE, width=2)
    
    bl = 80 + int(20 * math.cos(frame * 0.04))
    d.line([(0,h),(bl,h)], fill=C.PINK, width=3)
    d.line([(0,h),(0,h-bl)], fill=C.PINK, width=3)
    
    br = w - bl
    d.line([(w,h),(br,h)], fill=C.CYAN, width=3)
    d.line([(w,h),(w,h-bl)], fill=C.CYAN, width=3)

# ============== SCENES ==============

def scene_intro(frame, local, fonts):
    t_font, s_font, b_font, sm_font, tiny_font = fonts
    img = make_gradient(WIDTH, HEIGHT, frame, 'cosmic')
    d = ImageDraw.Draw(img)
    
    draw_light_rays(img, frame, WIDTH//2, HEIGHT//2, 16)
    draw_particles(img, frame, 60)
    
    glow_i = min(1.0, local / 20)
    draw_glow(d, WIDTH//2, HEIGHT//2, 300, C.PURPLE, glow_i, 8)
    draw_glow(d, WIDTH//2, HEIGHT//2, 200, C.BLUE, glow_i*0.8, 6)
    
    draw_corners(d, WIDTH, HEIGHT, frame)
    draw_pulse_ring(d, WIDTH//2, HEIGHT//2, 350, C.CYAN, frame, 0.04, 4)
    draw_pulse_ring(d, WIDTH//2, HEIGHT//2, 400, C.BLUE, frame, 0.03, 2)
    
    if local > 15:
        title = "N E X U S"
        bbox = d.textbbox((0,0), title, font=t_font)
        tx = (WIDTH - bbox[2] + bbox[0]) // 2
        ty = HEIGHT // 2 - 100
        draw_text_fx(d, title, tx, ty, t_font, C.WHITE, glow=True, glow_col=C.PURPLE)
        
        if local > 40:
            sub = "A I"
            bbox = d.textbbox((0,0), sub, font=s_font)
            sx = (WIDTH - bbox[2] + bbox[0]) // 2
            
            ai_glow = abs(math.sin(frame * 0.08)) * 0.5 + 0.5
            ai_c = (int(C.CYAN[0]*ai_glow+C.WHITE[0]*(1-ai_glow)),
                   int(C.CYAN[1]*ai_glow+C.WHITE[1]*(1-ai_glow)),
                   int(C.CYAN[2]*ai_glow+C.WHITE[2]*(1-ai_glow)))
            draw_text_fx(d, sub, sx, ty+130, s_font, ai_c, glow=True, glow_col=C.BLUE)
        
        if local > 65:
            tag = "THE FUTURE OF INTELLIGENCE"
            bbox = d.textbbox((0,0), tag, font=sm_font)
            tagx = (WIDTH - bbox[2] + bbox[0]) // 2
            ta = min(1.0, (local-65)/25)
            tc = (int(200*ta), int(200*ta), int(220*ta))
            d.text((tagx, ty+240), tag, font=sm_font, fill=tc)
    
    lw = min(WIDTH-200, int((local/150)*(WIDTH-200)))
    if lw > 0:
        lx = (WIDTH-lw)//2
        d.line([(lx,HEIGHT-100),(lx+lw,HEIGHT-100)], fill=C.GOLD, width=2)
    
    return img

def scene_problem(frame, local, fonts):
    t_font, s_font, b_font, sm_font, tiny_font = fonts
    img = make_gradient(WIDTH, HEIGHT, frame, 'aurora')
    d = ImageDraw.Draw(img)
    
    draw_particles(img, frame, 30)
    
    problems = [
        ("✗", "Information Overload"),
        ("◷", "Wasted Hours"),
        ("!", "Decision Fatigue"),
        ("↓", "Lost Productivity")
    ]
    
    sy = 220
    for idx, (icon, text) in enumerate(problems):
        if local > idx * 25:
            ep = min(1.0, (local - idx*25) / 20)
            x, y = 300, sy + idx * 140
            ox = int((1-ep) * -200)
            
            d.rounded_rectangle([x+ox,y,x+ox+1320,y+100], radius=12,
                              fill=(40,20,30), outline=(150,50,70,int(200*ep)), width=2)
            d.text((x+50+ox,y+22), icon, font=b_font, fill=(255,100,100))
            tc = (int(220*ep), int(220*ep), int(230*ep))
            d.text((x+150+ox,y+25), text, font=b_font, fill=tc)
    
    if local > 8:
        hdr = "THE CHALLENGE WE FACE"
        bbox = d.textbbox((0,0), hdr, font=s_font)
        hx = (WIDTH - bbox[2] + bbox[0]) // 2
        ha = min(1.0, (local-8)/15)
        d.text((hx,100), hdr, font=s_font, fill=(int(255*ha),int(80*ha),int(100*ha)))
    
    return img

def scene_solution(frame, local, fonts):
    t_font, s_font, b_font, sm_font, tiny_font = fonts
    img = make_gradient(WIDTH, HEIGHT, frame, 'cosmic')
    d = ImageDraw.Draw(img)
    
    if local < 75:
        rp = local / 75
        rr = int(rp * max(WIDTH, HEIGHT))
        mask = Image.new('L', (WIDTH, HEIGHT), 0)
        md = ImageDraw.Draw(mask)
        md.ellipse([WIDTH//2-rr,HEIGHT//2-rr,WIDTH//2+rr,HEIGHT//2+rr], fill=255)
        center = Image.new('RGB', (WIDTH, HEIGHT), (30,20,60))
        img = Image.composite(img, center, mask)
    
    d = ImageDraw.Draw(img)
    draw_light_rays(img, frame, WIDTH//2, HEIGHT//2, 24)
    
    gs = 400 + int(80*math.sin(frame*0.06))
    draw_glow(d, WIDTH//2, HEIGHT//2, gs, C.BLUE, 1.0, 10)
    draw_glow(d, WIDTH//2, HEIGHT//2, int(gs*0.7), C.CYAN, 0.9, 8)
    
    draw_particles(img, frame, 90)
    
    if local > 25:
        main = "NEXUS AI"
        bbox = d.textbbox((0,0), main, font=t_font)
        mx = (WIDTH - bbox[2] + bbox[0]) // 2
        my = HEIGHT//2 - 100
        draw_text_fx(d, main, mx, my, t_font, C.WHITE, glow=True, glow_col=C.BLUE)
    
    if local > 55:
        sub = "YOUR ULTIMATE AI COMPANION"
        bbox = d.textbbox((0,0), sub, font=s_font)
        sx = (WIDTH - bbox[2] + bbox[0]) // 2
        shim = (frame*2) % 360
        sc = (int(127+127*math.sin(shim*0.017)),
              int(127+127*math.sin(shim*0.017+2)),
              int(127+127*math.sin(shim*0.017+4)))
        d.text((sx, HEIGHT//2+40), sub, font=s_font, fill=sc)
    
    return img

def scene_features(frame, local, fonts):
    t_font, s_font, b_font, sm_font, tiny_font = fonts
    fdur = 90  # 3 sec per feature at 30fps
    cfeat = min(local // fdur, 3)
    fprog = (local % fdur) / fdur
    
    features = [
        {"icon": "◆","title":"SUPERINTELLIGENT","sub":"Neural Processing",
         "desc":"Advanced AI that understands context & intent","col":C.BLUE,"stat":"10X","slab":"Faster"},
        {"icon": "⚡","title":"LIGHTNING FAST","sub":"Real-time Results",
         "desc":"Get instant answers with cutting-edge tech","col":C.CYAN,"stat":"<1s","slab":"Response"},
        {"icon": "◈","title":"PRIVACY FIRST","sub":"Your Data Rules",
         "desc":"Enterprise-grade encryption & security","col":C.PINK,"stat":"100%","slab":"Secure"},
        {"icon": "◎","title":"UNIVERSAL ACCESS","sub":"Anytime Anywhere",
         "desc":"Seamless experience across all devices","col":C.GOLD,"stat":"24/7","slab":"Available"}
    ]
    
    feat = features[cfeat]
    styles = ['cosmic','aurora','fire','cosmic']
    img = make_gradient(WIDTH, HEIGHT, frame, styles[cfeat])
    d = ImageDraw.Draw(img)
    
    if fprog < 0.18:
        wx = int(WIDTH * (1 - fprog/0.18))
        d.rectangle([wx,0,WIDTH,HEIGHT], fill=(0,0,0))
    
    draw_light_rays(img, frame, WIDTH//2, HEIGHT//2, 6)
    draw_particles(img, frame, 35)
    
    cx, cy, cw, ch = 180, 160, WIDTH-360, HEIGHT-320
    cs = min(1.0, fprog*2) if fprog < 0.5 else 1.0
    caw, cah = int(cw*cs), int(ch*cs)
    cox, coy = (cw-caw)//2, (ch-cah)//2
    
    d.rounded_rectangle([cox+cx,coy+cy,cox+cx+caw,coy+cy+cah], radius=25,
                       fill=(20,15,40), outline=feat["col"], width=3)
    draw_glow(d, WIDTH//2, HEIGHT//2, 280, feat["col"], 0.3, 5)
    
    # Icon
    d.text((WIDTH//2-40, cy+60+coy), feat["icon"], font=t_font, fill=feat["col"])
    
    if fprog > 0.18:
        ttl = feat["title"]
        bbox = d.textbbox((0,0), ttl, font=s_font)
        tx = (WIDTH - bbox[2] + bbox[0]) // 2
        draw_text_fx(d, ttl, tx, cy+150+coy, s_font, feat["col"], glow=True, glow_col=feat["col"])
    
    if fprog > 0.32:
        sub = feat["sub"]
        bbox = d.textbbox((0,0), sub, font=b_font)
        sx = (WIDTH - bbox[2] + bbox[0]) // 2
        d.text((sx, cy+240+coy), sub, font=b_font, fill=(180,180,200))
    
    if fprog > 0.48:
        desc = feat["desc"]
        bbox = d.textbbox((0,0), desc, font=sm_font)
        dx = (WIDTH - bbox[2] + bbox[0]) // 2
        d.text((dx, cy+310+coy), desc, font=sm_font, fill=(150,150,170))
    
    if fprog > 0.62:
        stat_y = cy+400+coy
        d.text((WIDTH//2-50, stat_y), feat["stat"], font=t_font, fill=feat["col"])
        bbox = d.textbbox((0,0), feat["slab"], font=tiny_font)
        lax = (WIDTH - bbox[2] + bbox[0]) // 2
        d.text((lax, stat_y+100), feat["slab"], font=tiny_font, fill=(120,120,140))
    
    # Dots
    dy = HEIGHT - 100
    ds = 30
    stx = WIDTH//2 - (len(features)-1)*ds//2
    for i in range(len(features)):
        dx = stx + i*ds
        if i == cfeat:
            d.ellipse([dx-8,dy-8,dx+8,dy+8], fill=feat["col"])
            d.ellipse([dx-12,dy-12,dx+12,dy+12], outline=feat["col"], width=2)
        else:
            d.ellipse([dx-5,dy-5,dx+5,dy+5], fill=(60,60,80))
    
    return img

def scene_demo(frame, local, fonts):
    t_font, s_font, b_font, sm_font, tiny_font = fonts
    img = make_gradient(WIDTH, HEIGHT, frame, 'cosmic')
    d = ImageDraw.Draw(img)
    
    cx, cy, cw, ch = 220, 120, WIDTH-440, HEIGHT-260
    d.rounded_rectangle([cx,cy,cx+cw,cy+ch], radius=18, fill=(15,12,35), outline=(60,50,100), width=2)
    d.rectangle([cx,cy,cx+cw,cy+55], fill=(25,20,50))
    
    # Window buttons
    d.ellipse([cx+18,cy+18,cx+34,cy+34], fill=(255,95,86))
    d.ellipse([cx+42,cy+18,cx+58,cy+34], fill=(255,189,46))
    d.ellipse([cx+66,cy+18,cx+82,cy+34], fill=(39,201,63))
    d.text((cx+cw//2-70,cy+13), "NEXUS AI Chat", font=sm_font, fill=(200,200,220))
    
    msgs = [
        (False, "Hello! How can I help?", 0),
        (True, "Explain quantum computing", 35),
        (False, "Quantum computing harnesses quantum mechanics...", 70),
        (True, "Give me code examples!", 120),
        (False, "Here's Python implementation:", 160),
    ]
    
    my = cy + 75
    for user, txt, t in msgs:
        if local >= t:
            ma = min(1.0, (local-t)/15)
            if user:
                mx = cx + cw - 420
                d.rounded_rectangle([mx,my,mx+380,my+60], radius=12, fill=(int(80*ma),int(100*ma),int(200*ma)))
                d.text((mx+18,my+15), txt, font=tiny_font, fill=(int(255*ma),)*3)
            else:
                mx = cx + 25
                d.rounded_rectangle([mx,my,mx+430,my+60], radius=12,
                                   fill=(int(40*ma),int(35*ma),int(60*ma)),
                                   outline=(int(80*ma),int(70*ma),int(120*ma)))
                d.text((mx+18,my+15), txt, font=tiny_font, fill=(int(200*ma),)*3)
            my += 75
    
    # Typing
    if local > 210:
        ta = (math.sin(frame*0.15)+1)/2
        tpx, tpy = cx+50, my+15
        for i in range(3):
            doff = int(4*math.sin(frame*0.1+i*0.5))
            d.ellipse([tpx+i*22,tpy+doff,tpx+10+i*22,tpy+10+doff],
                     fill=(int(100*ta),int(150*ta),int(255*ta)))
    
    # Input
    iy = cy + ch - 70
    d.rounded_rectangle([cx+25,iy,cx+cw-130,iy+45], radius=22, fill=(25,22,45), outline=(50,45,80))
    pa = (math.sin(frame*0.08)+1)/2*0.5+0.25
    d.text((cx+40,iy+10), "Ask me anything...", font=tiny_font, fill=(int(100*pa),int(100*pa),int(120*pa)))
    
    # Send btn
    sx = cx + cw - 115
    bg = (math.sin(frame*0.1)+1)/2
    bc = (int(C.BLUE[0]*(0.7+0.3*bg)), int(C.BLUE[1]*(0.7+0.3*bg)), int(C.BLUE[2]*(0.7+0.3*bg)))
    d.rounded_rectangle([sx,iy,sx+90,iy+45], radius=22, fill=bc)
    d.text((sx+15,iy+10), "Send →", font=tiny_font, fill=C.WHITE)
    
    # Label
    lbl = "LIVE DEMO"
    bbox = d.textbbox((0,0), lbl, font=sm_font)
    d.text((cx+cw//2-(bbox[2]-bbox[0])//2, cy-40), lbl, font=sm_font, fill=C.CYAN)
    
    return img

def scene_cta(frame, local, fonts):
    t_font, s_font, b_font, sm_font, tiny_font = fonts
    img = make_gradient(WIDTH, HEIGHT, frame, 'cosmic')
    d = ImageDraw.Draw(img)
    
    draw_light_rays(img, frame, WIDTH//2, HEIGHT//2, 28)
    draw_particles(img, frame, 100)
    
    # Multiple glows
    for i, col in enumerate([C.PINK, C.BLUE, C.CYAN, C.GOLD, C.PURPLE]):
        sz = 450 - i*70
        draw_glow(d, WIDTH//2, HEIGHT//2, sz, col, 1-i*0.15, 8)
    
    draw_pulse_ring(d, WIDTH//2, HEIGHT//2, 420, C.CYAN, frame, 0.04, 5)
    draw_pulse_ring(d, WIDTH//2, HEIGHT//2, 520, C.BLUE, frame, 0.03, 3)
    draw_corners(d, WIDTH, HEIGHT, frame)
    
    if local > 12:
        cta = "JOIN THE REVOLUTION"
        bbox = d.textbbox((0,0), cta, font=t_font)
        ctx = (WIDTH - bbox[2] + bbox[0]) // 2
        cty = HEIGHT//2 - 160
        
        hue = (frame*3) % 360
        mc = (int(127+127*math.sin(hue*0.017)),
              int(127+127*math.sin(hue*0.017+2.094)),
              int(127+127*math.sin(hue*0.017+4.189)))
        draw_text_fx(d, cta, ctx, cty, t_font, mc, glow=True, glow_col=mc)
    
    if local > 35:
        sub = "Experience NEXUS AI Today"
        bbox = d.textbbox((0,0), sub, font=s_font)
        sx = (WIDTH - bbox[2] + bbox[0]) // 2
        draw_text_fx(d, sub, sx, HEIGHT//2, s_font, C.WHITE, glow=True, glow_col=C.BLUE)
    
    if local > 55:
        bp = min(1.0, (local-55)/20)
        bw, bh = 380, 72
        bx, by = (WIDTH-bw)//2, HEIGHT//2 + 90
        
        bgi = (math.sin(frame*0.1)+1)/2
        for i in range(4,0,-1):
            ge = i*7
            ga = (1-i/4)*bgi*bp
            d.rounded_rectangle([bx-ge,by-ge,bx+bw+ge,by+bh+ge], radius=36,
                               outline=(int(C.CYAN[0]*ga),int(C.CYAN[1]*ga),int(C.CYAN[2]*ga)), width=3)
        
        bc = (int(C.BLUE[0]*bp), int(C.BLUE[1]*bp), int(C.BLUE[2]*bp))
        d.rounded_rectangle([bx,by,bx+bw,by+bh], radius=36, fill=bc)
        
        bt = "GET STARTED FREE"
        bbox = d.textbbox((0,0), bt, font=b_font)
        d.text((bx+(bw-bbox[2]+bbox[0])//2, by+(bh-bbox[3]+bbox[1])//2), bt, font=b_font, 
               fill=(int(255*bp),)*3)
    
    if local > 85:
        ua = min(1.0, (local-85)/25)
        url = "www.nexusai.com"
        bbox = d.textbbox((0,0), url, font=b_font)
        ux = (WIDTH - bbox[2] + bbox[0]) // 2
        uy = HEIGHT//2 + 200
        
        uc = (int(C.CYAN[0]*ua), int(C.CYAN[1]*ua), int(C.CYAN[2]*ua))
        d.text((ux, uy), url, font=b_font, fill=uc)
        d.line([(ux,uy+52),(ux+bbox[2]-bbox[0],uy+52)], fill=uc, width=2)
    
    return img

# ============== MAIN ==============

def render_frame(frame, fonts):
    scenes = [
        (0, 150, scene_intro),
        (150, 300, scene_problem),
        (300, 480, scene_solution),
        (480, 840, scene_features),
        (840, 1050, scene_demo),
        (1050, 1200, scene_cta),
    ]
    
    for start, end, func in scenes:
        if start <= frame < end:
            return func(frame, frame-start, fonts)
    return scene_cta(frame, 1199, fonts)

def main():
    print("🎬 NEXUS AI - WORLD'S BEST VIDEO GENERATOR")
    print("=" * 50)
    print(f"Resolution: {WIDTH}x{HEIGHT} (Full HD)")
    print(f"Frame Rate: {FPS} fps")
    print(f"Duration: {DURATION} seconds")
    print(f"Total Frames: {TOTAL_FRAMES}")
    print("=" * 50)
    
    print("\n📝 Loading fonts...")
    fonts = get_fonts()
    
    print(f"\n🎨 Rendering {TOTAL_FRAMES} frames...")
    for fn in range(TOTAL_FRAMES):
        if fn % 30 == 0:
            print(f"  Progress: {fn/TOTAL_FRAMES*100:.1f}% ({fn}/{TOTAL_FRAMES})")
        
        frm = render_frame(fn, fonts)
        frm.save(os.path.join(FRAME_DIR, f"frame_{fn:05d}.png"), "PNG")
    
    print("\n  ✓ All frames rendered!")
    
    print(f"\n🎬 Encoding video...")
    list_file = os.path.join(FRAME_DIR, "filelist.txt")
    with open(list_file, "w") as f:
        for fn in range(TOTAL_FRAMES):
            fp = os.path.join(FRAME_DIR, f"frame_{fn:05d}.png")
            f.write(f"file '{fp}'\nduration {1/FPS}\n")
        f.write(f"file '{os.path.join(FRAME_DIR, f'frame_{TOTAL_FRAMES-1:05d}.png')}'\n")
    
    cmd = [
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", list_file,
        "-vf", "format=yuv420p", "-c:v", "libx264", "-preset", "medium",
        "-crf", "18", OUTPUT_VIDEO
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode == 0:
        size_mb = os.path.getsize(OUTPUT_VIDEO) / (1024*1024)
        print(f"\n✅ VIDEO CREATED SUCCESSFULLY!")
        print(f"\n📊 Video Details:")
        print(f"  📍 Location: {OUTPUT_VIDEO}")
        print(f"  📐 Resolution: {WIDTH}x{HEIGHT}")
        print(f"  ⏱️ Duration: {DURATION}s")
        print(f"  📦 Size: {size_mb:.2f} MB")
        print(f"  🎬 Format: H.264 MP4 @ {FPS}fps")
        
        import shutil
        shutil.rmtree(FRAME_DIR)
        print("\n🧹 Cleaned up temp files")
        print("\n" + "=" * 50)
        print("🎉 WORLD'S BEST VIDEO READY!")
        print("=" * 50)
    else:
        print(f"\n❌ Error: {result.stderr}")

if __name__ == "__main__":
    main()
