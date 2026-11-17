# -*- coding: utf-8 -*-
"""下载 KaTeX 并落地到 build/katex/，供打包时内联。"""
import io
import os
import shutil
import tarfile
import urllib.request

VERSION = "0.16.11"
HERE = os.path.dirname(os.path.abspath(__file__))
DEST = os.path.join(HERE, "katex")
TMP = os.path.join(HERE, "_katex_src")

URL = f"https://registry.npmjs.org/katex/-/katex-{VERSION}.tgz"


def main():
    ok = (
        os.path.exists(os.path.join(DEST, "katex.min.js"))
        and os.path.isdir(os.path.join(DEST, "fonts"))
        and os.path.exists(os.path.join(DEST, "contrib", "auto-render.min.js"))
    )
    if ok:
        print("already present:", DEST)
        return

    print("downloading", URL)
    req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
    blob = urllib.request.urlopen(req, timeout=120).read()
    print("tgz bytes:", len(blob))

    if os.path.isdir(TMP):
        shutil.rmtree(TMP)
    os.makedirs(TMP)
    with tarfile.open(fileobj=io.BytesIO(blob), mode="r:gz") as tf:
        tf.extractall(TMP)

    dist = os.path.join(TMP, "package", "dist")
    os.makedirs(DEST, exist_ok=True)
    for name in ("katex.min.css", "katex.min.js", "LICENSE"):
        src = os.path.join(dist, name)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(DEST, name))
    contrib = os.path.join(DEST, "contrib")
    os.makedirs(contrib, exist_ok=True)
    shutil.copy2(
        os.path.join(dist, "contrib", "auto-render.min.js"),
        os.path.join(contrib, "auto-render.min.js"),
    )
    shutil.copytree(os.path.join(dist, "fonts"), os.path.join(DEST, "fonts"))
    shutil.rmtree(TMP)
    print("done ->", DEST)


if __name__ == "__main__":
    main()
