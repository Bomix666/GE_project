import re,html,os,json
def txt(x): return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',x))).strip()
cats=json.load(open('cats_full.json',encoding='utf-8'))
listinfo={}
for c in cats.values():
    for i in c['_items']: listinfo.setdefault(i['id'],i)
slug2id={v['slug']:k for k,v in listinfo.items()}
ALLOWED={'p','strong','b','em','i','ul','ol','li','br','a','h3','h4','table','tr','td','th','tbody','thead'}
def sanitize(h):
    h=re.sub(r'<(script|style|iframe)[^>]*>.*?</\1>','',h,flags=re.S|re.I)
    def tag(m):
        close,name,attrs=m.group(1),m.group(2).lower(),m.group(3) or ''
        if name not in ALLOWED: return ''
        if name=='a' and not close:
            href=re.search(r'href="([^"]+)"',attrs)
            href=href.group(1) if href else '#'
            href=href.replace('https://globaleffects.ru','').replace('http://globaleffects.ru','')
            ext=href.startswith('http')
            return f'<a href="{html.escape(href,quote=True)}"'+(' target="_blank" rel="noopener"' if ext else '')+'>'
        return f'<{close}{name}>'
    h=re.sub(r'<(/?)([a-zA-Z0-9]+)([^>]*)>',tag,h)
    h=h.replace('&nbsp;',' ')
    h=re.sub(r'<p>\s*</p>','',h); h=re.sub(r'\s+',' ',h)
    return h.strip()
products={}
for pid,li in listinfo.items():
    s=open(f"prods/{li['slug']}.html",encoding='utf-8').read()
    head=s[s.find('<section class="product-heading">'):]
    crumbs=re.findall(r'<a href="(?:https://globaleffects\.ru)?/category/([^"]+)" itemprop="item">',head[:4000])
    sub=re.search(r'<div class="striking-text">.*?<div class="text">(.*?)</div>',s,re.S)
    price=re.search(r'itemprop="price" content="(\d+)"',s)
    offer=head[head.find('class="offer"'):head.find('</section>')]
    if 'cart_add(' in offer: avail='in_stock'
    elif 'product_demand_click' in offer: avail='on_order'
    else: avail='request'
    img=re.search(r'<div class="img-block">\s*<img src="([^"]+)"',head)
    files=[dict(title=txt(t),url=u) for u,t in re.findall(r'<li><a href="(/document/get\?id=\d+)"[^>]*>(.*?)</a></li>',s)]
    d=re.search(r'itemprop="description">(.*?)</div>\s*<div class="specific',s,re.S)
    desc=sanitize(d.group(1)) if d else ''
    yt=list(dict.fromkeys(re.findall(r'(?:youtube\.com/embed/|youtu\.be/|watch\?v=)([\w-]{11})',d.group(1) if d else '')))
    m=re.search(r'<div class="specific[^"]*">(.*?)</div>\s*</div>\s*<div class="row">',s,re.S)
    specs=[]
    if m:
        cells=[txt(c) for c in re.findall(r'<div>(.*?)</div>',m.group(1),re.S)]
        specs=[[cells[i],cells[i+1]] for i in range(0,len(cells)-1,2)]
    gal=re.findall(r'<a href="(https://globaleffects\.ru/storage/web/images/[^"]+)"\s*rel="gallery"[^>]*>\s*<img src="([^"]+)"',s)
    ext=s[s.find('<section class="extra-prods">'):]
    ext=ext[:ext.find('</section>')]
    rec=[slug2id.get(x) or x for x in dict.fromkeys(re.findall(r'href="/product/([^"]+)"',ext))]
    products[pid]=dict(id=pid,slug=li['slug'],name=li['name'],price=int(price.group(1)) if price else li['price'],
        availability=avail,category=crumbs[-1] if crumbs else None,type=txt(sub.group(1)) if sub else '',
        image=html.unescape(img.group(1)) if img else li['img'],thumb=li['img'],
        gallery=[dict(full=a,thumb=b) for a,b in gal],files=files,specs=specs,description=desc,videos=yt,
        related=[r for r in rec if isinstance(r,int)][:8])
# category membership
catlist=[]
for c in cats.values():
    catlist.append(dict(slug=c['slug'],group=c['group'],title=c['title'].capitalize() if c['title'].isupper() else c['title'],filters=c['filters'],products=c['products']))
json.dump(dict(categories=catlist,products=products),open('catalog.json','w',encoding='utf-8'),ensure_ascii=False)
from collections import Counter
print(len(products),Counter(p['availability'] for p in products.values()))
print(sum(1 for p in products.values() if p['specs']),'with specs;',sum(1 for p in products.values() if p['gallery']),'with gallery;',sum(1 for p in products.values() if p['files']),'with files')
p=products[8]; print(json.dumps({k:(v if k!='description' else v[:300]) for k,v in p.items()},ensure_ascii=False,indent=1)[:2500])
print(os.path.getsize('catalog.json'))
