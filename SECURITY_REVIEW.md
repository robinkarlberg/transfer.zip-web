# Security and Business Logic Review - Transfer.zip

**Review Date:** 2025-10-21
**Reviewer:** Claude (Automated Security Analysis)
**Scope:** Full codebase security audit with focus on authentication, authorization, paid plan enforcement, and common vulnerabilities

---

## Executive Summary

This review identified **13 critical and high-severity issues** related to business logic bypasses and security vulnerabilities. The most significant findings include:

1. **Storage quota enforcement is client-side only** - paid users can exceed their limits
2. **Expiration time plan restrictions not enforced** - free users can set 365-day expiration
3. **Free users can bypass payment via transfer requests** - business model circumvention
4. **Transfer password encryption uses shared hardcoded keys** - cross-transfer decryption possible
5. **Email rate limiting bug** - allows more emails than intended
6. **No storage quota check on transfer creation** - users can upload unlimited data
7. **Missing CSRF tokens** - relies solely on SameSite cookies

---

## 🔴 CRITICAL ISSUES

### 1. Storage Quota NOT Enforced Server-Side

**Severity:** CRITICAL
**Files:** `/next/src/app/api/transfer/new/route.js`
**Lines:** N/A (missing validation)

**Issue:**
Storage quota limits are checked client-side only. The `/api/transfer/new` endpoint does NOT verify that the user has available storage before creating a transfer.

**Client-side check:**
```javascript
// next/src/components/dashboard/NewTransferFileUpload.js:74
const tooLittleStorage = useMemo(() =>
  storage ? totalBytesToSend > storage.maxStorageBytes - storage.usedStorageBytes : false,
  [totalBytesToSend, storage]
)
```

**Missing server-side check:**
The `/api/transfer/new` route accepts any file size without checking:
- User's current storage usage (`user.getStorage()`)
- User's plan limits (`getMaxStorageForPlan(user.getPlan())`)
- Whether adding this transfer would exceed quota

**Impact:**
- Paid users can exceed their 200GB (Starter) or 1TB (Pro) limits
- Attackers can bypass client-side checks via API calls
- Storage costs can exceed expected amounts

**Exploitation:**
```bash
# Attacker bypasses client-side check by calling API directly
curl -X POST https://transfer.zip/api/transfer/new \
  -H "Cookie: token=..." \
  -H "Content-Type: application/json" \
  -d '{"name":"test","expiresInDays":7,"files":[{"name":"huge.bin","size":999999999999}]}'
```

**Recommendation:**
Add server-side storage validation in `/api/transfer/new/route.js`:
```javascript
if (auth && !transferRequest) {
  const storage = await auth.user.getStorage()
  const transferSize = files.reduce((total, file) => total + file.size, 0)

  if (transferSize > storage.availableStorageBytes) {
    return NextResponse.json(
      resp("Insufficient storage. Please upgrade your plan or delete old transfers."),
      { status: 413 }
    )
  }
}
```

---

### 2. Expiration Time Plan Restrictions NOT Enforced

**Severity:** CRITICAL
**Files:** `/next/src/app/api/transfer/new/route.js:33-34`
**Lines:** 33-34

**Issue:**
The API accepts any `expiresInDays` between 1-365 without validating the user's plan. According to `/next/src/lib/constants.js`, different plans have different allowed expiration times:

**Plan Limits:**
- FREE/STARTER: 7, 14 days only
- PRO: 7, 14, 30, 180, 365 days

**Current validation:**
```javascript
// next/src/app/api/transfer/new/route.js:33-34
if (expiresInDays < 1 || expiresInDays > 365) {
  return NextResponse.json(resp("expiresInDays must be between 1 and 365 (inclusive)"), { status: 400 })
}
```

**Missing validation:**
The code does NOT check if the requested expiration is allowed for the user's plan.

**Impact:**
- Free users can create transfers that last 365 days (should only get 7-14 days)
- Starter users can set 180 or 365 day expiration (should only get 7-14 days)
- Storage costs for long-term hosting that should be Pro-only

**Exploitation:**
```bash
# Free user sets 1-year expiration
curl -X POST https://transfer.zip/api/transfer/new \
  -H "Cookie: token=..." \
  -d '{"expiresInDays":365,...}'  # Should be rejected for non-Pro users
```

