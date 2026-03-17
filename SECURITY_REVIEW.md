# Security Review Report — FleetFlow_Odoo

**Date:** 2026-03-17
**Scope:** Full codebase static analysis
**Branch:** `claude/security-review-muajY`

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2 |
| HIGH     | 4 |
| MEDIUM   | 7 |
| LOW      | 4 |

---

## CRITICAL

### 1. SQL Injection via Dynamic Column Names
- **Files:**
  - `server/routes/vehicles.js` lines 83–112 (PATCH `/:id`)
  - `server/routes/drivers.js` lines 60–89 (PATCH `/:id`)
- **Issue:** Object keys from `req.body` are interpolated directly into SQL UPDATE queries without whitelisting:
  ```js
  for (const [key, value] of Object.entries(updates)) {
      query += `${key} = $${index}, `;  // key is unsanitized
  }
  ```
- **Fix:** Whitelist allowed column names before building the query.

### 2. Plaintext Passwords Stored in Memory
- **File:** `server/routes/auth.js` line 90
- **Issue:** During OTP-based registration, the user's plaintext password is stored in an in-memory `Map`:
  ```js
  otpStore.set(email, { name, password, role, otp, expires: ... });
  ```
- **Fix:** Hash the password with bcrypt before storing it, even temporarily.

---

## HIGH

### 3. Weak / Non-Cryptographic Token Generation
- **File:** `server/routes/auth.js` lines 87, 182
- **Issue:** OTPs and password-reset tokens are generated with `Math.random()`, which is not cryptographically secure and is predictable:
  ```js
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  ```
- **Fix:** Replace with `crypto.randomBytes()` / `crypto.randomInt()`.

### 4. Credentials and Tokens Exposed in Logs
- **File:** `server/routes/auth.js` lines 107, 193
- **Issue:**
  ```js
  console.log(`Fallback: OTP for ${email} is ${otp}`);
  console.log(`🔐 RESET PIN: ${token}`);
  ```
- **File:** `server/fix_pw.js` line 7
  ```js
  console.log("All users password updated to 'password123'");
  ```
- **Fix:** Remove all console logs that print secrets or tokens.

### 5. Dangerous Utility Script — fix_pw.js
- **File:** `server/fix_pw.js` (entire file)
- **Issue:** Resets **all** user passwords in the database to the hardcoded value `'password123'`. Accidental execution in production would be catastrophic.
- **Fix:** Delete the file or move it behind an environment guard that explicitly blocks non-development environments.

### 6. No Role-Based Access Control (RBAC)
- **Files:** All files under `server/routes/`
- **Issue:** JWT tokens carry a `role` field (`manager`, `dispatcher`, `safety`, `analyst`), but no middleware enforces role-based permissions. Any authenticated user can create, update, or delete any resource.
- **Additional:** `server/routes/auth.js` line 51 — role is accepted from the client during self-registration, allowing anyone to self-assign the `manager` role.
- **Fix:** Add an authorization middleware that validates the user's role before allowing write/delete operations. Consider removing role selection from the public registration flow.

---

## MEDIUM

### 7. Overly Permissive CORS
- **File:** `server/server.js` line 9
- **Issue:** `app.use(cors())` with no origin whitelist allows any domain to access the API.
- **Fix:** Configure CORS with an explicit `origin` allowlist.

### 8. No Rate Limiting on Authentication Endpoints
- **File:** `server/routes/auth.js`
- **Issue:** Login, registration, OTP verification, and forgot-password endpoints have no rate limiting, making them vulnerable to brute-force and credential-stuffing attacks.
- **Fix:** Apply `express-rate-limit` (or equivalent) to all auth routes.

### 9. Weak Password Requirements
- **File:** `server/routes/auth.js` line 50
- **Issue:** Minimum password length is 6 characters with no complexity requirements:
  ```js
  password: Joi.string().min(6).required()
  ```
- **Fix:** Enforce a minimum of 12 characters with mixed-case, digit, and symbol requirements.

### 10. In-Memory OTP/Reset-Token Store
- **File:** `server/routes/auth.js` lines 55, 165
- **Issue:** `otpStore` and the reset-token store are plain JavaScript `Map` objects. They do not survive server restarts and are not shared across multiple instances.
- **Fix:** Move token storage to a time-limited Redis key or a dedicated DB table with an expiry column.

### 11. Missing Input Validation on PATCH Endpoints
- **Files:**
  - `server/routes/vehicles.js` lines 83–112
  - `server/routes/drivers.js` lines 60–89
- **Issue:** No Joi (or equivalent) schema validates the fields accepted in PATCH requests.
- **Fix:** Define and enforce a schema for allowed fields and value types.

### 12. No Request Body Size Limit
- **File:** `server/server.js`
- **Issue:** `express.json()` is used without a `limit` option, enabling large-payload DoS attacks.
- **Fix:** Add `express.json({ limit: '10kb' })` (or a reasonable limit for the application).

### 13. Hardcoded Credentials in Version Control
- **Files:**
  - `db/migrations/02_seed.sql` lines 5–10 — bcrypt hash for test users committed to source control
  - `server/test_api.js` lines 7, 10 — `password: 'password123'`
  - `server/test_register.js` lines 4–12 — hardcoded test credentials
- **Fix:** Move seed passwords to environment variables; remove or gitignore test credential files.

---

## LOW

### 14. `SELECT *` Returns Password Hash
- **File:** `server/routes/auth.js` line 19
- **Issue:** `SELECT * FROM users WHERE email = $1` returns `password_hash` as part of the result set, even when only the hash is needed for comparison.
- **Fix:** Select only the required columns explicitly.

### 15. No Database `ON DELETE` Behaviour Defined
- **File:** `db/migrations/01_schema.sql`
- **Issue:** Foreign key relationships lack explicit `ON DELETE CASCADE` or `ON DELETE RESTRICT`, which can lead to orphaned records and data integrity issues.
- **Fix:** Add explicit `ON DELETE` actions to all foreign key constraints.

### 16. HTTP Used in Dev Proxy / Test Files (non-production)
- **Files:**
  - `client/vite.config.js` line 6 — `target: "http://localhost:5000"`
  - `server/test_api.js`, `server/test_register.js`, `test-ui.js` — various HTTP URLs
- **Issue:** Acceptable for local development but should never be used in production. Ensure production configuration enforces HTTPS.

### 17. Non-async JWT Verification
- **File:** `server/middleware/auth.js` line 9
- **Issue:** Callback-based `jwt.verify()` is inconsistent with the async/await pattern used elsewhere. Low severity but increases cognitive risk of misuse.
- **Fix:** Wrap in a `util.promisify` or use the synchronous overload with a try/catch.

---

## Files Referenced

| File | Issues |
|------|--------|
| `server/routes/vehicles.js` | #1, #11 |
| `server/routes/drivers.js` | #1, #11 |
| `server/routes/auth.js` | #2, #3, #4, #6, #8, #9, #10, #13, #14 |
| `server/fix_pw.js` | #4, #5 |
| `server/server.js` | #7, #12 |
| `server/middleware/auth.js` | #17 |
| `server/test_api.js` | #13, #16 |
| `server/test_register.js` | #13, #16 |
| `client/vite.config.js` | #16 |
| `db/migrations/01_schema.sql` | #15 |
| `db/migrations/02_seed.sql` | #13 |
| `test-ui.js` | #16 |
