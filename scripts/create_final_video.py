#!/usr/bin/env python3
"""NEXUS AI - Best Video Generator - Simple & Fast"""
import os, math, random
from PIL import Image, ImageDraw, ImageFont
import subprocess

W, H = 1280, 720
FPS, DUR = 24, 15
TOTAL = FPS * DUR
DIR = "/home/z/my-project/vid_frames"
OUT = "/home/z/my-project/download/NEXUS_AI_Worlds_Best_Ad.mp4"
os.makedirs(DIR, exist_ok=True)

def fnt():
    try:
        return (ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 72),
                ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 44),
                ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28))
    except: return (ImageFont.load_default(),)*3

def mk_bg(fr):
    im = Image.new('RGB', (W,H), (12,8,32))
    d = ImageDraw.Draw(im)
    for y in range(0,H,4):
        r = y/H
        c = (int(12+18*math.sin(r*3.14+fr*0.04)), int(8+12*math.sin(r*3.14+fr*0.04)), int(32+28*math.sin(r*3.14+fr*0.04)))
        d.line([(0,y),(W,y)], fill=c)
    return im

def draw_glow(d,cx,cy,r,col,intensity=1.0):
    for i in range(4,0,-1):
        f=i/4; rr=int(r*(1+(1-f)*0.35))*intensity
        c=(int(col[0]*f),int(col[1]*f),int(col[2]*f))
        d.ellipse([cx-rr,cy-rr,cx+rr,cy+rr],outline=c,width=2)

def draw_txt(d,t,x,y,f,c,glo=None):
    if glo:
        for o in range(10,0,-2):
            a=o/10; gc=(int(glo[0]*a*0.2),int(glo[1]*a*0.2),int(glo[2]*a*0.2))
            d.text((x+o,y+o),t,font=f,fill=gc)
    d.text((x+2,y+2),t,font=f,fill=(0,0,0)); d.text((x,y),t,font=f,fill=c)

