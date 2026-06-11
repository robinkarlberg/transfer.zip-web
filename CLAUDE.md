# CLAUDE.md

Guidance for Claude Code working in this repo.

## Repo layout

Multi-service monorepo, no top-level package.json — each service is its own npm workspace:

- [next/](next/) — Next.js 16 (App Router) frontend + API routes. Main user-facing app.
- [worker/](worker/) — Fastify backend. Holds the RSA private key (signs JWTs for node servers), runs `node-cron` cleanup of expired transfers, proxies geo lookups + node control calls. Port 3001.
- [signaling-server/](signaling-server/) — Plain Node + `ws`. Relay server for Quick Transfers: session pairing + opaque encrypted binary packet forwarding. Port 9002.
- [_db/](_db/) — local MongoDB volume (docker compose).
- [_local_dev_worker_data/](_local_dev_worker_data/) — local RSA keypair (created by `local-dev-create-keys.sh`).

The file-storage backend (uploads/zips/S3) lives in a separate repo, `transfer.zip-node`. The worker reaches it via signed JWT calls; URL configured in [next/conf.json](next/conf.json.example).

## Commands

- Don't run commands to (re)start the server — everything is already running.
- Don't install packages yourself. Give me the command and I'll run it.

### Tests

Small Vitest suite for pure-logic code in [next/tests/](next/tests/): plan resolution, feature/limit ladders, password encryption round-trip, util helpers, `useTeamAdminAuth`. Run with `npm run test:run` (one-shot) or `npm run test` (watch) from inside `next/`.

Run + extend the suite when you change: `lib/pricing.js`, `User`/`Team`/`Transfer`/`TeamEvent` model methods, `useTeamAdminAuth`, `lib/utils.js`, `lib/transferUtils.js`. Skip tests for Mongoose CRUD, React UI, Stripe webhooks, WebRTC/signaling, anything needing a live DB.

## Architecture

### Two transfer modes