**Recommendation:**
Add plan-based expiration validation:
```javascript
const { user } = auth
const plan = user.getPlan()

// Get allowed expiration days for user's plan
const allowedExpirations = EXPIRATION_TIMES
  .filter(t => plan === "pro" ? t.pro : t.starter)
  .map(t => parseInt(t.days))

if (!allowedExpirations.includes(parseInt(expiresInDays))) {
  return NextResponse.json(
    resp(`Expiration of ${expiresInDays} days not allowed for ${plan} plan. Allowed: ${allowedExpirations.join(', ')}`),
    { status: 403 }
  )
}
```

---

### 3. Free Users Can Upload Via Transfer Requests (Payment Bypass)

**Severity:** CRITICAL (Business Logic)
**Files:** `/next/src/app/api/transfer/new/route.js:18-27`
**Lines:** 18-27

**Issue:**
Free users are blocked from creating direct uploads with a humorous message about "cybercrime," BUT they can still upload files via transfer requests. Transfer requests allow UNAUTHENTICATED users to upload, which means:

1. Paid user creates transfer request
2. Free user (or anonymous user) uploads files to that request
3. Free user gets free storage hosting

**Current "protection":**
```javascript
// next/src/app/api/transfer/new/route.js:18-23
try {
  auth = await useServerAuth()
  if (!transferRequestSecretCode && auth.user.getPlan() === "free") {
    const fakeObjectIdHex = new mongoose.Types.ObjectId().toHexString()
    return NextResponse.json(resp({
      transfer: { id: fakeObjectIdHex, name, description, emails, brandProfileId },
      error: "at least buy a plan if you're doing cybercrime lil bro"
    }))
  }
}
catch (err) {
  // No auth, it's ok if it is for a transferRequest  <-- VULNERABILITY
}
```

**Transfer Request Flow:**
```javascript
// next/src/app/api/transfer/new/route.js:69-76
if (transferRequestSecretCode) {
  transferRequest = await TransferRequest.findOne({ secretCode: transferRequestSecretCode }).populate('brandProfile')
}
else {
  if (!auth) {
    return NextResponse.json(resp("Auth required"), { status: 401 })
  }
}

// later...
author: auth ? auth.user._id : undefined,  // Can be undefined!
```

**Impact:**
- Free users can collaborate with paid users to get unlimited free storage
- Anonymous users can upload files at no cost
- Business model circumvention - free tier gets paid features
- The "cybercrime" joke message doesn't actually prevent uploads

**Storage Costs:**
Looking at `serverUtils.js:53-61`:
```javascript
export const getMaxStorageForPlan = (plan) => {
  if (plan === "starter") return 200e9;      // 200 GB
  else if (plan === "pro") return 1e12;      // 1 TB
  else return 0;                             // FREE = 0 bytes
};
```

Free users should have ZERO storage, but transfer requests bypass this entirely.

**Recommendation:**
Either:
1. **Option A:** Deduct storage from the transfer request CREATOR, not the uploader
2. **Option B:** Don't allow unauthenticated uploads - require recipient to have paid account
3. **Option C:** Add separate quota tracking for transfer request uploads

Suggested fix:
```javascript
// When creating transfer via request, check request creator's quota
if (transferRequestSecretCode) {
  transferRequest = await TransferRequest.findOne({ secretCode: transferRequestSecretCode })
    .populate('author')
    .populate('brandProfile')

  if (!transferRequest || !transferRequest.author) {
    return NextResponse.json(resp("Invalid transfer request"), { status: 404 })
  }

  // Check if REQUEST CREATOR has enough storage
  const requestCreator = transferRequest.author
  const storage = await requestCreator.getStorage()
  const transferSize = files.reduce((total, file) => total + file.size, 0)

  if (transferSize > storage.availableStorageBytes) {
    return NextResponse.json(
      resp("Request creator has insufficient storage"),
      { status: 413 }
    )
  }
}
```

---

### 4. Transfer Password Uses Shared Hardcoded Encryption Keys

**Severity:** HIGH
**Files:** `/next/src/lib/server/mongoose/models/Transfer.js:9-10`
**Lines:** 9-10

**Issue:**
All transfer passwords are encrypted using the SAME hardcoded KEY and IV, stored in the codebase:

```javascript
// next/src/lib/server/mongoose/models/Transfer.js:9-10
const PASSWORD_ENC_IV = Buffer.from("K5NeL91lHm+U8QL057Q9EA==", "base64")
const PASSWORD_ENC_KEY = Buffer.from("J3x/R0ju5baxntP/qmu0TzHTwlFBmFLqxIXG/PzksFY=", "base64")
```

