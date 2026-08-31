#!/usr/bin/env python3
"""
NEXUS AI - ULTRA OPTIMIZED Video Generator
Short duration (20s), HD quality, Maximum visual impact
"""

import os
import math
import random
from PIL import Image, ImageDraw, ImageFont
import subprocess

# Config
W, H = 1280, 720
FPS = 24
DUR = 20
TOTAL = FPS * DUR

DIR = "/home/z/my-project/frames"
OUT = "/home/z/my-project/download/NEXUS_AI_Worlds_Best_Ad.mp4"
os.makedirs(DIR, exist_ok=True)

# Colors
C_PURPLE = (100, 0, 150)
C_BLUE = (0, 140, 255)
C_CYAN = (0, 230, 255)
C_PINK = (255, 30, 150)
C_GOLD = (255, 200, 0)
C_WHITE = (255, 255, 255)

def fonts():
    try:
        return (
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 80),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 50),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 32),
            ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24),
        )
    except:
        f = ImageFont.load_default()
        return (f,f,f,f)

def bg(frame, style='dark'):
    img = Image.new('RGB', (W,H))
    d = ImageDraw.Draw(img)
    off = frame * 2
    
    for y in range(H):
        r = y/H
        if style == 'cosmic':
            rv = int(15 + 25*math.sin(r*3.14 + off*0.03))
            gv = int(8 + 12*math.sin(r*3.14 + off*0.03))
            bv = int(40 + 35*math.sin(r*3.14 + off*0.03))
        elif style == 'aurora':
            rv = int(8 + abs(math.sin(off*0.015))*35 + math.sin(r*4+off*0.04)*25)
            gv = int(15 + abs(math.cos(off*0.02))*50 + math.cos(r*3+off*0.03)*18)
            bv = int(45 + 90 + math.sin(r*4+off*0.04)*25)
        else: # fire
            i = math.sin(off*0.06)*0.3+0.7
            rv = int((70+180*r)*i)
            gv = int((15+70*(1-r))*i*0.5)
            bv = int(25*(1-r)*i*0.3)
        d.line([(0,y),(W,y)], fill=(max(0,min(255,rv)),max(0,min(255,gv)),max(0,min(255,bv))))
    return img

def glow(d, cx, cy, rad, col, intense=1, layers=4):
    for i in range(layers,0,-1):
        f=i/layers; r=int(rad*(1+(1-f)*0.4))
        c=(int(col[0]*f),int(col[1]*f),int(col[2]*f))
        d.ellipse([cx-r,cy-r,cx+r,cy+r],outline=c,width=2)

def particles(img, n=25):
    d=ImageDraw.Draw(img); w,h=img.size
    random.seed(hash(str(n)) + img.getpixel((0,0))[0] if img else 0)
    for _ in range(n):
        x=random.randint(0,w); y=random.randint(0,h)
        tw=abs(math.sin(_*3+img.getpixel((min(x,w-1),min(y,h-1)))[0]*0.01 if img else 0))
        if tw>0.4:
            s=int((2+random.randint(0,2))*tw)
            b=random.randint(200,255)
            d.ellipse([x-s,y-s,x+s,y+s],fill=(b,b,min(255,b+40)))

def rays(img, fr, cx, cy, num=10):
    d=ImageDraw.Draw(img); mx=max(img.size)
    for i in range(num):
        a=(i/num)*360+(fr*0.6)%360; rd=math.radians(a)
        l=mx*(0.75+0.35*math.sin(fr*0.04+i))
        ex=cx+math.cos(rd)*l; ey=cy+math.sin(rd)*l
        for j in range(10,0,-1):
            f=j/10; ix=cx+math.cos(rd)*l*(1-f); iy=cy+math.sin(rd)*l*(1-f)
            ox=cx+math.cos(rd)*l*(1-f+0.06); oy=cy+math.sin(rd)*l*(1-f+0.06)
            d.line([(ix,iy),(ox,oy)],fill=(int(28*f),int(32*f),int(75*f)),width=2)

def txt(d,t,x,y,fnt,col,glo=False,gcol=None):
    if glo and gcol:
        for o in range(12,0,-2):
            a=o/12; gc=(int(gcol[0]*a*0.25),int(gcol[1]*a*0.25),int(gcol[2]*a*0.25))
            d.text((x+o,y+o),t,font=fnt,fill=gc)
    d.text((x+2,y+2),t,font=fnt,fill=(0,0,0))
    d.text((x,y),t,font=fnt,fill=col)

