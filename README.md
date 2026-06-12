# tipping.aasan.dev

https://tipping.aasan.dev

## Local development

Run the frontend and backend together:

```sh
npm run dev
```

The Vite app uses `VITE_GRAPHQL_SERVER_URI=/graphql` from
`packages/frontend/.env.development` and proxies that path to the local backend
at `http://localhost:4000` by default. Override the proxy target with
`VITE_GRAPHQL_PROXY_TARGET` if needed.

In development, the backend reads the real Google Sheet through the `gws` CLI
when Google API/service-account/OAuth credentials are not configured. If `gws`
is unavailable or not authenticated, it falls back to a small development
fixture through the same GraphQL schema and scoring pipeline.

- Set `GOOGLE_SHEETS_DEV_SOURCE=fixture` to always use the fixture.
- Set `GOOGLE_SHEETS_DEV_FALLBACK=false` to fail instead of using the fixture.

## 2026 data source

The backend defaults to the 2026 response sheet:

- Spreadsheet: `1hsMSMhqu4UTrPlToYrfxjFrIXmT2JaiVzzjXeUvbgpw`
- Range: `'Form Responses 1'!A1:CS125`

Override these with `GOOGLE_SHEETS_ID` and `GOOGLE_SHEETS_RANGE` if the sheet
layout changes.

### AWS access to the sheet

For a private Google Sheet in AWS, configure the Lambda with Google credentials.
Preferred: use a Google service account that has viewer access to the response
sheet:

- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`

The private key may contain escaped newlines (`\n`).

Alternative: use OAuth refresh credentials from a valid Google OAuth client:

- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_OAUTH_REFRESH_TOKEN`

If neither authenticated path is set, the backend falls back to
`GOOGLE_API_KEY`, which only works when the sheet is readable by that API key.

### Fasit row

The app no longer assumes the last row is the fasit row. To enter results in the
sheet, add one row anywhere in the response range with `fasit` or `blueprint` in
one of the first three cells. The remaining cells in that row are matched to the
same question columns as the user responses.