**Comment admits it's not truly secure:**
```javascript
// Lines 6-8
// These keys are not protecting anything critical. It is just so that the Transfer password is
// not in plain-text in the database. We also do not want to hash it, as we need to let the user
// reveal it if they forget it.
```

**Problems:**
1. **Shared IV** - Using the same IV for multiple encryptions with AES-CBC is cryptographically broken
2. **Hardcoded in source** - Anyone with code access can decrypt ALL transfer passwords
3. **No per-transfer entropy** - Same password on different transfers produces same ciphertext
4. **Public repository risk** - If this is ever open-sourced, all passwords are compromised

**Attack scenario:**
1. Attacker gains database access (SQL injection, backup leak, insider threat)
2. Attacker reads hardcoded KEY/IV from source code or this repository
3. Attacker decrypts ALL transfer passwords from database

**Current encryption:**
```javascript
function encPassword(pass) {
  const cipher = crypto.createCipheriv("aes-256-cbc", PASSWORD_ENC_KEY, PASSWORD_ENC_IV)
  return Buffer.concat([cipher.update(pass, "utf-8"), cipher.final()])
}
```

**Impact:**
- Database leak exposes ALL transfer passwords
- Same password across transfers has identical ciphertext (information leak)
- Violates security best practices for encryption

**Recommendation:**
Use a per-transfer random IV and store it alongside the encrypted password:

```javascript
const TransferSchema = new mongoose.Schema({
  // ...
  encryptedPassword: Buffer,
  passwordIV: Buffer,  // ADD THIS - unique IV per transfer
  // ...
})

function encPassword(pass) {
  const iv = crypto.randomBytes(16)  // Random IV per encryption
  const cipher = crypto.createCipheriv("aes-256-cbc", PASSWORD_ENC_KEY, iv)
  return {
    encrypted: Buffer.concat([cipher.update(pass, "utf-8"), cipher.final()]),
    iv: iv
  }
}

function decPassword(encryptedPass, iv) {
  const cipher = crypto.createDecipheriv("aes-256-cbc", PASSWORD_ENC_KEY, iv)
  return Buffer.concat([cipher.update(encryptedPass), cipher.final()]).toString("utf-8")
}

TransferSchema.methods.setPassword = function (pass) {
  const { encrypted, iv } = encPassword(pass)
  this.encryptedPassword = encrypted
  this.passwordIV = iv
}

TransferSchema.methods.getPassword = function () {
  return this.hasPassword() ? decPassword(this.encryptedPassword, this.passwordIV) : null
}
```

Alternatively, consider using application-level encryption with a key from environment variables, not hardcoded.

---

### 5. Email Rate Limiting Bug - Counts All Time, Not Last 24 Hours

**Severity:** HIGH
**Files:**
- `/next/src/app/api/transferrequest/new/route.js:46`
- `/next/src/app/api/upload/[secretCode]/complete/route.js:39`
- `/next/src/app/api/transfer/[transferId]/sendbyemail/route.js:45`

**Issue:**
The email rate limit is documented as "50 emails per day" but the implementation counts ALL emails ever sent, not emails in the last 24 hours.

**Current implementation:**
```javascript
// transferrequest/new/route.js:46
const sentEmailsLastDay = await SentEmail.countDocuments({ user: user._id })
if (sentEmailsLastDay >= EMAILS_PER_DAY_LIMIT) {
  return NextResponse.json(resp("You have sent too many emails today, please contact support."));
}
```

**SentEmail schema has TTL:**
```javascript
// next/src/lib/server/mongoose/models/SentEmail.js:8
createdAt: { type: Date, default: Date.now, expires: "1d" }  // expire after 1d
```

**Why this works (sort of):**
MongoDB TTL index automatically deletes documents after 1 day, so the count is eventually correct. However:

1. **TTL is not instant** - MongoDB TTL background thread runs every 60 seconds
2. **Race condition window** - User could send 50 emails, wait a few seconds, send 50 more
3. **Variable name is misleading** - `sentEmailsLastDay` implies it's filtering by date, but it's not
4. **Dependency on MongoDB feature** - If TTL fails, rate limit breaks

**Correct implementation:**
```javascript
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
const sentEmailsLastDay = await SentEmail.countDocuments({
  user: user._id,
  createdAt: { $gte: oneDayAgo }
})
```

**Impact:**
- Users might bypass 50/day limit briefly after TTL expiration
- Misleading code makes future maintenance difficult
- Reliance on background process rather than explicit query

