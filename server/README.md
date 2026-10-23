# M3E Workspace — accounts + sync backend

One file, no dependencies. It gives you email + password accounts, a private
document per account, and the sync API the app talks to.

## Run it

```bash
node m3e-server.js
```

It prints a URL. Put that into the app: **Sync → My account → Server**, then
create an account (or sign in) with an email and password.

On both phones use the **same server address and the same email and password** —
that is what makes them show the same notes.

## Where to run it

Anything that runs Node and that your phones can reach:

- your own computer (phones on the same Wi-Fi)
- a small VPS, or a free Node host (Render, Railway, Fly, Glitch…)

Set the port and data folder if you like:

```bash
PORT=8787 DATA=/var/m3e node m3e-server.js
```

Put HTTPS in front of it if it is on the open internet — otherwise the password
crosses the network in the clear.

## What it stores

- `users.json` — email, a random salt and a **scrypt hash**. Never the password.
- `sessions.json` — sign-in tokens, so a restart keeps you logged in.
- `<hash>.json` — one document per account.

Files are written atomically, so an interrupted write cannot corrupt the last
good copy.

## API

| Method    | Path       | Purpose                                  |
|-----------|------------|------------------------------------------|
| POST/PUT  | `/signup`  | create an account → returns a token      |
| POST/PUT  | `/login`   | sign in → returns a token                |
| GET       | `/doc`     | read your document                       |
| PUT       | `/doc`     | replace your document                    |
| GET       | `/health`  | check it is alive                        |

Send the token as `Authorization: Bearer <token>` or `?token=<token>`.

## Using it from the published website

The web build talks to the same server. Open **Sync → Account** in the app and put
this server's address in the **Sync server** field (for example
`https://sync.example.com`), then create an account or sign in. Notes then travel
between every device signed in with those same details, through your server.

Leave that field empty and the app instead uses the public key-value services it
ships with — which only work from a browser if they allow cross-origin requests.

### Endpoints

| Method | Path            | Purpose                                        |
|--------|-----------------|------------------------------------------------|
| GET    | `/health`       | liveness check                                 |
| POST   | `/signup`       | create an account → token                      |
| POST   | `/login`        | sign in → token                                |
| GET    | `/doc`          | read your document (Bearer token)              |
| PUT    | `/doc`          | replace your document (Bearer token)           |
| GET    | `/kv/<key>`     | read a stored document (used by Sync server)   |
| POST   | `/kv/<key>`     | store a document (used by Sync server)         |

All responses carry `Access-Control-Allow-Origin: *`, so the page can call the
server from any origin.
