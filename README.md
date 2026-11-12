# QuickPaste

A minimal PasteBin clone. Paste code or text, pick a language and an expiry time, and get a short link to share.

## Features

- Create pastes with syntax highlighting for 20+ languages
- Short shareable links like `/p/Ab3dE9xZ` (8-character nanoid)
- Expiry: 10 minutes, 1 hour, 1 day, 1 week, or never
- **Burn after read**: the paste is deleted after its first view
- **Optional password**, hashed with bcrypt
- View counter, a copy button, and a raw text view (`/raw/:id`)
- Per-IP rate limiting and a 100 KB size limit

## Tech stack

| Part | Tech |
|---|---|
| Backend | Node.js, Express, Mongoose, MongoDB Atlas (plain JavaScript, ES modules) |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Libraries | nanoid, bcryptjs, express-rate-limit, helmet, cors, react-syntax-highlighter, react-hot-toast |

## Project structure

```
QuickPaste/
├── server/src/
│   ├── config/db.js            # Mongoose connection
│   ├── models/Paste.js         # schema + TTL index
│   ├── services/               # business logic (id, expiry, password, paste)
│   ├── middleware/             # security, rate limits, validation, errors
│   ├── controllers/            # thin request/response layer
│   ├── routes/pastes.js
│   └── server.js
└── client/
    ├── app/                    # pages: create form, /p/[id], not-found
    ├── components/             # ShareBox, CodeView, PasswordPrompt, PasteView
    └── lib/api.ts              # API calls
```

## Getting started

### Prerequisites

- Node.js 20 or newer
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Set up MongoDB Atlas

1. Create a cluster and a database user (Security → Database Access).
2. Allow your IP address (Security → Network Access). For a hosted backend such as Render, allow `0.0.0.0/0`.
3. Copy the connection string (Connect → Drivers).

### 2. Run the backend

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGODB_URI
npm run dev               # http://localhost:5000
```

Check it works: `curl http://localhost:5000/health` should return `{"status":"ok"}`.

### 3. Run the frontend

```bash
cd client
npm install
cp .env.example .env.local
npm run dev               # http://localhost:3000
```

## Environment variables

**server/.env**

| Variable | Example | Description |
|---|---|---|
| `PORT` | `5000` | Port the API listens on |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/quickpaste` | Atlas connection string. Include a database name before the `?` |
| `CLIENT_URL` | `http://localhost:3000` | Frontend URL. CORS only allows this origin |

**client/.env.local**

| Variable | Example | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | Backend base URL |

`.env` files are git-ignored. Only the `.env.example` files are committed.

## API

| Method | Endpoint | Body | Success | Errors | Rate limit |
|---|---|---|---|---|---|
| `POST` | `/api/pastes` | `{ content, language?, expiresIn, burnAfterRead?, password? }` | `201` `{ id, expiresAt }` | 400, 413, 429 | 10/min |
| `GET` | `/api/pastes/:id` | | `200` paste, or `{ locked: true }` | 404, 429 | 60/min |
| `POST` | `/api/pastes/:id/unlock` | `{ password }` | `200` paste | 400, 401, 404, 429 | 5/min |
| `GET` | `/raw/:id` | | `200` `text/plain` | 401, 404, 429 | 60/min (shared with GET above) |
| `GET` | `/health` | | `200` `{ status: "ok" }` | | |

**Validation rules**

- `content`: required, at most 100 KB (measured in UTF-8 bytes)
- `expiresIn`: one of `10m`, `1h`, `1d`, `1w`, `never`
- `language`: must be on the allowlist, otherwise saved as `plaintext`
- `password`: 4 to 64 characters
- `:id`: must match `/^[A-Za-z0-9]{8}$/`

A paste response looks like this:

```json
{
  "id": "Ab3dE9xZ",
  "content": "console.log('hi')",
  "language": "javascript",
  "burnAfterRead": false,
  "views": 3,
  "expiresAt": "2026-11-13T10:00:00.000Z",
  "createdAt": "2026-11-12T10:00:00.000Z"
}
```

All errors use the shape `{ "error": "message" }`. Stack traces are never sent to the client.

## Key design decisions

### TTL index for expiry

Each paste stores an `expiresAt` date, and the model has a TTL index on it:

```js
pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```

MongoDB deletes expired pastes on its own, so there is no cron job or cleanup worker to maintain. Pastes that never expire store `expiresAt: null`, and the TTL index ignores them.

The catch is that MongoDB's TTL monitor only runs about **every 60 seconds**, so an expired paste can stay in the database for up to a minute. To cover that gap, every read query also includes `notExpiredFilter()`:

```js
{ $or: [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }] }
```

The TTL index removes the data, and the filter makes sure an expired paste is never served, even before it is deleted.

### Atomic burn after read

A simple approach would be "find the paste, send it, then delete it". That has a race condition: if two people open the link at the same moment, both `find` calls succeed before either `delete` runs, and both see the "one-time" paste.

QuickPaste reads and deletes in **one atomic operation**:

```js
const paste = await Paste.findOneAndDelete({ _id: id, ...notExpiredFilter() });
```

MongoDB guarantees that only one request gets the document back. Every other request gets `null` and returns a 404.

You can check this yourself. With the server running, `npm run test:burn` (in `server/`) creates a burn-after-read paste and sends 50 requests to it at once:

```
Status codes: { '200': 1, '404': 49 }
Requests that saw the content: 1
PASS: exactly one request read the paste, the rest got 404
```

View counting works the same way. `findOneAndUpdate` with `{ $inc: { views: 1 } }` increments the count inside the database, so no views are lost when requests arrive at the same time. A read-modify-write in JavaScript (`paste.views++; paste.save()`) could lose updates.

Some related decisions:
- **Password-protected pastes** return only `{ locked: true }` until the correct password is given. The view is counted, or the paste burned, only after a successful unlock, so wrong guesses don't destroy it.
- **The raw view** uses the same read path, so `/raw/:id` can't be used to read a burn-after-read paste more than once.
- **The frontend fetches pastes in the browser**, not during server-side rendering. Link-preview bots (Slack, WhatsApp, Discord) fetch a page's HTML but don't run JavaScript, so sharing a burn-after-read link doesn't burn it before the real recipient opens it.

### Rate limiting

`express-rate-limit` limits each IP address with a 1-minute window:

| Action | Limit | Why |
|---|---|---|
| Create | 10/min | Stops spam and database flooding |
| Read (JSON + raw) | 60/min | Generous for normal use, blocks scraping |
| Unlock | 5/min | Makes brute-forcing a paste password impractical |

The unlock limit is the strictest because password guessing is the most sensitive action. bcrypt's slow hashing makes each guess cost more on top of that.

On Render (and most hosts) the app runs behind a reverse proxy, so every request would appear to come from the proxy's IP. `app.set("trust proxy", 1)` tells Express to read the real client IP from the `X-Forwarded-For` header set by that one proxy, so each user gets their own limit.

The limits are stored in memory, which is fine for a single server instance. Running several instances would need a shared store such as Redis, which is outside the scope of this project.

### Other security measures

- `helmet` sets secure HTTP headers. `X-Content-Type-Options: nosniff` stops browsers from rendering `/raw` content as HTML.
- CORS only allows the configured `CLIENT_URL`.
- The JSON body limit is 120 KB, slightly above the 100 KB content limit so the other fields fit.
- Validation replaces the request body with only the known fields, so unexpected fields never reach the database.