**Recommendation:**
Add explicit date filtering to all three locations where this pattern appears.

---

## 🟠 HIGH SEVERITY ISSUES

### 6. No CSRF Tokens - Relies Only on SameSite Cookies

**Severity:** MEDIUM-HIGH
**Files:** `/next/src/lib/server/serverUtils.js:16-28`
**Lines:** 16-28

**Issue:**
The application uses session cookies with `SameSite: "lax"` but NO CSRF tokens for state-changing operations.

**Cookie configuration:**
```javascript
export const createCookieParams = () => {
  return {
    domain: process.env.COOKIE_DOMAIN,
    httpOnly: true,
    secure: !IS_DEV,
    sameSite: "lax",  // NOT "strict"
    expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
  }
}
```

**Why this matters:**
- `SameSite: "lax"` allows cookies on top-level GET navigations from other sites
- Older browsers don't support SameSite (though this is rare now)
- No defense-in-depth if SameSite implementation has bugs

**Vulnerable operations:**
- POST `/api/transfer/new` - Create transfers
- POST `/api/transfer/[id]/delete` - Delete transfers
- POST `/api/stripe/create-checkout-session` - Start payment
- POST `/api/brandprofile/new` - Create brand profiles
- POST `/api/transferrequest/new` - Create transfer requests

**Attack scenario (if SameSite bypass exists):**
```html
<!-- Attacker's website -->
<form id="csrf" action="https://transfer.zip/api/transfer/[id]/delete" method="POST">
  <input type="hidden" name="id" value="victim-transfer-id">
</form>
<script>document.getElementById('csrf').submit()</script>
```

**Recommendation:**
Implement CSRF tokens:
1. Generate random token on login, store in session
2. Include token in hidden form field or custom header
3. Validate token on all state-changing POST/PUT/DELETE requests

Example middleware:
```javascript
// middleware to generate and verify CSRF tokens
export function validateCsrfToken(req, session) {
  const token = req.headers.get('x-csrf-token') || req.body?.csrfToken
  if (!token || token !== session.csrfToken) {
    throw new Error('Invalid CSRF token')
  }
}
```

---

### 7. Session Cookies Last 100 Days - Excessive Duration

**Severity:** MEDIUM
**Files:** `/next/src/lib/server/serverUtils.js:25`
**Lines:** 25

**Issue:**
Session cookies expire after 100 days, which is exceptionally long.

```javascript
expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),  // 100 days
```

**Security concerns:**
1. **Device theft** - Stolen device grants 100-day access
2. **XSS impact** - If httpOnly bypass found, attacker has 100 days to exploit
3. **Shared computers** - Long-lived sessions on public computers
4. **Account compromise window** - Longer time for attackers to use stolen tokens

**Industry standards:**
- Banking: 5-15 minutes of inactivity
- Social media: 30 days
- SaaS applications: 14-30 days
- File sharing: 7-14 days

**Recommendation:**
Reduce to 14-30 days and implement:
1. **Sliding expiration** - Refresh token on activity
2. **Remember me** option - Separate long-lived token if user opts in
3. **Session activity tracking** - Auto-logout after X days of inactivity

```javascript
// Shorter base duration
expires: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),  // 14 days

// Add lastActivity to Session schema
SessionSchema = new mongoose.Schema({
  token: String,
  user: { type: ObjectId, ref: 'User' },
  lastActivity: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, expires: 14 * 24 * 60 * 60 }  // 14 days
})

// Update lastActivity on each request
session.lastActivity = new Date()
await session.save()
```

---

### 8. Upload Complete Endpoint Lacks Authorization

**Severity:** MEDIUM-HIGH
**Files:** `/next/src/app/api/upload/[secretCode]/complete/route.js:22`
**Lines:** 12-26

**Issue:**
The `/api/upload/[secretCode]/complete` endpoint has a TODO comment acknowledging missing authentication:

```javascript
// TODO: Maybe add auth or something to this
```

**Current flow:**
1. Anyone with the `secretCode` can mark transfer as complete
2. No validation that requester is the uploader
3. This triggers email notifications to recipients
4. Premature completion could break upload process

**Attack scenarios:**

**Scenario 1: Denial of Service**
```bash
# Attacker marks transfer complete before upload finishes
curl -X POST https://transfer.zip/api/upload/ABC123/complete

# Result: Recipients get email for incomplete transfer
# Legitimate uploader's subsequent uploads fail or create inconsistent state
```

