# M3E Workspace — desktop web build

A desktop/laptop version of the M3E Workspace app. This is the full web source,
not a single flattened file — everything the original app used is here:

```
index.html               the app (desktop layout) — HTML, CSS and app JS
vendor/sync.bundle.js    the Yjs / WebRTC peer-sync bundle (loaded by index.html)
server/m3e-server.js     optional Node sync backend (also a key/value store)
server/README.md         how to run the backend
README.md                this file
```

Nothing has been removed from the app: the page editor, blocks, templates,
comments, version history, linked databases, embeds, and **all five sync
methods** (Same Wi-Fi, Nearby, Peer sync, Account, Link code) are present.
Open the sidebar and choose **Sync** to reach them.

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
`vendor/sync.bundle.js` by relative path. `server/` is only needed if you want
account sync to run through your own server (see below).

## Sync

The app performs every network call through a bridge that, in the Android build,
was supplied by the native shell. A browser has no such bridge, so this build
implements it with `fetch` (`window.MW` near the top of `index.html`). That is
what makes **Sync → Account** work on the web.

Account sync stores one document per account in a key-value service, and ships
with two public ones. A browser will only let the page use a service that allows
cross-origin requests, which is outside this app's control. So the Account form
has an optional **Sync server** field:

1. Run the bundled backend somewhere your devices can reach:
   `node server/m3e-server.js`
2. Put its address (for example `https://sync.example.com`) into
   **Sync → Account → Sync server**.
3. Create the account, or sign in with details you already used elsewhere.

Every device signed in with the same username, password and server then shares
the same notes. The server already answers with
`Access-Control-Allow-Origin: *`, so the page can call it from any origin. Leave
the field empty to use the public services the app ships with instead.

Same Wi-Fi and Peer sync need no server at all. Same Wi-Fi hosting and Nearby
discovery use native-only APIs, so on the web those two are best used from the
app; Link code and Peer sync are browser-native.

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
