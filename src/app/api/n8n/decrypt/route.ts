import { NextRequest, NextResponse } from 'next/server';
import { decryptToken, encryptToken } from '@/lib/security/encryption';
import { createClient } from '@/utils/supabase/server';
import { refreshTikTokToken } from '@/lib/social/tiktok';

// Security: Use a shared secret to prevent unauthorized access to this endpoint
const N8N_API_KEY = process.env.N8N_API_KEY;

export async function POST(req: NextRequest) {
    if (!N8N_API_KEY) {
        return NextResponse.json({ error: 'Server misconfiguration: N8N_API_KEY not set' }, { status: 500 });
    }

    const authHeader = req.headers.get('x-api-key');

    if (authHeader !== N8N_API_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { encrypted_token, project_id, social_platform } = body;

        if (!encrypted_token || !project_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const platform = social_platform?.toLowerCase();
        let decrypted = decryptToken(encrypted_token, project_id);
        let finalEncryptedToken = encrypted_token;

        // TikTok Specific: Auto-refresh if expired
        if (platform === 'tiktok') {
            const supabase = await createClient();

            // Fetch connection to check expiry and get refresh token
            let { data: connection } = await (supabase
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .from('social_connections') as any)
                .select('*')
                .eq('project_id', project_id)
                .eq('platform', 'tiktok')
                .eq('encrypted_token', encrypted_token)
                .single();

            // Fallback: If not found by encrypted_token, maybe it was recently refreshed and n8n has old data?
            if (!connection) {
                const { data: fallbackConn } = await (supabase
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    .from('social_connections') as any)
                    .select('*')
                    .eq('project_id', project_id)
                    .eq('platform', 'tiktok')
                    .limit(1)
                    .single();

                if (fallbackConn) {
                    console.log('Using fallback TikTok connection (token mismatch)');
                    connection = fallbackConn;
                    decrypted = decryptToken(connection.encrypted_token, project_id);
                    finalEncryptedToken = connection.encrypted_token;
                }
            }

            if (connection) {
                const expiryDate = new Date(connection.token_expiry);
                const now = new Date();

                // If expired or expires in less than 10 minutes
                if (expiryDate.getTime() - now.getTime() < 10 * 60 * 1000) {
                    console.log('TikTok token expired or near expiry, refreshing...');
                    const refreshToken = connection.metadata?.refresh_token;

                    if (refreshToken) {
                        const refreshData = await refreshTikTokToken(refreshToken);

                        if (!refreshData.error) {
                            decrypted = refreshData.access_token;
                            finalEncryptedToken = encryptToken(decrypted, project_id);

                            const newExpiry = new Date(Date.now() + refreshData.expires_in * 1000);

                            // Update database with new token
                            await (supabase
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                .from('social_connections') as any)
                                .update({
                                    encrypted_token: finalEncryptedToken,
                                    token_expiry: newExpiry.toISOString(),
                                    metadata: {
                                        ...connection.metadata,
                                        refresh_token: refreshData.refresh_token,
                                        refresh_expires_in: refreshData.refresh_expires_in
                                    },
                                    updated_at: new Date().toISOString()
                                })
                                .eq('id', connection.id);

                            console.log('TikTok token refreshed successfully');
                        } else {
                            console.error('Failed to refresh TikTok token:', refreshData.error);
                        }
                    }
                }
            }
        }

        // Normalize social_platform to lowercase to satisfy n8n's Switch node requirements
        const responseBody = {
            ...body,
            decrypted_token: decrypted,
            encrypted_token: finalEncryptedToken // Return the updated one if it was refreshed
        };

        if (responseBody.social_platform) {
            responseBody.social_platform = responseBody.social_platform.toLowerCase();
        }

        return NextResponse.json(responseBody);

    } catch (error: unknown) {
        console.error('Decryption API Error:', error);
        return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
    }
}
