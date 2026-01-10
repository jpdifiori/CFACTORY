import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { html, title, filename } = await req.json();

        if (!html) {
            return NextResponse.json({ error: 'HTML content is required' }, { status: 400 });
        }

        // 1. Launch Puppeteer
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // 2. Load the HTML content
        // We use waitUtil: 'networkidle0' to ensure all images (from Supabase) are loaded
        await page.setContent(html, { waitUntil: 'networkidle0' });

        // 3. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '60px',
                bottom: '60px',
                left: '40px',
                right: '40px'
            },
            displayHeaderFooter: true,
            headerTemplate: `
                <div style="font-size: 10px; font-family: sans-serif; width: 100%; border-bottom: 1px solid #eee; padding-bottom: 2mm; margin: 0 10mm; display: flex; justify-content: space-between;">
                    <span style="font-weight: bold; color: #666;">MASSGENIX PREMIUM FORGE</span>
                    <span style="color: #999;">${title || 'Document'}</span>
                </div>
            `,
            footerTemplate: `
                <div style="font-size: 10px; font-family: sans-serif; width: 100%; border-top: 1px solid #eee; padding-top: 2mm; margin: 0 10mm; display: flex; justify-content: space-between;">
                    <span style="color: #999;">© ${new Date().getFullYear()} MassGenix AI</span>
                    <span style="color: #666;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
                </div>
            `
        });

        await browser.close();

        // 4. Upload to Supabase Storage
        const uploadPath = `premium-forge-docs/${user.id}/${filename || `doc-${Date.now()}`}.pdf`;

        const { error: uploadError } = await supabase.storage
            .from('project-images') // Reusing the main bucket or specialized one if created
            .upload(uploadPath, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: true
            });

        if (uploadError) throw uploadError;

        // 5. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('project-images')
            .getPublicUrl(uploadPath);

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error: unknown) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({
            error: 'Failed to generate PDF',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
