// HA OAuth2 Authorization Code flow helpers.
// The client_id must be a URL; HA uses it as the app identifier and requires
// that redirect_uri starts with client_id.
const CLIENT_ID = 'https://3dg1luk43.github.io/ha_mqtt_dash_profile_editor/';
const REDIRECT_URI = CLIENT_ID;

/**
 * Kick off the HA OAuth2 flow.
 * Stores state in sessionStorage so we can recover haUrl after the redirect.
 */
export function startOAuthFlow(haUrl) {
  const normalized = haUrl.replace(/\/$/, '');
  const state = btoa(JSON.stringify({
    haUrl: normalized,
    nonce: Math.random().toString(36).slice(2),
  }));
  sessionStorage.setItem('ha_oauth_state', state);
  const url = new URL(`${normalized}/auth/authorize`);
  url.searchParams.set('client_id', CLIENT_ID);
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('state', state);
  url.searchParams.set('response_type', 'code');
  window.location.href = url.toString();
}

/**
 * Handle the OAuth2 callback (?code=...&state=...).
 * Returns { haUrl, access_token, refresh_token, expires_in, ... }.
 */
export async function handleOAuthCallback(code, returnedState) {
  let haUrl;
  try {
    haUrl = JSON.parse(atob(returnedState)).haUrl;
  } catch {
    throw new Error('Invalid OAuth state — could not decode HA URL.');
  }
  const resp = await fetch(`${haUrl}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: CLIENT_ID,
    }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`Token exchange failed (${resp.status})${text ? ': ' + text : ''}`);
  }
  return { haUrl, ...(await resp.json()) };
}

/**
 * Refresh an expired access token.
 * Returns { access_token, expires_in, ... }.
 */
export async function refreshAccessToken(haUrl, refreshToken) {
  const resp = await fetch(`${haUrl}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });
  if (!resp.ok) throw new Error(`Token refresh failed (${resp.status})`);
  return resp.json();
}

/**
 * Send the profile to HA via the set_device_profile service.
 * Throws on non-2xx response.
 */
export async function sendProfile(haUrl, accessToken, deviceId, profile) {
  const resp = await fetch(`${haUrl}/api/services/ha_mqtt_dash/set_device_profile`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ device_id: deviceId, profile }),
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw new Error(`HA returned ${resp.status}${text ? ': ' + text : ''}`);
  }
}