1. **Quick Transfers** — real-time, end-to-end encrypted with a client-generated AES-GCM 256 key (the key travels in the link's hash fragment, never to a server). All traffic is **relayed** through signaling-server as opaque binary packets — no WebRTC. Flow control is end-to-end: the receiver acks bytes only after writing them to its output stream, and the sender keeps ≤16MB unacked in flight. Client stack, layered: [lib/client/relay.js](next/src/lib/client/relay.js) (WebSocket transport: sessions, pairing, reconnect) → [lib/client/filetransfer.js](next/src/lib/client/filetransfer.js) (encrypted file protocol: `FileSender`/`FileReceiver`) → [lib/client/quickshare.js](next/src/lib/client/quickshare.js) (`QuickShareSession`, emits UI state snapshots). No file data in MongoDB. Files exist only while both peers are online.
2. **Stored Transfers** — S3 multipart via Uppy + `@uppy/aws-s3` ([next/src/lib/client/uppy.js](next/src/lib/client/uppy.js)). Client gets presigned URLs from the `transfer.zip-node` server (`/upload/sign`, `/upload/multipart/*`) and PUTs parts directly to S3. Next stores metadata only; bytes never go through Next or the node server. Cross-server auth = RS256 JWTs signed by the worker.

### Key boundaries

- **next ↔ worker**: HTTP. Worker holds `private.pem`; Next never sees it. Calls via [next/src/lib/server/workerApi.js](next/src/lib/server/workerApi.js): `workerSign`, `workerGeoSlow`, `workerTransferDelete`, `workerUploadComplete`. Geo lookup is on the worker because the geoip lib didn't play well with Next.
- **next ↔ node server**: control calls forwarded *through* the worker (`/forward-node-control/*`) so the worker can sign them. Direct upload/download client↔node bypasses Next.
- **next ↔ signaling-server**: client-side only.

### Next.js app structure

Route groups under [next/src/app/](next/src/app/):
- `(app)/app/*` — authenticated dashboard (sent, received, requests, settings, team). Layout requires token cookie.
- `(site)/*` — marketing + public pages (`/transfer/[secretCode]`, `/upload/[secretCode]`).
- `(fullscreen)/*` — signin, signup, magic-link, change-password, onboarding, invite acceptance.
- `api/*` — auth, transfer, transferrequest, upload, download, brandprofile, team, invite, stripe webhook, sign, megadesk-identity, error reporting.

[next/src/middleware.js](next/src/middleware.js) handles:
- redirecting `/app/*` to `/signin` when no token cookie
- legacy URL redirects
- self-host mode: route whitelist, `/` → `/quick`
- `NEXT_PUBLIC_DL_DOMAIN` (e.g. `trnsf.to`) — rewrites `/{uuid}` → `/transfer/{uuid}` and adds CORS for `/api`
- AB tests (production only — `IS_SELFHOST` short-circuit)

### Self-host vs hosted

`IS_SELFHOST` ([next/src/lib/isSelfHosted.js](next/src/lib/isSelfHosted.js)) is true unless `NEXT_PUBLIC_SELFHOST=false`. Gates Stripe routes, AB tests, registration UI, storage limits (self-host = effectively unlimited). Check the `IS_SELFHOST` branch when changing pricing/feature/permission code.

### Auth & DB connections

Cookie-based sessions. The `token` cookie is a Session document key; [useServerAuth](next/src/lib/server/wrappers/auth.js) looks it up and populates `user` + `user.team`. Google OAuth and email magic-links also create Session rows.

**Two parallel wrapper pairs — pick the one matching your context:**

1. **API Routes** (`route.js`):
   - `dbConnect()` — [lib/server/mongoose/db.js](next/src/lib/server/mongoose/db.js)
   - `useServerAuth()` — [lib/server/wrappers/auth.js](next/src/lib/server/wrappers/auth.js)
2. **Server Actions** (`"use server"`):
   - `dbConnectServerAction()` — [lib/server/mongoose/dbServerAction.js](next/src/lib/server/mongoose/dbServerAction.js)
   - `useServerAuthServerAction()` — [lib/server/wrappers/authServerAction.js](next/src/lib/server/wrappers/authServerAction.js)

Split exists because Server Actions and Route Handlers don't share the `global.mongoose` module cache when Next runs as a long-running standalone Node process (our prod deploy). Keep the pairs in sync.

Server Action variants are **not currently used** (no `"use server"` files exist yet) — kept for future use. Update this line when that changes.

```js
// API routes
import { useServerAuth } from "@/lib/server/wrappers/auth";
const auth = await useServerAuth();
if (!auth) return NextResponse.json(resp("Unauthorized"), { status: 401 });

// Server Actions (future)
import { useServerAuthServerAction } from "@/lib/server/wrappers/authServerAction";
const auth = await useServerAuthServerAction();
if (!auth) throw new Error("Unauthorized");
```

### Plans, features, limits, teams

- [next/src/lib/pricing.js](next/src/lib/pricing.js) defines `FEATURE` (bool) + `LIMIT` (num) constants and the `PLANS` map. **Always use the constants** — don't hardcode plan ids.
- `User.hasFeature(f)` / `User.getLimit(l)` / `User.getPlan()` delegate to `Team` if `user.team` is set, then `customFeatures`/`customLimits` overrides, then plan defaults. Mirror this when adding gated capabilities.
- Roles ([next/src/lib/roles.js](next/src/lib/roles.js)): `OWNER`, `ADMIN`, `MEMBER`. New accounts default to `OWNER`.
- Team feature is **in-progress** — see [TEAM_TODO.md](TEAM_TODO.md) for known gaps (invite acceptance doesn't set `user.team`, no seat validation, no session invalidation on removal).

### Mongoose models

In [next/src/lib/server/mongoose/models/](next/src/lib/server/mongoose/models/). Use the standard `mongoose.models.X || mongoose.model("X", ...)` pattern (needed for Next hot-reload).

**Always use a `toJsonAs*()` method when sending model data server → client** (API responses, server-component props, anything crossing the boundary). Never serialize raw Mongoose docs — they leak internal fields (password hashes, tokens, flags). Add a method if missing rather than cherry-picking fields at the call site.

**Naming:**
- `toJsonAsClient()` — default, when there's only one shape.
- `toJsonAsOwner()`, `toJsonAsDownloader()`, `toJsonAsUploader()`, etc. — when the same model has materially different shapes per audience (e.g. `Transfer` returns plaintext password to the owner but not to a public downloader).

Presence of audience-specific methods signals "this model has an internal trust boundary — pick carefully." A model with only `toJsonAsClient()` says "nothing sensitive varies by audience."

### Logging

Pino everywhere (`next-logger` wraps Next, worker uses pino directly). Dev output piped through `pino-pretty`. Don't use `console.log` in server code.

### Email

[next/src/lib/server/mail/mail.js](next/src/lib/server/mail/mail.js) uses Resend when `RESEND_API_KEY` is set; otherwise logs rendered HTML to console (mock mode for self-host). Templates are React Email components in `mail/templates/`.

## Conventions

- **JavaScript, not TypeScript.** Use `.js` for everything you create, including JSX. The only existing `.jsx` files are vendored shadcn primitives in `components/ui/` and React Email templates in `lib/server/mail/templates/` — don't add to those exceptions.
- Path alias `@/` → `next/src/` (set in `jsconfig.json`).
- Tailwind v4 with shadcn-style `components/ui/*.jsx` primitives. Use these — don't pull in new UI libs.
- Validation: `zod` schemas at the top of API route files (see [next/src/app/api/transfer/new/route.js](next/src/app/api/transfer/new/route.js)).
- Rate limiting: `rate-limiter-flexible` backed by MongoDB, configured in [next/src/lib/server/rate-limits/](next/src/lib/server/rate-limits/).

### Next.js 15/16

`cookies()`, `headers()`, `params`, `searchParams` are PROMISES — await them:
```js
const cookieStore = await cookies();
const headersList = await headers();
const { id } = await params;
```

### Style

- Double quotes for strings (template literals for interpolation/multi-line).
- Tailwind for styling.
- Minimize optional chaining (`?.`) — only for genuinely optional values, not to hide errors.
- **Add JSDoc `@param` types when the type isn't obvious from the call site.** IntelliSense in JS depends on it. Matters most for API route handlers (`@param {NextRequest} req`), helpers taking Mongoose docs, server-action wrappers, anything with a structured object arg. Skip for trivially inferable types (string `id`). **Never add JSDoc/`@param` to React components**. For Mongoose docs or any non-trivial object, reference the type by name (`@param {Team} team`) — don't inline-expand the schema (`@param {{ users: ObjectId[], name: string, plan: string, ... }} team`). The name links to the model file; the expansion rots the moment the schema changes.
  ```js
  /** @param {NextRequest} req */
  export async function GET(req) { ... }

  /** @param {import("./mongoose/models/Team").default} team */
  function chargeTeam(team) { ... }
  ```
- **Comments: max 3 lines, only when the *why* is non-obvious** (subtle invariant, workaround for a specific bug, hidden constraint). Don't restate code, don't describe the current PR, don't write multi-paragraph rationale. If it doesn't fit, it belongs in the PR/commit message.

### Frontend rules

The dashboard is the product surface — it must feel premium and consistent. Don't ship LLM-tells. Read existing pages ([settings/SettingsPage.js](next/src/app/(app)/app/(dashboard)/settings/SettingsPage.js), dashboard `FloatingBar`, etc.) and match them.

- **Color palette: `gray-*` and `primary-*` only.** No `slate-*`, `zinc-*`, `neutral-*`.
- **No opacity-suffix colors** (`bg-foo/60`, `border-foo/40`, `text-foo/80`) in new UI. The few existing spots in marketing/header are the only exception — don't pile on.
- **No `backdrop-blur`.**
- **Use shadcn primitives, not native HTML controls** — no raw `<select>` (use `Select` from [components/ui/select.jsx](next/src/components/ui/select.jsx)). Same for `Dialog`, `Button`, `Input`.
- **Never pass `className` to shadcn primitives to "fix" spacing.** They already have correct padding/margin/gap baked in. Adding `mt-*`, `space-*`, `gap-*`, `flex` to `DialogFooter`/`DialogHeader`/`DialogContent`/`Button` breaks the design. Wrap in your own `<div>` for outer layout. **`DialogFooter`: never add `className`.**
- **Dashboard cards: `bg-white rounded-xl p-5 sm:p-6`**, `text-gray-900` headings, `text-gray-500/600` muted text. Pills: `bg-amber-100 text-amber-700` / `bg-primary-100 text-primary-700`.
- **`<GenericPage>` is the default dashboard shell** ([components/dashboard/GenericPage.js](next/src/components/dashboard/GenericPage.js)) — every `(app)/app/*` page wraps in it. Provides `DashH2` title, top-right `side` slot (header buttons or "5/10 seats used" + "Add user" combos), consistent rhythm. Use `titleComponent` only when the title needs custom interactivity (see [TeamNameEditor.js](next/src/app/(app)/app/(admin)/admin/TeamNameEditor.js)). Don't override its spacing with `className`, don't add `text-sm`/`text-xs` to `side` content.
- **No filler subtitles or AI-flavored copy** on stat cards. If "Members: 5/10" says it all, don't add "All seats accounted for."
- **Stick to lucide icons already used in the codebase** and verify they exist before importing.

### Do not code defensively

Non-negotiable. **Read the function you're calling** before adding a check, then trust it.

Don't write:

- `if (!res || !res.success) throw new Error(res?.message || "fallback")` when the helper already throws. [Api.js](next/src/lib/client/Api.js) helpers (`get`/`post`/`put`/`withBody`) throw a real `Error` on `!res.ok` or `!json.success` — the success path is guaranteed.
- `getErrorMessage(err, fallback)` ladders that probe `err.message`, `err.error.message`, `JSON.stringify(err)`. The thrown error is always an `Error` with a string `.message`. Just `toast.error(err.message)`.
- `res?.field`, `err?.message`, `obj?.foo?.bar` "to be safe" when the value isn't optional. `?.` is for genuinely optional values (e.g. populated relations that may be unpopulated), not a shield against not reading the code.
- `try/catch` that swallows the error and substitutes a generic string. The thrown message is the actual cause — surface it.
- Fallback strings for impossible cases ("Could not send invite" after a helper that already threw something specific).

Three lines of clean code matching the actual contract beat ten lines of paranoia obscuring it.

### Behavior

- Be critical of implementation ideas — challenge approaches that seem suboptimal instead of just executing.
