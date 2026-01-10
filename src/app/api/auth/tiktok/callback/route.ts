
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { encryptToken } from '@/lib/security/encryption';

const CLIENT_KEY = process.env.NEXT_PUBLIC_TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // using state to pass projectId
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.json({ error: error }, { status: 400 });
    }

    if (!code || !state) {
        return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    const projectId = state;

    if (!CLIENT_KEY || !CLIENT_SECRET) {
        console.error('Missing TikTok App credentials');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const redirectUri = `${req.nextUrl.origin}/api/auth/tiktok/callback`;

        const codeVerifier = req.cookies.get('tiktok_code_verifier')?.value;
        if (!codeVerifier) {
            return NextResponse.json({ error: 'Missing code_verifier cookie' }, { status: 400 });
        }

        // 1. Exchange code for access token
        const tokenParams = new URLSearchParams({
            client_key: CLIENT_KEY,
            client_secret: CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        });

        const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
            },
            body: tokenParams,
        });

        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
        }

        const { access_token, refresh_token, open_id, expires_in, refresh_expires_in } = tokenData;

        // Calculate expiry
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // 2. Fetch User Info
        // We need fields: display_name, avatar_url
        // Scope required: user.info.basic
        const userInfoRes = await fetch(`https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,union_id,open_id`, {
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        const userInfoData = await userInfoRes.json();

        if (userInfoData.error && userInfoData.error.code !== 'ok') {
            // If fetching user info fails, we might still want to store the connection but warn
            console.warn('Failed to fetch TikTok user info:', userInfoData.error);
        }

        const userProfile = userInfoData.data?.user || {};
        const displayName = userProfile.display_name || 'TikTok User';
        const avatarUrl = userProfile.avatar_url;

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Encrypt tokens
        // We might want to store refresh token too. For now let's store access_token in the main field 
        // and put refresh_token in metadata or a separate column if we had one. 
        // The current schema has `encrypted_token`, let's store the access_token there.
        // We can store refresh_token in metadata for n8n to handle refreshing if needed, 
        // OR ideally we should enhance the schema to support refresh tokens.
        // For this MVP, we will store access_token.

        const encryptedToken = encryptToken(access_token, projectId);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: upsertError } = await (supabase
            .from('social_connections') as any)
            .upsert({
                project_id: projectId,
                user_id: user.id,
                platform: 'tiktok',
                platform_id: open_id, // TikTok uses open_id as unique identifier for the app
                account_name: displayName,
                encrypted_token: encryptedToken,
                token_expiry: expiresAt.toISOString(),
                status: 'active',
                metadata: {
                    open_id: open_id,
                    union_id: userProfile.union_id, // Useful if they have multiple apps
                    avatar_url: avatarUrl,
                    refresh_token: refresh_token, // Ideally encrypted too, but putting in metadata for now as per current schema limits. WARNING: In prod, encrypt this.
                    refresh_expires_in: refresh_expires_in
                },
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'project_id,platform,platform_id'
            })
            .select()
            .single();

        if (upsertError) {
            console.error('Error saving TikTok connection:', upsertError);
            throw new Error('Database error saving connection');
        }

        // Redirect back to connections page with success and clear cookie
        const response = NextResponse.redirect(`${req.nextUrl.origin}/projects/${projectId}/connections?success=tiktok_connected`);
        response.cookies.delete('tiktok_code_verifier');
        return response;

    } catch (error: unknown) {
        console.error('TikTok OAuth Callback Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.redirect(`${req.nextUrl.origin}/projects/${projectId}/connections?error=${encodeURIComponent(errorMessage)}`);
    }
}
