#!/usr/bin/env python3
"""Build the GitHub Pages site into docs/.

- Generates tokens.css from tokens.json (Board theme on :root, Paper on [data-theme="paper"]).
- Turns every components/*/preview.html into a standalone page that loads
  tokens.css, bundle.css, React 18 and bundle.js.
- Writes a gallery index.html.

Run from the repo root:  python3 tools/build_pages.py
"""
import json, re, shutil, html
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "docs"
REACT = ["vendor/react.production.min.js", "vendor/react-dom.production.min.js"]  # React 18.3.1, vendored


def tokens_css():
    t = json.loads((ROOT / "tokens.json").read_text())
    board, paper, shared = [], [], []
    for tok in t["color"]["tokens"]:
        v = tok["value"]
        if isinstance(v, dict):
            board.append(f"  --{tok['name']}: {v['board']};")
            paper.append(f"  --{tok['name']}: {v['paper']};")
        else:
            shared.append(f"  --{tok['name']}: {v};")
    for fam, stack in t["type"]["families"].items():
        shared.append(f"  --font-{fam}: {stack};")
    for group in ("spacing", "radius", "pitch"):
        for tok in t[group]["tokens"]:
            shared.append(f"  --{tok['name']}: {tok['value']};")
    return (
        "/* Generated from tokens.json by tools/build_pages.py. Do not edit. */\n"
        ":root, [data-theme=\"board\"] {\n  color-scheme: dark;\n" + "\n".join(board) + "\n}\n"
        "[data-theme=\"paper\"] {\n  color-scheme: light;\n" + "\n".join(paper) + "\n}\n"
        ":root {\n" + "\n".join(shared) + "\n}\n"
    )


HEAD = """<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 16 16%27%3E%3Ccircle cx=%278%27 cy=%278%27 r=%277%27 fill=%27%23ff6a00%27/%3E%3C/svg%3E">
<link rel="stylesheet" href="{up}tokens.css">
<link rel="stylesheet" href="{up}components/bundle.css">
<script src="{up}{r0}"></script>
<script src="{up}{r1}"></script>
<script src="{up}components/bundle.js"></script>
"""

THEME_TOGGLE = """<script>
(function(){
  var k='fd-theme',t;try{t=localStorage.getItem(k)}catch(e){}
  if(t)document.documentElement.setAttribute('data-theme',t);
  window.fdToggleTheme=function(){
    var n=document.documentElement.getAttribute('data-theme')==='paper'?'board':'paper';
    document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem(k,n)}catch(e){}
  };
})();
</script>
"""


def card_meta(src):
    m = re.match(r"\s*<!--\s*@dsCard(.*?)-->", src)
    meta = {}
    if m:
        for k, v in re.findall(r'(\w+)=("[^"]*"|\S+)', m.group(1)):
            meta[k] = v.strip('"')
    return meta


def build():
    if OUT.exists():
        shutil.rmtree(OUT)
    (OUT / "components").mkdir(parents=True)
    (OUT / "tokens.css").write_text(tokens_css())
    for f in ("bundle.css", "bundle.js", "index.d.ts"):
        shutil.copy(ROOT / "components" / f, OUT / "components" / f)
    shutil.copy(ROOT / "tokens.json", OUT / "tokens.json")
    (OUT / ".nojekyll").write_text("")
    shutil.copytree(ROOT / "vendor", OUT / "vendor")

    pages = []
    for prev in sorted((ROOT / "components").glob("*/preview.html")):
        name = prev.parent.name
        src = prev.read_text()
        meta = card_meta(src)
        src = re.sub(r"^\s*<!--\s*@dsCard.*?-->\s*", "", src, flags=re.S)
        inject = HEAD.format(up="../../", r0=REACT[0], r1=REACT[1]) + THEME_TOGGLE
        src = src.replace("</title>", "</title>\n" + inject, 1) if "</title>" in src else src.replace("<head>", "<head>\n" + inject, 1)
        dest = OUT / "components" / name / "index.html"
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(src)
        readme = prev.parent / "README.md"
        if readme.exists():
            shutil.copy(readme, dest.parent / "README.md")
        pages.append((name, meta))

    order = ["HomepageField", "Homepage", "DiscField", "DiscDisplay", "Button", "NavBar", "Panel", "StatusDisc"]
    pages = [p for p in pages if p[0] != "Cover"]
    pages.sort(key=lambda p: order.index(p[0]) if p[0] in order else 99)

    cards = []
    for name, meta in pages:
        is_page = meta.get("group") == "Pages" or name.startswith("Homepage")
        h = 420 if is_page else max(240, min(int(meta.get("height", 200)) + 40, 420))
        sub = html.escape(meta.get("subtitle", "Full page" if is_page else "Component"))
        cards.append(f"""      <article class="card{' wide' if is_page else ''}">
        <div class="card-head"><span class="fd-label">{html.escape(meta.get('group', 'Component'))}</span>
          <a class="open" href="components/{name}/">Open {html.escape(name)} &rarr;</a></div>
        <h2>{html.escape(name)}</h2><p class="sub">{sub}</p>
        <iframe src="components/{name}/" title="{html.escape(name)} preview" loading="lazy" style="height:{h}px"></iframe>
      </article>""")

    index = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Flipdisc — a flip-disc design system</title>