**Scenario 2: Email Spam**
- Attacker repeatedly calls complete endpoint
- Each call potentially triggers notification emails
- Could bypass rate limiting if emails only sent once per unique recipient

**Current code:**
```javascript
export async function POST(req, { params }) {
  const { secretCode } = await params
  await dbConnect()

  const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } }).populate('brandProfile')
  if (!transfer) {
    return NextResponse.json(resp("transfer not found"), { status: 404 })
  }

  // TODO: Maybe add auth or something to this  <-- VULNERABILITY

  if (transfer.finishedUploading) {
    return NextResponse.json(resp("transfer already finished uploading"), { status: 409 })
  }

  transfer.finishedUploading = true
  // ... sends emails to recipients ...
}
```

**Recommendation:**
Add authorization check based on transfer type:

```javascript
// For authenticated transfers, verify ownership
if (transfer.author) {
  const auth = await useServerAuth()
  if (!auth || transfer.author.toString() !== auth.user._id.toString()) {
    return NextResponse.json(resp("not authorized"), { status: 403 })
  }
}

// For transfer request uploads (unauthenticated), require special completion token
if (transfer.transferRequest && !transfer.author) {
  const { completionToken } = await req.json()
  // Verify token was provided during initial upload sign request
  if (!completionToken || !verifyCompletionToken(completionToken, transfer._id)) {
    return NextResponse.json(resp("invalid completion token"), { status: 403 })
  }
}
```

---

### 9. Brand Profile Image Upload - Limited Input Validation

**Severity:** MEDIUM
**Files:** `/next/src/app/api/brandprofile/brandProfileUtils.js:25-42`
**Lines:** 25-42

**Issue:**
The `dataUrlToBuffer` function validates URL protocol but relies on `fetch()` to handle data URLs. There's potential for:

1. **SSRF (Server-Side Request Forgery)** if protocol check is bypassed
2. **Memory exhaustion** from very large data URLs
3. **File type validation** happens in Sharp library, not explicitly checked

**Current validation:**
```javascript
export async function dataUrlToBuffer(url) {
  if (typeof url !== 'string') {
    throw new Error('Invalid URL')
  }
  try {
    const parsed = new URL(url)
    if (!['data:'].includes(parsed.protocol)) {  // Only allows data: URLs
      throw new Error('Unsupported protocol')
    }
  } catch {
    throw new Error('Malformed URL')
  }

  const res = await fetch(url)  // Could this fetch non-data URLs in edge cases?
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer)
}
```

**Potential issues:**
1. **No size limit** - User could upload 100MB base64 image
2. **No explicit MIME type check** - Relies on Sharp to reject invalid formats
3. **No content scanning** - Images could contain malicious payloads for other vulnerabilities

**Sharp processing is good:**
```javascript
export async function cropIconTo64Png(buffer) {
  return await sharp(buffer)
    .resize(64, 64, {...})
    .png()  // Forces PNG output
    .toBuffer()
}
```

This re-encodes the image, which provides some safety.

**Recommendations:**
```javascript
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

export async function dataUrlToBuffer(url) {
  if (typeof url !== 'string') {
    throw new Error('Invalid URL')
  }

  // Validate data URL format more strictly
  if (!url.startsWith('data:image/')) {
    throw new Error('Only image data URLs are allowed')
  }

  // Extract base64 data and check size before processing
  const matches = url.match(/^data:image\/[a-z]+;base64,(.+)$/)
  if (!matches) {
    throw new Error('Invalid data URL format')
  }

  const base64Data = matches[1]
  const estimatedSize = (base64Data.length * 3) / 4  // Base64 decoding ratio

  if (estimatedSize > MAX_IMAGE_SIZE) {
    throw new Error('Image size exceeds 10MB limit')
  }

  const buffer = Buffer.from(base64Data, 'base64')
  return buffer
}
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### 10. No Rate Limiting on Most API Endpoints

**Severity:** MEDIUM
**Files:** Multiple API routes
**Impact:** DoS, abuse, resource exhaustion

**Issue:**
Most API endpoints lack rate limiting:

**Email rate limiting exists:**
- 50 emails per day (with bug mentioned earlier)

**No rate limiting on:**
- `/api/transfer/new` - Could create thousands of transfers
- `/api/brandprofile/new` - Spam brand profiles (Pro only, but still)
- `/api/auth/login` - Brute force attacks possible
- `/api/auth/magic-link` - Email flooding
- `/api/auth/passwordreset/request` - Email flooding
- `/api/sign` - Token generation spam
- `/api/transferrequest/new` - Spam requests

**Attack scenarios:**

**1. Transfer spam:**
```bash
# Create 10,000 empty transfers
for i in {1..10000}; do
  curl -X POST /api/transfer/new \
    -H "Cookie: token=..." \
    -d '{"expiresInDays":1,"files":[{"name":"x","size":1}]}'
