# AGENT.md

Guidance for future coding agents working in this folder.

## Project Shape

This folder is the deployable static wiki root. Keep runtime files here:

- route folders such as `description/`, `engineering/`, `human-practices/`
- `assets/`
- `index.html`
- `styles.css`
- `liquid-glass.js`
- `serve.mjs`
- user-facing launch/readme files

Do not put browser profiles, screenshots, source extraction folders, generated previews, or other debug artifacts in this folder. Archive those outside `ourwiki`.

## Paths

Use relative paths only.

Examples:

- root page stylesheet: `styles.css`
- subpage stylesheet: `../styles.css`
- root page asset: `assets/ppt-media/image49.png`
- subpage asset: `../assets/ppt-media/image49.png`
- route links from root: `description/index.html`
- route links from subpages: `../description/index.html`

Avoid root-relative paths such as `/styles.css`, `/assets/...`, or `/description/`.

## Local Validation

Start the server from this folder:

```bash
node serve.mjs
```

Then check:

- `http://localhost:4180/`
- `http://localhost:4180/description/index.html`
- `http://localhost:4180/human-practices/index.html`

For mobile checks, verify there is no horizontal overflow.

## Styling Notes

The liquid-glass effect is shared through `styles.css` and `liquid-glass.js`. Keep it global and reusable; avoid adding page-specific glass implementations unless a page truly needs a special case.

Human Practices has page-specific spacing rules under `.hp-page`. Keep those scoped to avoid changing all wiki card grids.