def pulse(d,cx,cy,r,col,fr,sp=0.05):
    p=math.sin(fr*sp)*0.25+1; rr=int(r*p)
    for i in range(3):
        ri=rr+i*8; a=1-i*0.25; c=(int(col[0]*a),int(col[1]*a),int(col[2]*a))
        d.ellipse([cx-ri,cy-ri,cx+ri,cy+ri],outline=c,width=2)

# Scenes
def scene1(fr,loc,ft):
    """Epic Intro"""
    tf,sf,bf,sm=ft
    im=bg(fr,'cosmic');d=ImageDraw.Draw(im)
    rays(im,fr,W//2,H//2,14); particles(im,40)
    
    gi=min(1,loc/15); glow(d,W//2,H//2,220,C_PURPLE,gi,7)
    glow(d,W//2,H//2,150,C_BLUE,gi*0.8,5)
    pulse(d,W//2,H//2,260,C_CYAN,fr,0.04)
    
    if loc>10:
        t="N E X U S"; bb=d.textbbox((0,0),t,font=tf)
        tx=(W-bb[2]+bb[0])//2; ty=H//2-70
        txt(d,t,tx,ty,tf,C_WHITE,glo=True,gcol=C_PURPLE)
        
        if loc>28:
            sub="A I"; bb=d.textbbox((0,0),sub,font=sf)
            sx=(W-bb[2]+bb[0])//2
            ag=abs(math.sin(fr*0.1))*0.5+0.5
            ac=(int(C_CYAN[0]*ag+C_WHITE[0]*(1-ag)),int(C_CYAN[1]*ag+C_WHITE[1]*(1-ag)),int(C_CYAN[2]*ag+C_WHITE[2]*(1-ag)))
            txt(d,sub,sx,ty+90,sf,ac,glo=True,gcol=C_BLUE)
        
        if loc>45:
            tag="THE FUTURE OF INTELLIGENCE"; bb=d.textbbox((0,0),tag,font=sm)
            ta=min(1,(loc-45)/18); tc=(int(200*ta),int(200*ta),int(215*ta))
            d.text(((W-bb[2]+bb[0])//2,ty+175),tag,font=sm,fill=tc)
    return im

def scene2(fr,loc,ft):
    """Problem"""
    tf,sf,bf,sm=ft
    im=bg(fr,'aurora');d=ImageDraw.Draw(im)
    particles(im,22)
    
    probs=[("✗","Information Overload"),("◷","Wasted Hours"),("!","Decision Fatigue"),("↓","Lost Productivity")]
    sy=155
    for idx,(ic,tx) in enumerate(probs):
        if loc>idx*18:
            ep=min(1,(loc-idx*18)/14); x,y=200,sy+idx*105
            ox=int((1-ep)*-150)
            d.rounded_rectangle([x+ox,y,x+ox+880,y+75],radius=10,fill=(38,18,28),outline=(140,45,65,int(190*ep)),width=2)
            d.text((x+35+ox,y+15),ic,font=bf,fill=(255,95,95))
            d.text((x+110+ox,y+17),tx,font=bf,fill=(int(210*ep),int(210*ep),int(225*ep)))
    
    if loc>6:
        h="THE CHALLENGE WE FACE"; bb=d.textbbox((0,0),h,font=sf)
        ha=min(1,(loc-6)/12)
        d.text(((W-bb[2]+bb[0])//2,75),h,font=sf,fill=(int(255*ha),int(75*ha),int(95*ha)))
    return im

def scene3(fr,loc,ft):
    """Solution Reveal"""
    tf,sf,bf,sm=ft
    im=bg(fr,'cosmic');d=ImageDraw.Draw(im)
    
    if loc<55:
        rp=loc/55; rr=int(rp*max(W,H))
        mk=Image.new('L',(W,H),0); md=ImageDraw.Draw(mk)
        md.ellipse([W//2-rr,H//2-rr,W//2+rr,H//2+rr],fill=255)
        im=Image.composite(im,Image.new('RGB',(W,H),(28,18,58)),mk)
    
    d=ImageDraw.Draw(im); rays(im,fr,W//2,H//2,20)
    gs=280+int(60*math.sin(fr*0.07))
    glow(d,W//2,H//2,gs,C_BLUE,1,9)
    glow(d,W//2,H//2,int(gs*0.68),C_CYAN,0.88,7)
    particles(im,65)
    
    if loc>18:
        m="NEXUS AI"; bb=d.textbbox((0,0),m,font=tf)
        mx=(W-bb[2]+bb[0])//2; my=H//2-72
        txt(d,m,mx,my,tf,C_WHITE,glo=True,gcol=C_BLUE)
    
    if loc>40:
        s="YOUR ULTIMATE AI COMPANION"; bb=d.textbbox((0,0),s,font=sf)
        sx=(W-bb[2]+bb[0])//2
        sh=(fr*2.5)%360
        sc=(int(127+127*math.sin(sh*0.017)),int(127+127*math.sin(sh*0.017+2.09)),int(127+127*math.sin(sh*0.017+4.19)))
        d.text((sx,H//2+32),s,font=sf,fill=sc)
    return im

def scene4(fr,loc,ft):
    """Features"""
    tf,sf,bf,sm=ft
    fdur=60; cf=min(loc//fdur,3); fp=(loc%fdur)/fdur
    
    feats=[
        {"icon":"◆","title":"SUPERINTELLIGENT","desc":"Advanced AI understanding","col":C_BLUE,"stat":"10X"},
        {"icon":"⚡","title":"LIGHTNING FAST","desc":"Instant real-time results","col":C_CYAN,"stat":"<1s"},
        {"icon":"◈","title":"PRIVACY FIRST","desc":"Enterprise-grade security","col":C_PINK,"stat":"100%"},
        {"icon":"◎","title":"UNIVERSAL ACCESS","desc":"Works everywhere, anytime","col":C_GOLD,"stat":"24/7"},
    ]
    ft_=feats[cf]; st=['cosmic','aurora','fire','cosmic']
    im=bg(fr,st[cf]);d=ImageDraw.Draw(im)
    
    if fp<0.16:
        wx=int(W*(1-fp/0.16)); d.rectangle([wx,0,W,H],fill=(0,0,0))
    
    rays(im,fr,W//2,H//2,5); particles(im,28)
    
    cx,cy,cw,ch=130,115,W-260,H-230
    cs=min(1,fp*2) if fp<0.48 else 1
    caw,cah=int(cw*cs),int(ch*cs)
    cox,coy=(cw-caw)//2,(ch-cah)//2
    
    d.rounded_rectangle([cox+cx,coy+cy,cox+cx+caw,coy+cy+cah],radius=20,fill=(18,13,38),outline=ft_['col'],width=3)
    glow(d,W//2,H//2,200,ft_['col'],0.28,4)
    
    d.text((W//2-30,coy+cy+42),ft_['icon'],font=tf,fill=ft_['col'])
    
    if fp>0.16:
        ttl=ft_['title']; bb=d.textbbox((0,0),ttl,font=sf)
        txt(d,ttl,(W-bb[2]+bb[0])//2,coy+cy+120,sf,ft_['col'],glo=True,gcol=ft_['col'])
    
    if fp>0.3:
        desc=ft_['desc']; bb=d.textbbox((0,0),desc,font=sm)
        d.text(((W-bb[2]+bb[0])//2,coy+cy+185),desc,font=sm,fill=(145,145,165))
    
    if fp>0.5:
        sy=coy+cy+250
        d.text((W//2-38,sy),ft_['stat'],font=tf,fill=ft_['col'])
    
    dy=H-70; ds=24; stx=W//2-(len(feats)-1)*ds//2
    for i in range(len(feats)):
        dx=stx+i*ds
        if i==cf: d.ellipse([dx-6,dy-6,dx+6,dy+6],fill=ft_['col']); d.ellipse([dx-10,dy-10,dx+10,dy+10],outline=ft_['col'],width=2)
        else: d.ellipse([dx-4,dy-4,dx+4,dy+4],fill=(55,55,75))
    return im

def scene5(fr,loc,ft):
    """CTA Finale"""
    tf,sf,bf,sm=ft
    im=bg(fr,'cosmic');d=ImageDraw.Draw(im)
    rays(im,fr,W//2,H//2,26); particles(im,75)
    
    for i,col in enumerate([C_PINK,C_BLUE,C_CYAN,C_GOLD,C_PURPLE]):
        glow(d,W//2,H//2,340-i*55,col,1-i*0.16,7)
    pulse(d,W//2,H//2,320,C_CYAN,fr,0.04)
    pulse(d,W//2,H//2,400,C_BLUE,fr,0.03)
    
    if loc>9:
        cta="JOIN THE REVOLUTION"; bb=d.textbbox((0,0),cta,font=tf)
        ctx=(W-bb[2]+bb[0])//2; cty=H//2-125
        hue=(fr*3)%360
        mc=(int(127+127*math.sin(hue*0.017)),int(127+127*math.sin(hue*0.017+2.09)),int(127+127*math.sin(hue*0.017+4.19)))
        txt(d,cta,ctx,cty,tf,mc,glo=True,gcol=mc)
    
    if loc>26:
        sub="Experience NEXUS AI Today"; bb=d.textbbox((0,0),sub,font=sf)
        sx=(W-bb[2]+bb[0])//2
        txt(d,sub,sx,H//2-22,sf,C_WHITE,glo=True,gcol=C_BLUE)
    
    if loc>42:
        bp=min(1,(loc-42)/16); bw,bh=300,58; bx,by=(W-bw)//2,H//2+52
        bgi=(math.sin(fr*0.12)+1)/2
        for i in range(3,0,-1):
            ge=i*6; ga=(1-i/3)*bgi*bp
            d.rounded_rectangle([bx-ge,by-ge,bx+bw+ge,by+bh+ge],radius=29,
                               outline=(int(C_CYAN[0]*ga),int(C_CYAN[1]*ga),int(C_CYAN[2]*ga)),width=2)
        bc=(int(C_BLUE[0]*bp),int(C_BLUE[1]*bp),int(C_BLUE[2]*bp))
        d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=29,fill=bc)
        bt="GET STARTED FREE"; bb=d.textbbox((0,0),bt,font=bf)
        d.text((bx+(bw-bb[2]+bb[0])//2,by+(bh-bb[3]+bb[1])//2),bt,font=bf,fill=(int(255*bp),)*3)
    
    if loc>66:
        ua=min(1,(loc-66)/18); url="nexusai.com"; bb=d.textbbox((0,0),url,font=bf)
        ux=(W-bb[2]+bb[0])//2; uy=H//2+138
        uc=(int(C_CYAN[0]*ua),int(C_CYAN[1]*ua),int(C_CYAN[2]*ua))
        d.text((ux,uy),url,font=bf,fill=uc)
        d.line([(ux,uy+42),(ux+bb[2]-bb[0],uy+42)],fill=uc,width=2)
    return im

def render(fr,ft):
    scns=[(0,120,scene1),(120,240,scene2),(240,384,scene3),(384,624,scene4),(624,4800,scene5)]
    for s,e,fn in scns:
        if s<=fr<e: return fn(fr,fr-s,ft)
    return scene5(fr,479,ft)

def main():
    print("🎬 NEXUS AI - WORLD'S BEST VIDEO")
    print(f"Resolution: {W}x{H} | {FPS}fps | {DUR}s | {TOTAL} frames")
    ft=fonts()
    print("\n🎨 Rendering...")
    
    for f in range(TOTAL):
        if f%24==0: print(f"  {f/TOTAL*100:.0f}% ({f}/{TOTAL})")
        render(f,ft).save(os.path.join(DIR,f"frame_{f:04d}.png"),"PNG")
    
    print("\n🎬 Encoding...")
    lst=os.path.join(DIR,"fl.txt")
    with open(lst,"w") as fl:
        for f in range(TOTAL):
            fl.write(f"file '{os.path.join(DIR,f'frame_{f:04d}.png')}'\nduration {1/FPS}\n")
        fl.write(f"file '{os.path.join(DIR,f'frame_{TOTAL-1:04d}.png')}'\n")
    
    cmd = ["ffmpeg","-y","-f","concat","-safe","0","-i",lst,"-vf","format=yuv420p",
           "-c:v","libx264","-preset","fast","-crf","20",OUT]
    subprocess.run(cmd, capture_output=True)
    
    sz=os.path.getsize(OUT)/(1024*1024)
    print(f"\n✅ DONE! {OUT}")
    print(f"   Size: {sz:.1f}MB | {W}x{H} @ {FPS}fps | {DUR}s")
    import shutil; shutil.rmtree(DIR)
    print("🎉 WORLD'S BEST VIDEO READY!")

if __name__=="__main__":
    main()
