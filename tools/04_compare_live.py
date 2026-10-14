"""Report only: what changed on globaleffects.ru since the snapshot in public/data.

Run 01_scrape_categories.py in a temporary folder first (it writes cats_full.json there), then
    python 04_compare_live.py <temp>/cats_full.json <repo>/public/data/catalog.json
It prints the differences and writes nothing. Each change is applied after review (or by a new
snapshot): prices and stock come from the client's base, never from guesses.
Covers the category listings (products, names, prices and discounts, cart availability, photos);
product pages, news and blog are compared separately (see docs/LAUNCH-PREP.md).
"""
import json
import sys

live = json.load(open(sys.argv[1], encoding='utf-8'))
snap = json.load(open(sys.argv[2], encoding='utf-8'))
prods = {p['id']: p for p in snap['products']}
cats = {c['slug']: c for c in snap['categories']}
norm = lambda s: ' '.join((s or '').split()).casefold()

rows, seen = [], set()
for slug, c in live.items():
    old = cats.get(slug)
    if not old:
        rows.append(f'категория {slug}: нет в снимке')
        continue
    added, gone = set(c['products']) - set(old['products']), set(old['products']) - set(c['products'])
    if added or gone:
        rows.append(f'категория {slug}: добавлены {sorted(added)}, убраны {sorted(gone)}')
    for it in c['_items']:
        seen.add(it['id'])
        p = prods.get(it['id'])
        if not p:
            rows.append(f"{it['id']} новый товар: {it['name']} ({slug})")
            continue
        if it['price'] != p['price']:
            rows.append(f"{it['id']} цена: {p['price']} → {it['price']}")
        if it.get('oldPrice') != p.get('oldPrice'):
            rows.append(f"{it['id']} цена без скидки: {p.get('oldPrice')} → {it.get('oldPrice')}")
        if it['available'] != (p['availability'] == 'in_stock'):
            rows.append(f"{it['id']} кнопка «В корзину»: {'нет' if it['available'] else 'есть'} → {'есть' if it['available'] else 'нет'}")
        if norm(it['name']) != norm(p['name']):
            rows.append(f"{it['id']} название: {p['name']} → {it['name']}")
        if it['img'] != p['thumb']:
            rows.append(f"{it['id']} фото сменилось: {it['img']}")
for pid in sorted(prods.keys() - seen):
    rows.append(f"{pid} нет в списках категорий на сайте: {prods[pid]['name']}")

print('\n'.join(rows) or 'Расхождений нет')
