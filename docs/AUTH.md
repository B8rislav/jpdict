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
  └─► loginFx.doneData updates $auth: { accessToken, user: { email } }
        $isAuthenticated becomes true
```

### Token refresh on page load

`src/app/page.tsx:46` calls `refreshFx()` inside `useEffect([], [])` on every mount:

```
refreshFx
  POST /api/auth/refresh
  │
  ▼
BFF: src/app/api/auth/refresh/route.ts
  Reads refresh_token cookie from incoming request
  Forwards it to  BACKEND_URL/api/auth/refresh
  Returns         { access_token: "…" }
  │
  ▼
refreshFx.doneData → $auth.accessToken updated
```

If the cookie is absent or expired, `refreshFx` rejects silently — `$isAuthenticated`
stays false and the user sees the login button.

### Logout

`logoutFx` calls `/api/auth/logout`, which instructs the browser to clear the
`refresh_token` cookie (via `Set-Cookie: refresh_token=; Max-Age=0`). The Effector store
is reset to `{ accessToken: null, user: null }`.

### Middleware guard

`src/middleware.ts` runs on every request matching `/api/dictionary/*` or
`/api/history/*`. It:

1. Reads `refresh_token` from cookies
2. Calls `jwtVerify(token, secret, { algorithms: ['HS256'] })` (JOSE library)
3. Returns 401 if the token is missing, expired, or invalid
4. Passes the request through if verification succeeds

The secret is `process.env.JWT_SECRET` — must match the FastAPI backend secret.

## Threat model

**What is protected:** The `refresh_token` cookie is `HttpOnly`, so XSS cannot read it
directly. The access token is held in JS memory (`$accessToken` Effector store) and is
never written to `localStorage`, `sessionStorage`, or a non-httpOnly cookie. An XSS
attacker who gains script execution can call BFF endpoints that require auth (because
the browser will send the httpOnly cookie automatically), but cannot exfiltrate the
refresh token itself and cannot forge requests to new origins (SameSite=Lax blocks most
cross-site POST attacks).

**What is not protected:** The access token lives in JS memory, so it is readable by any
script running in the same origin. Token lifetime is the primary mitigation — keep it
short (FastAPI default). The middleware only verifies the refresh token, not the access
token; downstream BFF handlers derive a fresh access token on every protected call,
which means a compromised refresh token grants full account access until it expires.
Logout is cooperative (cookie cleared client-side) — there is no server-side token
revocation list today.
