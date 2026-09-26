#!/usr/bin/env python3
"""Build standalone pages in docs/ from the page sources in src/.

The sources are HTML bodies (title, styles, markup, scripts) with no <html>/<head>
wrapper, which is the format the Claude artifact publisher expects. This wraps them
into complete documents that open straight from disk or GitHub Pages.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = {"workbench.html": "index.html", "explainer.html": "explainer.html"}
HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<style>html{{color-scheme:light}}body{{margin:0}}img{{max-width:100%}}[hidden]{{display:none!important}}</style>
</head>
<body>
{body}
</body>
</html>
"""

def main():
    out = ROOT / "docs"
    out.mkdir(exist_ok=True)
    for src, dst in PAGES.items():
        body = (ROOT / "src" / src).read_text(encoding="utf-8")
        (out / dst).write_text(HEAD.format(body=body), encoding="utf-8")
        print(f"built docs/{dst}")
    (out / ".nojekyll").write_text("")

if __name__ == "__main__":
    main()
