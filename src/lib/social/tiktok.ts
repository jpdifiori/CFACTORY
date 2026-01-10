
const CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

export interface TikTokTokenResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    refresh_expires_in: number;
    open_id: string;
    error?: string;
    error_description?: string;
}

export async function refreshTikTokToken(refreshToken: string): Promise<TikTokTokenResponse> {
    if (!CLIENT_KEY || !CLIENT_SECRET) {
        throw new Error('Missing TikTok App credentials');
    }

    const tokenParams = new URLSearchParams({
        client_key: CLIENT_KEY,
        client_secret: CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
    });

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
        },
        body: tokenParams,
    });

    const data = await response.json();

    if (data.error) {
        console.error('TikTok token refresh error:', data);
        return {
            ...data,
            error: data.error,
            error_description: data.error_description
        };
    }

    return data;
}
