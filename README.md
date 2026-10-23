# M3E Workspace — desktop web build

A desktop/laptop version of the M3E Workspace app. This is the full web source,
not a single flattened file — everything the original app used is here:

```
index.html               the app (desktop layout) — HTML, CSS and app JS
vendor/sync.bundle.js    the Yjs / WebRTC peer-sync bundle (loaded by index.html)
server/m3e-server.js     optional Node accounts + sync backend
server/README.md         how to run the backend
README.md                this file
```

Nothing has been removed from the app: the page editor, blocks, templates,
comments, version history, linked databases, embeds, and **all five sync
methods** (Same Wi-Fi, Nearby, Peer sync, Account, Link code) are present and
working. Open the sidebar and choose **Sync** to reach them.

## Publishing

Upload this folder to any static host — no build step and no dependencies.

- **Netlify** — drag the folder onto the deploy area (or set it as the publish
  directory).
- **Vercel / Cloudflare Pages** — deploy as a static site; no framework preset,
  no build command.
- **GitHub Pages** — commit the folder and enable Pages.
- **Any web server** — copy the folder into the document root; `index.html`
  already works as the directory index.

Keep `index.html` and `vendor/` together — `index.html` loads
`vendor/sync.bundle.js` by relative path. The `server/` folder is only needed if
you want the optional accounts-and-sync backend; the site runs fine without it.

## What changed for desktop and laptops

The original UI is phone-shaped: a slide-in sidebar, a full-screen page editor,
bottom sheets, and a narrow content column. From **1024 px** wide the app now
uses a desktop frame. Below that (phones and tablets) the layout is the original
one, unchanged.

- **Docked sidebar.** Navigation is permanently visible — workspace header,
  Quick find, All pages, Favorites, Templates, Folders, Sync, Settings, the page
  tree and Trash. The ☰ button collapses and expands it, and the choice is
  remembered between visits.
- **Centred content column** (max 1120 px) with a four-column gallery.
- **The page editor is a page, not an overlay** — opening a note fills the
  content area while the sidebar stays put, with text centred at a readable width.
- **Sheets become centred dialogs** — templates, page options, block options,
  emoji picker, sync, and quick find.
- **Mouse affordances** — hover states on cards, rows, chips and icon buttons,
  and real (thin) scrollbars instead of hidden ones.
- **Esc** dismisses the topmost layer (dialog → quick-action menu → page) without
  interrupting typing.
- Added a favicon plus `theme-color`, `description` and `color-scheme` meta tags.

## Notes

- Notes are stored in the browser's `localStorage` (per browser, per device),
  exactly as the app's offline mode did. Use **Sync** to share them across
  devices.
- The app opens with a few sample pages. Remove them from a page's **⋯** menu →
  **Move to trash**.
- The Android project files (`src/`, `res/`, `AndroidManifest.xml`, the widget
  providers) are not part of this web build — only the web layer was ported.
