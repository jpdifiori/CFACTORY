import { NextRequest, NextResponse } from 'next/server';
import { decryptToken } from '@/lib/security/encryption';

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
        const { encrypted_token, project_id } = body;

        if (!encrypted_token || !project_id) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const decrypted = decryptToken(encrypted_token, project_id);

        return NextResponse.json({ access_token: decrypted });

    } catch (error: any) {
        console.error('Decryption API Error:', error);
        return NextResponse.json({ error: 'Decryption failed' }, { status: 500 });
    }
}