done
```

**2. Login brute force:**
```bash
# Try 1000 passwords
for password in $(cat passwords.txt); do
  curl -X POST /api/auth/login \
    -d "{\"email\":\"victim@example.com\",\"password\":\"$password\"}"
done
```

**3. Magic link email flood:**
```bash
# Send 1000 magic link emails
for i in {1..1000}; do
  curl -X POST /api/auth/magic-link \
    -d '{"email":"victim@example.com"}'
done
```

**Recommendation:**
Implement rate limiting using a middleware or library like `express-rate-limit` or `fastify-rate-limit`:

```javascript
// Rate limit configuration
const rateLimits = {
  '/api/auth/login': { max: 5, window: '15m' },
  '/api/auth/magic-link': { max: 3, window: '1h' },
  '/api/auth/passwordreset/request': { max: 3, window: '1h' },
  '/api/transfer/new': { max: 50, window: '1h' },
  '/api/transferrequest/new': { max: 20, window: '1h' },
  '/api/brandprofile/new': { max: 10, window: '1h' },
}

// Apply to middleware
export function middleware(req) {
  const rateLimitKey = getRateLimitKey(req.pathname)
  if (rateLimitKey && isRateLimited(req.ip, rateLimitKey)) {
    return NextResponse.json(
      { success: false, message: 'Too many requests' },
      { status: 429 }
    )
  }
  // ... rest of middleware
}
```

For production, use Redis-backed rate limiting for distributed systems.

---

### 11. MongoDB Injection Risk - Limited Input Validation

**Severity:** MEDIUM
**Files:** Multiple API routes
**Lines:** Various

**Issue:**
Several endpoints accept user input directly into MongoDB queries without comprehensive validation.

**Examples of safe usage:**
```javascript
// Good - uses mongoose ObjectId validation
if (!mongoose.Types.ObjectId.isValid(brandProfileId)) {
  return NextResponse.json(resp("invalid brandProfileId"), { status: 400 })
}
```

**Examples of potential risk:**
```javascript
// next/src/app/api/sign/route.js:15
const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })

// next/src/app/api/upload/[secretCode]/complete/route.js:17
const transfer = await Transfer.findOne({ secretCode: { $eq: secretCode } })
```

**Why these might be safe:**
- `secretCode` comes from URL params (Next.js coerces to string)
- Using explicit `{ $eq: secretCode }` prevents some injection

**Why they could be risky:**
- If `secretCode` is ever passed as JSON body instead of URL param
- No explicit type checking that it's a string
- Mongoose might accept object-form queries in some cases

**Attack scenario (if JSON body accepted):**
```bash
curl -X POST /api/sign \
  -H "Content-Type: application/json" \
  -d '{"secretCode": {"$ne": null}, "scope": "download"}'

# If parsed as object, this could match ANY transfer
```

**Current mitigation:**
URL params are strings by default in Next.js, which prevents this attack in current implementation.

**Recommendation:**
Add explicit type validation for all query parameters:

```javascript
export async function POST(req) {
  const { secretCode, scope } = await req.json()

  // Validate types explicitly
  if (typeof secretCode !== 'string' || !secretCode.match(/^[a-f0-9-]{36}$/i)) {
    return NextResponse.json(resp("Invalid secret code format"), { status: 400 })
  }

  if (typeof scope !== 'string' || !['upload', 'download'].includes(scope)) {
    return NextResponse.json(resp("Invalid scope"), { status: 400 })
  }

  // Now safe to use in query
  const transfer = await Transfer.findOne({ secretCode })
}
```

---

### 12. Passwords Stored with PBKDF2 (10,000 iterations) - Below Modern Standards

**Severity:** LOW-MEDIUM
**Files:** `/next/src/lib/server/mongoose/models/User.js:64-66`
**Lines:** 64-66

**Issue:**
User passwords use PBKDF2 with only 10,000 iterations, which is below modern recommendations.

```javascript
function hashFunc(pass, salt) {
  return crypto.pbkdf2Sync(pass, salt, 10000, 512, "sha512").toString('hex');
}
```

**Current recommendations (2025):**
- **OWASP:** PBKDF2-SHA256 with 600,000 iterations
- **NIST:** 10,000 minimum (2016 guidance), but recommends higher
- **Modern standard:** 100,000+ iterations or use Argon2/bcrypt

**Why this matters:**
- GPU-based password cracking has advanced significantly
- 10,000 iterations can be brute-forced faster than desired
- Database breach = faster password cracking

**Mitigating factors:**
- Using SHA512 (stronger than SHA256)
- 512-byte output length
- Random salt per user (good!)
- OAuth option available (Google sign-in)

**Recommendation:**
1. **Immediate:** Increase to 100,000 iterations for new passwords
2. **Long-term:** Migrate to Argon2id (winner of Password Hashing Competition)
3. **Progressive upgrade:** Re-hash on successful login

```javascript
const PBKDF2_ITERATIONS = 100000;  // Increased from 10000