# Scene functions
def scene_intro(fr,loc,ft):
    tf,sf,bf=ft; im=mk_bg(fr); d=ImageDraw.Draw(im)
    
    # Central glow
    gi=min(1,loc/12)
    draw_glow(d,W//2,H//2,180,(100,0,150),gi)
    draw_glow(d,W//2,H//2,120,(0,140,255),gi*0.85)
    
    # Pulsing ring
    p=math.sin(fr*0.06)*0.22+1
    rr=int(220*p); col=(0,230,255)
    for i in range(3):
        ri=rr+i*6; a=1-i*0.25; c=(int(col[0]*a),int(col[1]*a),int(col[2]*a))
        d.ellipse([W//2-ri,H//2-ri,W//2+ri,H//2+ri],outline=c,width=2)
    
    if loc>8:
        draw_txt(d,"N E X U S",(W-380)//2,H//2-55,tf,(255,255,255),glo=(100,0,150))
    if loc>22:
        draw_txt(d,"A  I",(W-100)//2,H//2+25,sf,(0,230,255),glo=(0,140,255))
    if loc>38:
        ta=min(1,(loc-38)/14); c=(int(190*ta),int(190*ta),int(210*ta))
        d.text(((W-320)//2,H//2+90),"THE FUTURE OF INTELLIGENCE",font=bf,fill=c)
    return im

def scene_features(fr,loc,ft):
    tf,sf,bf=ft; fdur=72; cf=min(loc//fdur,3); fp=(loc%fdur)/fdur
    
    feats=[("◆","SUPERINTELLIGENT","Advanced AI",(0,140,255),"10X"),
           ("⚡","LIGHTNING FAST","Instant results",(0,230,255),"<1s"),
           ("◈","PRIVACY FIRST","Secure & safe",(255,30,150),"100%"),
           ("◎","ANYWHERE ACCESS","All devices",(255,200,0),"24/7")]
    
    ic,ttl,dsc,col,st=feats[cf]
    im=mk_bg(fr); d=ImageDraw.Draw(im)
    
    # Card
    cx,cy,cw,ch=120,100,W-240,H-200
    cs=min(1,fp*2) if fp<0.45 else 1
    aw,ah=int(cw*cs),int(ch*cs)
    ox,oy=(cw-aw)//2,(ch-ah)//2
    
    d.rounded_rectangle([ox+cx,oy+cy,ox+cx+aw,oy+cy+ah],radius=18,
                       fill=(18,13,36),outline=col,width=3)
    draw_glow(d,W//2,H//2,160,col,0.26)
    
    # Content
    if fp>0.14:
        draw_txt(d,ic,W//2-20,oy+cy+40,tf,col)
    if fp>0.28:
        bb=d.textbbox((0,0),ttl,font=sf)
        draw_txt(d,ttl,(W-bb[2]+bb[0])//2,oy+cy+115,sf,col,glo=col)
    if fp>0.44:
        bb=d.textbbox((0,0),dsc,font=bf)
        d.text(((W-bb[2]+bb[0])//2,oy+cy+175),dsc,font=bf,fill=(145,145,165))
    if fp>0.58:
        draw_txt(d,st,W//2-35,oy+cy+235,tf,col)
    
    # Dots
    dy=H-65; sp=22; sx=W//2-(len(feats)-1)*sp//2
    for i in range(len(feats)):
        dx=sx+i*sp
        if i==cf: d.ellipse([dx-5,dy-5,dx+5,dy+5],fill=col)
        else: d.ellipse([dx-4,dy-4,dx+4,dy+4],fill=(50,50,70))
    return im

def scene_cta(fr,loc,ft):
    tf,sf,bf=ft; im=mk_bg(fr); d=ImageDraw.Draw(im)
    
    # Big glows
    for i,c in enumerate([(255,30,150),(0,140,255),(0,230,255),(255,200,0)]):
        draw_glow(d,W//2,H//2,260-i*40,c,1-i*0.18)
    
    if loc>6:
        hue=(fr*3)%360
        mc=(int(127+127*math.sin(hue*0.017)),int(127+127*math.sin(hue*0.017+2.09)),int(127+127*math.sin(hue*0.017+4.19)))
        draw_txt(d,"JOIN THE REVOLUTION",(W-520)//2,H//2-90,tf,mc,glo=mc)
    if loc>18:
        draw_txt(d,"Experience NEXUS AI Today",(W-340)//2,H//2-10,sf,(255,255,255),glo=(0,140,255))
    if loc>32:
        bp=min(1,(loc-32)/14); bw,bh=260,52; bx,by=(W-bw)//2,H//2+48
        bgi=(math.sin(fr*0.12)+1)/2
        for i in range(3,0,-1):
            ge=i*5; ga=(1-i/3)*bgi*bp
            d.rounded_rectangle([bx-ge,by-ge,bx+bw+ge,by+bh+ge],radius=26,
                               outline=(int(0*ga),int(230*ga),int(255*ga)),width=2)
        bc=(int(0*bp),int(140*bp),int(255*bp))
        d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=26,fill=bc)
        bt="GET STARTED FREE"; bb=d.textbbox((0,0),bt,font=bf)
        d.text((bx+(bw-bb[2]+bb[0])//2,by+(bh-bb[3]+bb[1])//2),bt,font=bf,fill=(255,255,255))
    if loc>50:
        ua=min(1,(loc-50)/12); url="nexusai.com"; bb=d.textbbox((0,0),url,font=bf)
        ux=(W-bb[2]+bb[0])//2; uy=H//2+125
        uc=(int(0*ua),int(230*ua),int(255*ua))
        d.text((ux,uy),url,font=bf,fill=uc)
        d.line([(ux,uy+36),(ux+bb[2]-bb[0],uy+36)],fill=uc,width=2)
    return im

def render(fr,ft):
    scns=[(0,108,scene_intro),(108,360,scene_features),(360,9999,scene_cta)]
    for s,e,fn in scns:
        if s<=fr<e: return fn(fr,fr-s,ft)
    return scene_cta(fr,359,ft)

print("🎬 NEXUS AI - WORLD'S BEST VIDEO")
print(f"{W}x{H} @ {FPS}fps | {DUR}s | {TOTAL} frames")

ft=fnt()
print("🎨 Rendering...")
for f in range(TOTAL):
    if f%24==0: print(f"  {f/TOTAL*100:.0f}%")
    render(f,ft).save(os.path.join(DIR,f"f{f:03d}.png"))

print("🎬 Encoding video...")
lst=os.path.join(DIR,"lst.txt")
with open(lst,"w") as fl:
    for f in range(TOTAL):
        fl.write(f"file '{os.path.join(DIR,f'f{f:03d}.png')}'\nduration {1/FPS}\n")
    fl.write(f"file '{os.path.join(DIR,f'f{TOTAL-1:03d}.png')}'\n")

subprocess.run(["ffmpeg","-y","-f","concat","-safe","0","-i",lst,
               "-vf","format=yuv420p","-c:v","libx264","-preset","fast",
               "-crf","20",OUT],capture_output=True)

sz=os.path.getsize(OUT)/(1024*1024)
print(f"\n✅ VIDEO READY!")
print(f"   📍 {OUT}")
print(f"   📐 {W}x{H} | ⏱️ {DUR}s | 📦 {sz:.1f}MB")
import shutil; shutil.rmtree(DIR)
print("🎉 DONE!")
