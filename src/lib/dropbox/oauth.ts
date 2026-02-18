const DROPBOX_APP_KEY = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY!;
const DROPBOX_APP_SECRET = process.env.DROPBOX_APP_SECRET!;

function getRedirectUri() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${appUrl}/api/auth/dropbox/callback`;
}

/**
 * Build Dropbox OAuth authorization URL.
 * token_access_type=offline gives us a refresh_token that never expires.
 */
export function getDropboxAuthUrl(state?: string): string {
  const params = new URLSearchParams({
    client_id: DROPBOX_APP_KEY,
    response_type: "code",
    redirect_uri: getRedirectUri(),
    token_access_type: "offline",
  });
  if (state) params.set("state", state);
  return `https://www.dropbox.com/oauth2/authorize?${params.toString()}`;
}

interface DropboxTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  uid: string;
  account_id: string;
}

/**
 * Exchange authorization code for access_token + refresh_token.
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<DropboxTokenResponse> {
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
      redirect_uri: getRedirectUri(),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dropbox token exchange failed: ${err}`);
  }

  return res.json();
}

/**
 * Use refresh_token to get a fresh short-lived access_token.
 * This is the key function — the refresh_token never expires,
 * so we can always get a new access_token on demand.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const res = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: "refresh_token",
      client_id: DROPBOX_APP_KEY,
      client_secret: DROPBOX_APP_SECRET,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dropbox token refresh failed: ${err}`);
  }

  const data = await res.json();
  return { access_token: data.access_token, expires_in: data.expires_in };
}
