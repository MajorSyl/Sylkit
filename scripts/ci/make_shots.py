"""CI only (GitHub Actions has internet for the Unsplash photos). Serves public/ locally, takes desktop
(1280x800) and phone (390x844 @2x) screenshots of each page in scripts/ci/shots.json with headless
Chrome, and writes the gallery cover (laptop + phone on Sylkit's navy backdrop, scripts/make_cover.py)
plus the plain screenshots the product and template pages use."""
import functools, http.server, json, pathlib, subprocess, sys, threading, tempfile
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts'))
from make_cover import make  # noqa: E402

PORT = 8799
handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / 'public'))
http.server.ThreadingHTTPServer.allow_reuse_address = True
srv = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), handler)
threading.Thread(target=srv.serve_forever, daemon=True).start()
TMP = pathlib.Path(tempfile.mkdtemp())

def shot(url, out, w, h, scale=1):
    subprocess.run(['google-chrome', '--headless=new', '--no-sandbox', '--disable-gpu', '--hide-scrollbars', '--lang=en-US',
                    f'--window-size={w},{h}', f'--force-device-scale-factor={scale}', '--virtual-time-budget=15000',
                    f'--screenshot={out}', f'http://127.0.0.1:{PORT}{url}'], check=True, capture_output=True, timeout=120)

jobs = json.loads((ROOT / 'scripts' / 'ci' / 'shots.json').read_text())
for j in jobs:
    name = j['name']
    d, m = TMP / f'{name}-d.png', TMP / f'{name}-m.png'
    shot(j['url'] + j.get('desk', ''), d, 1280, 800)
    shot(j.get('murl', j['url']) + j.get('mob', ''), m, 390, 844, 2)
    acc = tuple(int(j.get('accent', '2558E8')[i:i + 2], 16) for i in (0, 2, 4))
    make(str(d), str(m), str(ROOT / 'public' / 'shots' / 'covers' / j['cover']), acc)
    if j.get('shot'):
        Image.open(d).convert('RGB').resize((1200, 750), Image.LANCZOS).save(ROOT / 'public' / 'shots' / j['shot'], 'WEBP', quality=80)
    if j.get('tpl'):
        Image.open(d).convert('RGB').crop((0, 0, 1280, 960 if Image.open(d).size[1] >= 960 else 800)).resize((960, 720), Image.LANCZOS).save(ROOT / 'public' / 'shots' / 'templates' / f"{j['tpl']}-desktop.webp", 'WEBP', quality=80)
        Image.open(m).convert('RGB').resize((390, 844), Image.LANCZOS).crop((0, 0, 390, 780)).save(ROOT / 'public' / 'shots' / 'templates' / f"{j['tpl']}-phone.webp", 'WEBP', quality=80)
    print('ok', name, flush=True)
srv.shutdown()