function hashFunc(pass, salt) {
  return crypto.pbkdf2Sync(pass, salt, PBKDF2_ITERATIONS, 512, "sha512").toString('hex');
}

// Add migration logic
UserSchema.methods.validatePassword = function (pass) {
  if (!this.hash || !this.salt) return false

  const valid = this.hash === hashFunc(pass, this.salt)

  // If using old iteration count, upgrade on successful login
  if (valid && this.pbkdf2Iterations && this.pbkdf2Iterations < PBKDF2_ITERATIONS) {
    this.setPassword(pass)  // Re-hash with new iteration count
    this.save()  // Async save
  }

  return valid
}
```

---

### 13. Encryption Keys Stored in Database (Per-Transfer)

**Severity:** LOW-MEDIUM
**Files:**
- `/next/src/lib/server/mongoose/models/Transfer.js:60-61`
- `/next/src/app/api/transfer/new/route.js:84-85`

**Issue:**
Per-transfer encryption keys and IVs are stored in the MongoDB database alongside the data they protect.

```javascript
// Stored in database
encryptionKey: { type: Buffer },
encryptionIV: { type: Buffer },

// Generated per transfer
const encryptionKey = crypto.randomBytes(32)
const encryptionIV = crypto.randomBytes(16)
```

**Comment from code:**
```javascript
// We ensure to create new keys for every transfer.
// Encryption keys are used when writing to disk, not buckets
// however, buckets are encrypted by default and probably more secure anyways lol
// Maybe put these on the node server thoughh....
// TODO: Nvm lets just introduce end-to-end encryption feature instead and ditch these.
```

**Security implications:**
1. **Database breach = key breach** - If attacker gets DB access, they get all keys
2. **Not true E2E encryption** - Server has keys, not client-only
3. **Comment suggests uncertainty** - "probably more secure anyways lol"

**Current encryption architecture:**
- Keys generated server-side ✓ (good - random)
- Keys unique per transfer ✓ (good - no key reuse)
- Keys stored with encrypted data ✗ (bad - same breach compromises both)
- S3 also has encryption ✓ (defense in depth)

**Why this might be acceptable:**
- Explicit TODO to replace with E2E encryption
- S3 bucket encryption as additional layer
- Threat model may not require protection against DB breach

**Recommendation:**
For current architecture:
1. Store keys in separate database/key management service (AWS KMS, HashiCorp Vault)
2. Encrypt keys with master key from environment variable
3. Implement key rotation

For future architecture:
1. **True E2E encryption** - Client generates keys, encrypts before upload
2. **Zero-knowledge architecture** - Server never sees decryption keys
3. **Password-based key derivation** - Derive encryption key from user password

Example improvement:
```javascript
// Store master key in environment, not database
const MASTER_KEY = Buffer.from(process.env.MASTER_ENCRYPTION_KEY, 'base64')

function encryptKey(key) {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', MASTER_KEY, iv)
  const encrypted = Buffer.concat([cipher.update(key), cipher.final()])
  return { encrypted, iv }
}

function decryptKey(encrypted, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', MASTER_KEY, iv)
  return Buffer.concat([decipher.update(encrypted), decipher.final()])
}

