"""CI only: runs on GitHub Actions (the dev sandbox has no internet). Reads scripts/photo_queries.json,
asks sylkit.com's own Unsplash endpoint (key stays in the worker), saves .ci/photos/<key>.json and a
numbered contact sheet .ci/photos/<key>.jpg to review by eye. Skips keys already fetched."""
import json, pathlib, time, urllib.request, urllib.parse, io, sys
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / '.ci' / 'photos'; OUT.mkdir(parents=True, exist_ok=True)
Q = json.loads((ROOT / 'scripts' / 'photo_queries.json').read_text())
UA = {'user-agent': 'sylkit-ci/1.0'}
def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40).read()
done = 0
LOG = []
_print = print
def print(*a):
    LOG.append(' '.join(map(str, a))); _print(*a)
for key, (q, orient) in Q.items():
    if (OUT / f'{key}.json').exists(): continue
    url = 'https://sylkit.com/api/photos/search?' + urllib.parse.urlencode({'q': q, 'per': 16, 'orientation': orient})
    try:
        data = json.loads(get(url))
    except Exception as e:
        print('stop at', key, e); break
    res = data.get('results') or []
    if not res: print('empty', key, data); continue
    (OUT / f'{key}.json').write_text(json.dumps(res, indent=1))
    tw, th = 240, 180
    sheet = Image.new('RGB', (4 * tw, 4 * (th + 30)), 'white'); d = ImageDraw.Draw(sheet)
    for i, p in enumerate(res[:16]):
        try:
            im = Image.open(io.BytesIO(get(p['small']))).convert('RGB'); im.thumbnail((tw - 4, th))
        except Exception: continue
        x, y = (i % 4) * tw, (i // 4) * (th + 30)
        sheet.paste(im, (x, y)); d.text((x + 2, y + th + 2), f"{i}: {p['alt'][:34]}", fill='black'); d.text((x + 2, y + th + 14), p['alt'][34:68], fill='black')
    sheet.save(OUT / f'{key}.jpg', quality=70)
    done += 1; print('ok', key, len(res)); time.sleep(1)
print('fetched', done)
(OUT / '_log.txt').write_text('\n'.join(LOG) + '\n')
