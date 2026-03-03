# bfc-v2 (Beautiful Flowise Chat v2)

A lightweight, static-site-friendly Flowise chat widget that supports:

- A simple copy-paste embed snippet (single `dist/chat.js` file).
- Browser-gating with Cloudflare Turnstile (issues a short-lived token via your proxy).
- Persistent Flowise memory across messages via `chatId` + `overrideConfig.sessionId`.
- A "New conversation" (trash) button that clears session + history on the page.

This repo is designed to be used with a proxy that exposes:

- `POST /auth/chat-token` (Turnstile verification + token issuance)
- `POST /api/v1/prediction/:instance/:bot` (Flowise prediction via proxy)

If you are using a different backend, the widget can still work, but the captcha/token features assume the proxy endpoints above.

---

## Quick Start (Recommended Setup)

1. Host/deploy your proxy (the `apiHost` below points to it).
2. Configure Turnstile on your proxy and allow your site origin/hostname.
3. Add this to any static site page:

```html
<!-- 1) Load the widget bundle -->
<!-- PRODUCTION TIP: Pin to a commit SHA (not @main) to avoid supply chain/cache surprises. -->
<!-- Example: https://cdn.jsdelivr.net/gh/evaa-traa/bfc-v2@<COMMIT_SHA>/dist/chat.js -->
<script src="https://cdn.jsdelivr.net/gh/evaa-traa/bfc-v2@main/dist/chat.js"></script>

<!-- 2) Initialize -->
<script>
  BeautifulFlowiseChat.init({
    // REQUIRED
    chatflowid: "3/iessagarai-293439",  // "<instance>/<botName>" (proxy format)
    apiHost: "https://YOUR-PROXY-BASE-URL",

    // OPTIONAL UI
    theme: "cloudflare",
    title: "English Coach",
    subtitle: "Online",
    avatar: "AI",
    welcomeMessage: "Hi! Start chatting after verification.",
    placeholder: "Type your message...",
    sendButtonText: ">",
    showTimestamp: true,

    // OPTIONAL behavior
    requestTimeout: 30000,
    debug: false,

    // OPTIONAL Flowise override config (merged with sessionId)
    overrideConfig: {
      // example: "temperature": 0.2
    },

    // OPTIONAL captcha -> proxy token flow
    captcha: {
      provider: "turnstile",
      siteKey: "0x4AAAAAA...",
      tokenEndpoint: "/auth/chat-token" // relative to apiHost, or absolute URL
    }
  });
</script>
```

After you deploy changes to `dist/chat.js`, purge jsDelivr:

`https://purge.jsdelivr.net/gh/evaa-traa/bfc-v2@main/dist/chat.js`

---

## One Copy-Paste Config (Template)

Replace the `ALL_CAPS` values and paste into any site:

```html
<script src="https://cdn.jsdelivr.net/gh/evaa-traa/bfc-v2@main/dist/chat.js"></script>
<script>
  BeautifulFlowiseChat.init({
    chatflowid: "INSTANCE/BOT_NAME",
    apiHost: "https://YOUR_PROXY_HOST",

    theme: "cloudflare",
    title: "AI Assistant",
    subtitle: "Online",
    avatar: "AI",
    welcomeMessage: "Hi! How can I help you today?",
    placeholder: "Type your message...",
    sendButtonText: ">",
    showTimestamp: true,

    requestTimeout: 30000,
    debug: false,

    // Optional: extra Flowise override values (sessionId is injected automatically)
    overrideConfig: {},

    // Optional: enable Turnstile gating via proxy token issuance
    captcha: {
      provider: "turnstile",
      siteKey: "YOUR_TURNSTILE_SITE_KEY",
      tokenEndpoint: "/auth/chat-token"
    }
  });
</script>
```

Production note: replace `@main` with a commit SHA after you confirm a release works. Example:

`https://cdn.jsdelivr.net/gh/evaa-traa/bfc-v2@0123abcd4567ef89/dist/chat.js`

---

## API Host and `chatflowid`

### `apiHost`

Base URL of your proxy (recommended), for example:

- `https://ruvatron-proxy-v3.hf.space`

The widget calls:

- `POST ${apiHost}/api/v1/prediction/${chatflowid}`
- `POST ${apiHost}/auth/chat-token` (when captcha is enabled)

### `chatflowid`

In this project, `chatflowid` is in **proxy format**:

`"<instance>/<botName>"`

Example:

- `"3/iessagarai-293439"`

Your proxy maps that to the real Flowise chatflow id internally.

---

## Sessions and Memory (Important)