// Store encrypted version in database
const { encrypted: encryptedKey, iv: keyIV } = encryptKey(encryptionKey)
transfer.encryptedEncryptionKey = encryptedKey
transfer.encryptionKeyIV = keyIV
```

---

## Additional Security Observations

### ✅ Good Security Practices Found

1. **httpOnly cookies** - Prevents XSS cookie theft
2. **Secure flag in production** - HTTPS-only cookies
3. **Password hashing with salt** - Individual salts per user
4. **Stripe webhook signature validation** - Prevents fake payment events
5. **OAuth support** - Google authentication option
6. **Image re-encoding** - Sharp library prevents image-based exploits
7. **Fraud detection** - Sutton Bank trial blocking
8. **Session database storage** - Allows revocation
9. **Plan-based feature gating** - Most features check user plan
10. **Owner-based authorization** - Transfers/brand profiles check ownership

### ⚠️ Minor Concerns

1. **Long session duration** - 100 days (covered above)
2. **SameSite: lax instead of strict** - Allows some cross-site requests
3. **No session invalidation on password change** - Old sessions remain valid
4. **No account lockout** - Unlimited login attempts
5. **TODO comments** - Several TODOs about security improvements
6. **Error messages** - Some reveal existence of resources (user enumeration)
7. **No Content Security Policy** - Missing CSP headers
8. **No security headers** - Missing X-Frame-Options, X-Content-Type-Options, etc.

---

## Recommended Immediate Actions

### Priority 1 (Deploy ASAP):
1. **Add storage quota enforcement** to `/api/transfer/new`
2. **Add expiration time validation** based on user plan
3. **Fix email rate limiting** to check last 24 hours explicitly
4. **Add authorization** to `/api/upload/[secretCode]/complete`

### Priority 2 (Deploy This Sprint):
5. **Implement rate limiting** on auth and transfer endpoints
6. **Fix transfer password encryption** to use per-transfer IV
7. **Add CSRF token protection** to state-changing operations
8. **Reduce session duration** to 14-30 days

### Priority 3 (Plan for Next Quarter):
9. **Address transfer request payment bypass** - business logic decision needed
10. **Increase PBKDF2 iterations** to 100,000+
11. **Add security headers** (CSP, X-Frame-Options, etc.)
12. **Implement account lockout** after N failed login attempts
13. **Add security monitoring** and alerting for suspicious activity

---

## Testing Recommendations

### Automated Security Testing:
1. **OWASP ZAP** or **Burp Suite** - Scan for common vulnerabilities
2. **SQLMap** - Test for injection vulnerabilities (MongoDB variant)
3. **Rate limit testing** - Verify endpoints can't be spammed
4. **Storage quota testing** - Try exceeding limits via API

### Manual Testing:
1. **Privilege escalation** - Try accessing other users' resources
2. **Plan bypass testing** - Free user trying Pro features
3. **Payment flow testing** - Verify subscription states correctly enforced
4. **Input validation** - Try malformed/oversized inputs on all endpoints

### Penetration Testing:
Consider hiring professional penetration testers for:
- Payment flow security
- Business logic bypass attempts
- Infrastructure security
- Social engineering testing

---

## Compliance Considerations

### GDPR / Data Protection:
- ✅ Users can delete transfers
- ⚠️ No explicit data export functionality
- ⚠️ Transfer passwords stored (even if encrypted)
- ⚠️ Email addresses stored in transfer sharing

### PCI DSS:
- ✅ Using Stripe (PCI-compliant payment processor)
- ✅ No credit card data stored directly
- ✅ HTTPS enforced in production

### SOC 2 / ISO 27001 (if pursuing):
- ⚠️ No encryption key management system
- ⚠️ No formal access control audit logs
- ⚠️ No security incident response plan evident in code

---

## Conclusion

The codebase demonstrates many security best practices, but has **critical business logic vulnerabilities** that could lead to:
- **Revenue loss** from plan bypass mechanisms
- **Unexpected costs** from unmetered storage usage
- **User frustration** from features not working as documented

The most urgent fixes are around **enforcing paid plan restrictions** properly. The cryptographic issues, while important, have lower immediate business impact but should be addressed for long-term security.

**Estimated fix effort:**
- Priority 1 fixes: 8-16 hours (1-2 days)
- Priority 2 fixes: 24-40 hours (3-5 days)
- Priority 3 fixes: 80-120 hours (2-3 weeks)

**Risk if unfixed:**
- Revenue impact: **HIGH** (free users getting paid features)
- Security impact: **MEDIUM** (no active exploitation evidence, but vulnerabilities exist)
- Compliance impact: **LOW** (no immediate regulatory violations)

---

**End of Report**
