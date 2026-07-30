# Auth

## JWT flow

```
User submits login form
  │
  ▼
loginFx (src/stores/auth.ts)
  POST /api/auth/login  { email, password }
  │
  ▼
BFF: src/app/api/auth/login/route.ts
  Proxies to  BACKEND_URL/api/auth/login
  Forwards the backend's  set-cookie: refresh_token=…; HttpOnly; SameSite=Lax
  Returns     { access_token: "…" }  in JSON body
  │
  ├─► Browser stores refresh_token in httpOnly cookie (JS cannot read it)
  └─► loginFx.done  →  samples into fetchCurrentUserFx
        (a token proves a session exists, not who owns it)
```

**Login sends only `{ email, password }`.** It used to send a hardcoded
`language: 'jp'` because FastAPI's `login` reused the registration schema; the backend
now has separate `UserRegister` / `UserLogin` schemas.

### Session resolution on page load

`src/app/providers.tsx` calls `fetchCurrentUserFx()` once, on mount:

```
fetchCurrentUserFx
  GET /api/users/me
  │
  ▼
BFF: src/app/api/users/me/route.ts
  backendFetch() → resolves an access token, attaches Bearer, calls FastAPI
  Re-stamps the `profile` cookie from the DB response
  │
  ▼
fetchCurrentUserFx.doneData → $currentUser  (or null on 401)
                            → $userProfile  (DB wins over the cookie)
                            → $sessionResolved = true
```

One request answers four things: whether a session exists, who the user is, what their
study language is, and what their display preferences are. A 401 resolves to `null` —
an ordinary "signed out", not an error.

This replaced a `refreshFx` that fetched a real 15-minute JWT into
`$auth.accessToken`, never sent it anywhere, and was read only to compute
`$isAuthenticated`. It also ran from two places (`page.tsx` and `AuthGate`) and raced
itself. Reloading while signed in blanked the user's email, because `refreshFx` set only
the token and never the user.

### Access-token caching

Protected BFF routes go through `backendFetch` (`src/shared/api/serverAuth.ts`), which:

1. Uses the cached `access_token` cookie if present — **no refresh round trip**
2. Otherwise exchanges `refresh_token` for a token and flags it for caching
3. If upstream rejects a *cached* token, re-mints once and retries — so a stale cookie
   costs one extra round trip rather than a spurious logout

The cache cookie is httpOnly with a TTL of the token's 15 minutes minus 30s of skew.
Before it existed, every protected route minted a fresh token per request: loading
`/dictionary` cost 4 backend calls instead of 2, two of them just to make and discard
credentials.

### Logout

`logoutFx` calls `/api/auth/logout`, which clears `refresh_token`, `access_token`, and
`profile`. The Effector store resets to `null`.

### No middleware

There is deliberately **no `src/middleware.ts`**. It used to JOSE-verify the
`refresh_token` on `/api/dictionary/*`, `/api/history/*`, and `/api/review/*` before the
handler ran — but the handler then exchanged that same cookie anyway and 401'd on its
own, so the middleware's only unique contribution was rejecting a missing or malformed
cookie a few milliseconds earlier.

What it cost was a **duplicated signing secret across two repos**: the frontend needed
`JWT_SECRET` to be byte-identical to the backend's `SECRET_KEY`, in separate deploys with
separate env files. The backend validates its own (min 32 chars); the frontend did
`new TextEncoder().encode(process.env.JWT_SECRET)` with no guard, so an unset value
encoded the literal string `"undefined"` and every authenticated request 401'd with no
diagnostic. `JWT_SECRET` is no longer a frontend env var.

## Threat model

**What is protected:** Both `refresh_token` and the cached `access_token` are
`HttpOnly`, so script cannot read either. **The browser holds no token in JS at all** —
this is stronger than the previous design, where the access token sat in an Effector
store readable by any same-origin script. An XSS attacker with script execution can still
*call* authenticated BFF endpoints (the browser attaches the cookies automatically), but
cannot exfiltrate a credential to reuse elsewhere. `SameSite=Lax` blocks most cross-site
POST attacks.

**What is not protected:** A compromised `refresh_token` grants full account access until
it expires (7 days) — there is no server-side revocation list, and logout is cooperative
(cookies cleared via `Set-Cookie`). The cached `access_token` widens the window in which
a *stolen cookie jar* stays usable by up to 15 minutes beyond a refresh-token
revocation, if revocation is ever added. The `profile` cookie is intentionally **not**
httpOnly (the client writes it for signed-out visitors) and therefore must never carry
anything sensitive — it holds only display preferences.
