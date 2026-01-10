
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { encryptToken } from '@/lib/security/encryption';
import { SafeInsertBuilder } from '@/utils/supabaseSafe';

const FB_APP_ID = process.env.NEXT_PUBLIC_FB_APP_ID;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

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

    // state contains projectId. In a real app we might verify a CSRF token here too.
    const projectId = state;

    if (!FB_APP_ID || !FB_APP_SECRET) {
        console.error('Missing FB App credentials');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        // 1. Exchange code for short-lived token
        const tokenParams = new URLSearchParams({
            client_id: FB_APP_ID,
            client_secret: FB_APP_SECRET,
            redirect_uri: `${req.nextUrl.origin}/api/auth/facebook/callback`,
            code: code,
        });

        const tokenRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${tokenParams.toString()}`);
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            throw new Error(`Token exchange failed: ${tokenData.error.message}`);
        }

        const shortLivedToken = tokenData.access_token;

        // 2. Exchange for long-lived token
        const longLivedParams = new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: FB_APP_ID,
            client_secret: FB_APP_SECRET,
            fb_exchange_token: shortLivedToken,
        });

        const longLivedRes = await fetch(`https://graph.facebook.com/v19.0/oauth/access_token?${longLivedParams.toString()}`);
        const longLivedData = await longLivedRes.json();

        if (longLivedData.error) {
            throw new Error(`Long-lived token exchange failed: ${longLivedData.error.message}`);
        }

        const longLivedToken = longLivedData.access_token;
        // Expires in defaults to 60 days usually, but we can calculate it
        const expiresIn = longLivedData.expires_in ? parseInt(longLivedData.expires_in) : 60 * 24 * 60 * 60; // default 60 days
        const expiresAt = new Date(Date.now() + expiresIn * 1000);

        // 3. Get Pages and Instagram Business Accounts
        const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?access_token=${longLivedToken}&fields=id,name,instagram_business_account{id,username,profile_picture_url}`);
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
            throw new Error(`Failed to fetch pages: ${pagesData.error.message}`);
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Process found Instagram accounts
        const connections = [];
        for (const page of pagesData.data) {
            if (page.instagram_business_account) {
                const encryptedToken = encryptToken(longLivedToken, projectId);

                // Using SafeInsertBuilder specifically typing the table wrapper
                const { data: connection, error: upsertError } = await (supabase
                    .from('social_connections') as unknown as SafeInsertBuilder<'social_connections'>)
                    .upsert({
                        project_id: projectId,
                        user_id: user.id,
                        platform: 'instagram',
                        platform_id: page.instagram_business_account.id,
                        account_name: page.instagram_business_account.username || page.name,
                        encrypted_token: encryptedToken,
                        token_expiry: expiresAt.toISOString(),
                        status: 'active',
                        metadata: {
                            page_id: page.id,
                            page_name: page.name,
                            ig_username: page.instagram_business_account.username,
                            profile_picture: page.instagram_business_account.profile_picture_url
                        },
                        updated_at: new Date().toISOString()
                    }, {
                        onConflict: 'project_id,platform,platform_id'
                    })
                    .select()
                    .single();

                if (upsertError) {
                    console.error('Error saving connection:', upsertError);
                } else {
                    connections.push(connection);
                }
            }
        }

        if (connections.length === 0) {
            return NextResponse.redirect(`${req.nextUrl.origin}/projects/${projectId}/connections?error=no_instagram_account_found`);
        }

        // Redirect back to connections page with success
        return NextResponse.redirect(`${req.nextUrl.origin}/projects/${projectId}/connections?success=instagram_connected`);

    } catch (error: unknown) {
        console.error('OAuth Callback Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.redirect(`${req.nextUrl.origin}/projects/${projectId}/connections?error=${encodeURIComponent(errorMessage)}`);
    }
}