<meta name="description" content="Flipdisc: a black, white and orange website design system modelled on electromechanical flip-disc signs.">
{HEAD.format(up='', r0=REACT[0], r1=REACT[1])}{THEME_TOGGLE}<style>
  body{{margin:0}}
  .pg{{max-width:1104px;margin:0 auto;padding:0 var(--space-6)}}
  header{{display:flex;justify-content:space-between;align-items:center;gap:var(--space-4);flex-wrap:wrap;padding:var(--space-8) 0}}
  .hero{{padding:var(--space-8) 0 var(--space-12)}}
  .hero p{{font-size:18px;line-height:28px;color:var(--ink-muted);max-width:60ch;margin:var(--space-6) 0}}
  .grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:var(--space-6);padding-bottom:var(--space-16)}}
  .card{{background:var(--surface-100);border:1px solid var(--line);border-radius:var(--radius-sm);padding:var(--space-6);min-width:0}}
  .card.wide{{grid-column:1/-1}}
  .card-head{{display:flex;justify-content:space-between;gap:var(--space-4)}}
  .card h2{{margin:var(--space-3) 0 0;font-size:20px;line-height:28px}}
  .sub{{margin:var(--space-1) 0 var(--space-4);color:var(--ink-muted);font-size:14px}}
  .open{{color:var(--orange-text);font-size:14px;text-decoration:none}}
  .open:hover,.open:focus-visible{{text-decoration:underline}}
  iframe{{display:block;width:100%;border:1px solid var(--line);border-radius:var(--radius-sm);background:var(--surface-000)}}
  footer{{padding:var(--space-8) 0;color:var(--ink-muted);font-size:14px;border-top:1px solid var(--line)}}
  footer a{{color:var(--ink)}}
</style>
</head>
<body class="fd-root">
<div class="pg">
  <header>
    <div id="brand"></div>
    <div id="actions"></div>
  </header>
  <section class="hero">
    <div id="board"></div>
    <p>A black, white and orange website system modelled on the electromechanical flip-disc sign — a dot-matrix font drawn in pure CSS, a canvas-backed full-page disc field, and a small set of React components.</p>
    <div id="ctas"></div>
  </section>
  <main class="grid">
{chr(10).join(cards)}
  </main>
  <footer>Flipdisc design system &middot; <a href="https://github.com/ADivers/flipdisc">Source on GitHub</a> &middot; <a href="tokens.json">tokens.json</a></footer>
</div>
<script>
  var F = window.Flipdisc, h = React.createElement;
  ReactDOM.createRoot(document.getElementById('brand')).render(h(F.DiscDisplay, {{ messages: ['FLIPDISC'], pitch: 'sm', boot: false }}));
  ReactDOM.createRoot(document.getElementById('actions')).render(h(F.Button, {{ variant: 'ghost', size: 'sm', onClick: function () {{ fdToggleTheme(); }} }}, 'Toggle theme'));
  ReactDOM.createRoot(document.getElementById('board')).render(h(F.DiscDisplay, {{ messages: ['FLIPDISC', 'SIMPLE.', 'FAST.', 'FLIP!'], fit: true, color: 'orange', label: 'Flipdisc' }}));
  ReactDOM.createRoot(document.getElementById('ctas')).render(h('div', {{ style: {{ display: 'flex', gap: '12px', flexWrap: 'wrap' }} }},
    h(F.Button, {{ href: 'components/HomepageField/' }}, 'See the full-page demo'),
    h(F.Button, {{ variant: 'secondary', href: 'https://github.com/ADivers/flipdisc' }}, 'View source')));
</script>
</body>
</html>
"""
    (OUT / "index.html").write_text(index)
    print(f"Built {len(pages)} pages into {OUT}")


if __name__ == "__main__":
    build()
