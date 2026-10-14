"""Report only: does the snapshot pick the same confetti machines as the live quiz?

    python 05_compare_picker.py <repo>/public/data/catalog.json
Reads the quiz /category/podbor-konfetti-mashin, asks the live filter which machines each answer
picks (/category/konfetti-masiny?pf[...]) and compares with the specs in catalog.json. Writes
nothing. The product page shows one value per parameter; the filter knows all of them.
"""
import html
import json
import re
import sys
import time
import urllib.request

UA = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128'}
KEYS = {13: 'Тип зала', 15: 'Эффект', 16: 'Продолжительность', 17: 'Управление', 18: 'Высота потолков'}


def get(path):
    req = urllib.request.Request('https://globaleffects.ru' + path, headers=UA)
    time.sleep(0.3)
    return urllib.request.urlopen(req, timeout=40).read().decode('utf-8')


txt = lambda x: html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', x))).strip()
snap = json.load(open(sys.argv[1], encoding='utf-8'))
machines = [p for p in snap['products'] if p['category'] == 'konfetti-masiny']
quiz = get('/category/podbor-konfetti-mashin')
quiz = quiz[quiz.find('<form action="/category/konfetti-masiny"'):]
rows = []
for kind, pf, value, label in re.findall(r'<input type="(checkbox|radio)" name="pf\[(\d+)\](?:\[\])?" value="(\d+)">.*?<span>(.*?)</span>', quiz, re.S):
    key, label = KEYS.get(int(pf)), txt(label)
    if not key:
        rows.append(f'новый вопрос pf[{pf}]: {label}')
        continue
    query = f'pf%5B{pf}%5D' + ('%5B%5D' if kind == 'checkbox' else '') + f'={value}'
    live = {int(i) for i in re.findall(r'<div class="product-item-ias"[^>]*data-key="(\d+)"', get('/category/konfetti-masiny?' + query))}
    mine = {p['id'] for p in machines if [key, label] in p['specs']}
    if live != mine:
        rows.append(f'{key} = {label}: на сайте {sorted(live)}, в снимке {sorted(mine)}')
print('\n'.join(rows) or 'Подбор совпадает с сайтом')
