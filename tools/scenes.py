"""Build the large "scene" photos (hero, effects, story, about, CTA) in natural colour.

Every scene is a real GLOBAL EFFECTS photo or video frame that already lives in
public/media (gallery photos, video posters). The earlier red/black tritone
grading was removed on the client's request: photos keep their own colours and
the page darkens them with CSS gradients only where text sits on top.

    python tools/scenes.py      # rewrites public/media/scenes/*.webp (+ -sm)

MASTERS were supplied at full size: the file in scenes/ is the original and only
its phone version is derived here.

ponytail: 6 scenes come from 960px video posters and are upscaled to the old
1280px size so no markup changes; replace with original footage when the client
provides it (move the name to MASTERS and update width/height where it is used).
"""
from PIL import Image

MEDIA = 'public/media'
SCENES = {
    'about-cryo-demo': 'gallery/krioeffekty_10', 'about-shelves': 'gallery/konfetti_18',
    'about-stand': 'gallery/vystavki_11', 'about-team': 'gallery/vystavki_03',
    'cta-cryo': 'gallery/krioeffekty_02',
    'fx-confetti': 'video/5nHXXnFxWug', 'fx-confetti-2': 'gallery/konfetti_00',
    'fx-cryo': 'video/lg6npuVNhyk', 'fx-cryo-2': 'gallery/krioeffekty_03',
    'fx-flame': 'video/vapbhhGwmtU', 'fx-flame-2': 'video/LglbvIROtd8',
    'fx-foam': 'gallery/pena_00', 'fx-foam-2': 'video/IpYudCN1XI4',
    'fx-smoke': 'gallery/tazelyj-dym_02', 'fx-smoke-2': 'video/ZV9-TIAr2Hc',
    'fx-snow': 'gallery/iskusstvennyj-sneg_23', 'fx-snow-2': 'gallery/iskusstvennyj-sneg_21',
    'story-result': 'gallery/konfetti_22',
}
MASTERS = ['hero-confetti-arena', 'hero-confetti-crowd', 'hero-cryo-columns', 'story-effect']


def save_small(large, target):
    small_w = min(720, large.width)
    large.resize((small_w, round(large.height * small_w / large.width)), Image.LANCZOS).save(target.replace('.webp', '-sm.webp'), 'WEBP', quality=78, method=6)


for name, source in SCENES.items():
    target = f'{MEDIA}/scenes/{name}.webp'
    size = Image.open(target).size  # keep the published dimensions
    photo = Image.open(f'{MEDIA}/{source}.webp').convert('RGB')
    assert abs(photo.width / photo.height - size[0] / size[1]) < 0.02, f'{name}: aspect differs from {source}'
    large = photo.resize(size, Image.LANCZOS)
    large.save(target, 'WEBP', quality=80, method=6)
    save_small(large, target)
    print(f'{name:22} <- {source}')

for name in MASTERS:
    target = f'{MEDIA}/scenes/{name}.webp'
    save_small(Image.open(target).convert('RGB'), target)
    print(f'{name:22} (master)')