Flowise "memory" across messages is achieved by sending a stable session key and reusing the Flowise chat id:

- The widget stores a `sessionId` in `localStorage` under:
  - `bfc_session_<chatflowid>`
- Each prediction request includes:
  - `overrideConfig.sessionId` (always)
  - `chatId` (if the Flowise response ever returns it)

### What the widget does automatically

- On first load: generates `sessionId`, saves to `localStorage`.
- On each response: if `data.chatId` exists, stores it and reuses for future messages.
- On "New conversation" (trash button): clears stored `chatId`, generates a new `sessionId`, clears UI history.

If you previously saw "no memory", it was because the requests had no stable `chatId/sessionId`.

---

## Configuration Reference

### Required

- `chatflowid` (string): proxy chat target in the format `"<instance>/<botName>"`
- `apiHost` (string): your proxy base URL

### UI Options

- `theme` (string): adds a class `bf-theme-${theme}` to the widget container.
  - Built-in themes in CSS include: `cloudflare`, `intercom`, `gradient`, `glassmorphism`, `dark`, `minimal`.
- `primaryColor` (string): sets `--bf-primary-color` (CSS variable) on the widget root.
- `position` (string): `bottom-right` (default) or `bottom-left`
- `title` (string)
- `subtitle` (string)
- `welcomeMessage` (string): shown at the top when chat opens and when conversation is reset
- `placeholder` (string)
- `sendButtonText` (string)
- `showTimestamp` (boolean)
- `enableMarkdown` (boolean): enables basic markdown formatting for bot messages (default `true`)
- `avatar` (string): used in the header avatar bubble only (bot message avatars are removed)

Notes:

- `width`/`height` exist in defaults but are currently not used by code; sizing is controlled by CSS.
- `enableStreaming` and `enableSoundNotification` exist in defaults but are currently not implemented.

### Behavior Options

- `debug` (boolean): logs internal details in console (sessionId/chatId, request flow)
- `requestTimeout` (number, ms): timeout for fetch calls (default `30000`)
- `overrideConfig` (object): extra Flowise override config values to send with each request
  - `overrideConfig.sessionId` is always injected/overwritten by the widget for consistency

### Captcha Options (`captcha`)

Captcha is optional. If provided, the widget:

1. Shows a Turnstile overlay on first open.
2. Sends the Turnstile token to `tokenEndpoint`.
3. Receives `{ token }` and uses it as `Authorization: Bearer <token>` for prediction calls.

Supported fields:

- `captcha.provider` (string): must be `"turnstile"` (default if omitted)
- `captcha.siteKey` (string): your Turnstile site key
- `captcha.tokenEndpoint` (string):
  - Relative: `"/auth/chat-token"` (resolved against `apiHost`)
  - Absolute: `"https://proxy.example.com/auth/chat-token"`
- `captcha.siteId` (string, optional): forwarded to token endpoint (for proxy-level binding/authorization)
- `captcha.authHeaderName` (string, optional): header to send the issued token in (default `"Authorization"`)
- `captcha.autoStart` (boolean, optional): default `true`. If `false`, you must trigger auth by opening chat and sending first message (overlay still appears).
- `captcha.theme` (string, optional): Turnstile widget theme, default `"auto"`
- `captcha.size` (string, optional): Turnstile size, default `"normal"`

---

## Footer Link

The footer displays a clickable text link:

- Text: `Powered by RPS`
- URL: `mailto:mail.rps.active@proton.me`

You can customize this in `src/chat.js` and rebuild `dist/chat.js`.

---

## Build

This repo outputs a single bundle file:

- `dist/chat.js` = `src/styles.css` + `src/chat.js`

Build:

```bash
cmd /c "npm run build"
```

If your PowerShell blocks `npm.ps1`, always run `npm` via `cmd /c` as above.

---

## Troubleshooting

### I changed code but don’t see updates

- jsDelivr caches aggressively: purge and hard-refresh.
- Confirm browser is loading the expected script URL in DevTools:
  - Network tab: `dist/chat.js`
- Service workers can cache scripts:
  - DevTools > Application > Service Workers: unregister

### Turnstile verifies, then fails or loops

That usually means the proxy rejected `/auth/chat-token` (common cause: hostname not allowed).

- Ensure your proxy allows the site origin in CORS.
- Ensure Turnstile hostname checks match your deployed site hostname.

### Memory still doesn’t persist

- Open console with `debug: true` and verify `sessionId` stays stable.
- Ensure your Flowise instance returns a `chatId` field (if supported by your Flowise version).
