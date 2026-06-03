# Auto-MC-Sensor iGEM Wiki

This repository contains the static local wiki for the Auto-MC-Sensor iGEM-style project.

## Open Locally

On Windows, double-click:

```text
START_HERE.bat
```

The starter opens the site at:

```text
http://localhost:4199/
```

Keep the server window open while viewing the wiki. Close that window when finished.

If the starter cannot find Node.js or Python, install one of them and run it again:

- Node.js: https://nodejs.org/
- Python: https://www.python.org/

## Manual Server

From this folder:

```bash
node serve.mjs
```

The default Node server port is `4180`. The Windows starter uses port `4199`.

## Contents

- `index.html` - home page
- `description/`, `engineering/`, `model/`, `hardware/`, `human-practices/`, and other route folders - wiki pages
- `assets/` - images and static media
- `styles.css` - shared layout and liquid-glass styling
- `liquid-glass.js` - shared cursor-driven glass highlight behavior
- `serve.mjs` - small local static server
- `START_HERE.bat` - beginner-friendly Windows launcher

All page links and asset references are relative paths, so the folder can be moved or published without depending on a domain-root deployment.

## Notes

This is a static site. It does not require a build step for normal viewing.
