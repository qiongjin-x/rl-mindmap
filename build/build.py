# -*- coding: utf-8 -*-
"""把 build/app.html + build/data/*.js + KaTeX 资源打包成单个自包含 HTML。

用法：
    python build/build.py                 # 输出到 ../强化学习的数学原理_思维导图.html
    python build/build.py index.html      # 输出到指定路径（仓库里用于 GitHub Pages）
"""
import base64
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent
DEFAULT_OUT = ROOT.parent / "强化学习的数学原理_思维导图.html"
OUT = pathlib.Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_OUT
KATEX = ROOT / "katex"
DATA = ROOT / "data"


def read_text(name: str) -> str:
    return (KATEX / name).read_text(encoding="utf-8")


def inline_css() -> str:
    css = read_text("katex.min.css")
    missing = []

    def sub(m):
        name = m.group(1)
        f = KATEX / "fonts" / (name + ".woff2")
        if not f.exists():
            missing.append(name)
            return m.group(0)
        b64 = base64.b64encode(f.read_bytes()).decode("ascii")
        return 'src:url(data:font/woff2;base64,%s) format("woff2")' % b64

    css = re.sub(r"src:url\(fonts/([A-Za-z0-9_\-]+)\.woff2\)[^}]*", sub, css)
    if missing:
        raise SystemExit("missing woff2: %s" % missing)
    leftover = re.findall(r"url\(fonts/[^)]*\)", css)
    if leftover:
        raise SystemExit("unreplaced font urls: %s" % leftover[:3])
    return css


def inline_js() -> tuple[str, str]:
    katex = read_text("katex.min.js")
    auto = (KATEX / "contrib" / "auto-render.min.js").read_text(encoding="utf-8")
    for name, js in (("katex", katex), ("auto-render", auto)):
        if "</script" in js.lower():
            raise SystemExit("%s contains a literal </script" % name)
    return katex, auto


def bundle_data() -> str:
    files = sorted(DATA.glob("*.js"))
    if not files:
        raise SystemExit("no data files in %s" % DATA)
    head = "var NODES=[], CHAPTERS=[], TRACKS=[];\n"
    body = []
    for f in files:
        txt = f.read_text(encoding="utf-8")
        if "</script" in txt.lower():
            raise SystemExit("%s contains a literal </script" % f.name)
        body.append("/* ===== %s ===== */\n%s" % (f.name, txt))
    return head + "\n".join(body)


def main():
    html = (ROOT / "app.html").read_text(encoding="utf-8")
    css = inline_css()
    katex_js, auto_js = inline_js()

    parts = {
        "<!--DATA-->": "<script>\n%s\n</script>" % bundle_data(),
        "<!--KATEX_CSS-->": "<style>\n%s\n</style>" % css,
        "<!--KATEX_JS-->": "<script>\n%s\n</script>" % katex_js,
        "<!--AUTORENDER_JS-->": "<script>\n%s\n</script>" % auto_js,
    }
    for k, v in parts.items():
        if k not in html:
            raise SystemExit("marker not found: %s" % k)
        html = html.replace(k, v, 1)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print("written: %s  (%.0f KB)" % (OUT, kb))


if __name__ == "__main__":
    main()
