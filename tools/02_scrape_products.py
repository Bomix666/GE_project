import re,json,html,urllib.request,os,time,concurrent.futures as cf
UA={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128'}
BASE='https://globaleffects.ru'
cats=json.load(open('cats_full.json',encoding='utf-8'))
prods={}
for c in cats.values():
    for i in c['_items']: prods.setdefault(i['id'],i)
print('unique',len(prods))
def get(slug):
    fn=f'prods/{slug}.html'
    if os.path.exists(fn) and os.path.getsize(fn)>1000: return fn
    for a in range(3):
        try:
            s=urllib.request.urlopen(urllib.request.Request(f'{BASE}/product/{slug}',headers=UA),timeout=40).read().decode('utf-8')
            open(fn,'w',encoding='utf-8').write(s); time.sleep(0.3); return fn
        except Exception as e: err=e; time.sleep(2)
    return 'FAIL '+slug+' '+str(err)
with cf.ThreadPoolExecutor(4) as ex: r=list(ex.map(get,[p['slug'] for p in prods.values()]))
print([x for x in r if x.startswith('FAIL')])
