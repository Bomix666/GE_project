import re,json,html,urllib.request,os,time,concurrent.futures as cf
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128'}
BASE='https://globaleffects.ru'
def get(url,fn):
    if os.path.exists(fn): return open(fn,encoding='utf-8').read()
    for a in range(3):
        try:
            s=urllib.request.urlopen(urllib.request.Request(url,headers=UA),timeout=40).read().decode('utf-8')
            open(fn,'w',encoding='utf-8').write(s); time.sleep(0.25); return s
        except Exception as e: err=e; time.sleep(1.5)
    print('FAIL',url,err); return ''
equip=["komplekty","konfetti-masiny","krioeffekty-2","sistema-sbrosa-zanavesa","imitacia-plameni-2","pena-2","tazelyj-dym","linejka-easyfx","linejka-power-550","aksessuary"]
cons=["konfetti","serpantin","iskusstvennyj-sneg","stvoly","zidkosti","iskusstvennyj-pepel","effekty-v-balloncikah"]
def num(x): f=float(x.replace(' ','')); return int(f) if f.is_integer() else f
def txt(x): return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',x))).strip()
def parse_list(s):
    items=[]
    for blk in re.split(r'<div class="product-item-ias"',s)[1:]:
        pid=re.search(r'data-key="(\d+)"',blk)
        url=re.search(r'href="(/product/[^"]+)"',blk); img=re.search(r'<img src="([^"]+)"',blk)
        name=re.search(r'<div class="title">\s*<a[^>]*>(.*?)</a>',blk,re.S)
        # a discounted item lists the struck full price first, then the price it sells for (kopecks possible)
        price=re.search(r'<div class="price price_discount">\s*<span>([\d\s.]+)</span>',blk) or re.search(r'<div class="price[^"]*">\s*<span>([\d\s.]+)</span>',blk)
        old=re.search(r'<div class="price striked">\s*<span>([\d\s.]+)</span>',blk) if 'price_discount' in blk else None
        items.append(dict(id=int(pid.group(1)),slug=url.group(1).split('/product/')[1] if url else None,name=txt(name.group(1)) if name else None,
            img=html.unescape(img.group(1)) if img else None,price=num(price.group(1)) if price else None,oldPrice=num(old.group(1)) if old else None,
            available=('cart_add(' in blk)))
    return items
cats={}
for group,lst in (('equipment',equip),('consumables',cons)):
    for c in lst:
        s=get(f'{BASE}/category/{c}',f'pages/{c}_1.html')
        title=txt(re.search(r'<h1 class="title">(.*?)</h1>',s,re.S).group(1))
        pages=[int(p) for p in re.findall(r'[?&]page=(\d+)',s)]
        mx=max(pages) if pages else 1
        # guard: the "18" seen is per-page size param; take pages from pagination links only
        pl=re.findall(r'data-page="(\d+)"',s)
        mx=max([int(p)+1 for p in pl]) if pl else 1
        items=parse_list(s)
        for p in range(2,mx+1):
            items+=parse_list(get(f'{BASE}/category/{c}?page={p}&per-page=18',f'pages/{c}_{p}.html'))
        # filters
        filters=[]
        for blk in re.findall(r'<div class="filter-block property-select-block[^"]*">(.*?)</ul>',s,re.S):
            t=re.search(r'filter-val[^>]*>(.*?)</div>',blk,re.S)
            opts=[(v,txt(o)) for v,o in re.findall(r'<li value="(\d+)"[^>]*>(.*?)</li>',blk,re.S)]
            filters.append(dict(label=txt(t.group(1)) if t else '',options=[dict(id=int(v),label=l) for v,l in opts]))
        seen=set(); uniq=[]
        for i in items:
            if i['id'] not in seen: seen.add(i['id']); uniq.append(i)
        cats[c]=dict(slug=c,group=group,title=title,pages=mx,filters=filters,products=[i['id'] for i in uniq],_items=uniq)
        print(c,title,mx,'pages',len(uniq),'items')
json.dump(cats,open('cats_full.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
