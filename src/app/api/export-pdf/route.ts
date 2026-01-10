import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import puppeteer from 'puppeteer';

interface ContentBlock {
    index: number;
    type: string;
    html_override?: string;
    image_url?: string;
    content_json: {
        mainTitle?: string;
        description?: string;
        contentHtml?: string;
        quote?: string;
        author?: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        const { projectId } = await req.json();
        const supabase = await createClient();

        // 1. Fetch Project & Blocks
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: project, error: projectError } = await (supabase
            .from('premium_content_projects')
            .select(`*, content_blocks(*)`)
            .eq('id', projectId)
            .single() as any);

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const blocks = (project.content_blocks || []).sort((a: ContentBlock, b: ContentBlock) => a.index - b.index);

        // 2. Build HTML Template
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <script src="https://cdn.tailwindcss.com"></script>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Playfair+Display:ital,wght@0,400;0,900;1,400&display=swap" rel="stylesheet">
                <style>
                    body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
                    .page-break { page-break-after: always; }
                    @page { size: A4; margin: 0; }
                    .full-bleed { width: 100%; height: 100vh; position: relative; }
                </style>
            </head>
            <body class="bg-white">
                <div id="content">
                    ${blocks.map((block: ContentBlock) => {
            const content = block.content_json;
            // Simplified manual implementation of BlockRenderer for SSR PDF
            if (block.html_override) return `<div>${block.html_override}</div>`;

            switch (block.type) {
                case 'Hero':
                    return `
                                    <div class="relative h-screen flex flex-col justify-center px-12 bg-black text-white page-break">
                                        ${block.image_url ? `<img src="${block.image_url}" class="absolute inset-0 w-full h-full object-cover opacity-50">` : ''}
                                        <div class="relative z-10 max-w-3xl">
                                            <h1 class="text-7xl font-black mb-6 uppercase tracking-tighter">${content.mainTitle}</h1>
                                            <p class="text-2xl text-gray-300">${content.description}</p>
                                        </div>
                                    </div>
                                `;
                case 'DeepText':
                    return `<div class="p-12 prose prose-xl max-w-none editorial-body">${content.contentHtml}</div>`;
                case 'Quote':
                    return `
                                    <div class="px-12 py-20 bg-gray-50 border-y border-gray-100 text-center">
                                        <blockquote class="text-4xl font-serif italic text-gray-800 mb-6">"${content.quote}"</blockquote>
                                        <div class="font-black uppercase tracking-widest text-lg">${content.author}</div>
                                    </div>
                                `;
                default:
                    return `<div class="p-12">Block: ${block.type}</div>`;
            }
        }).join('')}
                </div>
            </body>
            </html>
        `;

        // 3. Generate PDF with Puppeteer
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: false,
            margin: { top: 0, right: 0, bottom: 0, left: 0 }
        });

        await browser.close();

        // 4. Return PDF
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="MassGenix_${project.title.replace(/\s+/g, '_')}.pdf"`
            }
        });

    } catch (error: unknown) {
        console.error('PDF Export failed:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
