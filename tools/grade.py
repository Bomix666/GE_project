from PIL import Image, ImageOps, ImageFilter, ImageEnhance, ImageChops
import sys
def lut(stops):
    out=[]
    for i in range(256):
        t=i/255
        for (a,ca),(b,cb) in zip(stops,stops[1:]):
            if a<=t<=b:
                k=(t-a)/(b-a) if b>a else 0
                out.append(tuple(int(ca[j]+(cb[j]-ca[j])*k) for j in range(3))); break
    return out
STOPS=[(0,(5,5,6)),(0.30,(40,6,8)),(0.58,(190,22,30)),(0.80,(236,70,60)),(1,(248,240,232))]
L=lut(STOPS)
def grade(src,dst,w=None,mix=0.18,q=78):
    im=Image.open(src).convert('RGB')
    if w and im.width>w: im=im.resize((w,int(im.height*w/im.width)),Image.LANCZOS)
    g=ImageOps.autocontrast(im.convert('L'),cutoff=1)
    g=ImageEnhance.Contrast(g).enhance(1.12)
    r=Image.new('RGB',g.size); px=[L[v] for v in g.getdata()]; r.putdata(px)
    # keep a hint of original (desaturated) for realism
    o=ImageEnhance.Color(im).enhance(0.25)
    out=Image.blend(r,o,mix)
    out.save(dst,'WEBP',quality=q,method=6)
if __name__=='__main__':
    grade(sys.argv[1],sys.argv[2])
