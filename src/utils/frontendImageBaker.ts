
export async function bakeImageOnFrontend(
    imageUrl: string,
    text: string,
    style: {
        x: number;
        y: number;
        fontSize: number;
        fontFamily: string;
        color: string;
        shadowIntensity?: number;
        opacity?: number;
        lineHeight?: number;
        containerWidth?: number;
    }
): Promise<Blob | null> {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("[FrontendBaker] Starting Native Canvas Bake for:", imageUrl);

            // 1. FETCH & CONVERT TO BASE64
            let base64Url = '';
            // Check if it's already data url
            if (imageUrl.startsWith('data:')) {
                base64Url = imageUrl;
            } else {
                // Add timestamp to prevent caching + 10s timeout
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}&t=${Date.now()}`;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                try {
                    const response = await fetch(proxyUrl, { signal: controller.signal });
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error(`Proxy failed: ${response.statusText}`);
                    const blob = await response.blob();
                    base64Url = await new Promise<string>((res) => {
                        const reader = new FileReader();
                        reader.onloadend = () => res(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                } catch (fetchErr: unknown) {
                    clearTimeout(timeoutId);
                    const errorMsg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
                    throw new Error(`Image Fetch Error: ${errorMsg}`);
                }
            }

            // 2. Load Image Object with 10s Timeout
            const img = new Image();
            img.crossOrigin = "anonymous"; // Try anonymous just in case
            img.src = base64Url;

            await new Promise((res, rej) => {
                const timer = setTimeout(() => rej(new Error("Image Load Timeout (10s)")), 10000);
                img.onload = () => { clearTimeout(timer); res(null); };
                img.onerror = () => { clearTimeout(timer); rej(new Error("Failed to load base64 image")); };
            });

            // 3. Create Memory Canvas
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Could not get 2D context");

            // Set dimensions to natural image size
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // 4. Draw Background
            ctx.drawImage(img, 0, 0);

            // 5. Configure Text - ROBUST FALLBACKS
            const safeStyle = style || {};

            const safeX = (safeStyle.x === undefined || isNaN(safeStyle.x)) ? 50 : safeStyle.x;
            const safeY = (safeStyle.y === undefined || isNaN(safeStyle.y)) ? 50 : safeStyle.y;
            const safeSize = (safeStyle.fontSize === undefined || isNaN(safeStyle.fontSize)) ? 80 : safeStyle.fontSize;
            const safeColor = safeStyle.color || '#ffffff';
            const safeOpacity = (safeStyle.opacity === undefined || isNaN(safeStyle.opacity)) ? 1 : safeStyle.opacity;
            const fontName = safeStyle.fontFamily || 'Inter';

            // Calculate real font size based on container width ratio (resolution independence)
            let finalFontSize = safeSize;
            if (safeStyle.containerWidth) {
                const scaleFactor = canvas.width / safeStyle.containerWidth;
                finalFontSize = Math.round(safeSize * scaleFactor);
            }

            // Wait for font if possible, but proceed if not
            try { await document.fonts.load(`${finalFontSize}px "${fontName}"`); } catch { }

            ctx.font = `900 ${finalFontSize}px "${fontName}", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // X/Y are percentages (0-100)
            const xPos = (safeX / 100) * canvas.width;
            const yPos = (safeY / 100) * canvas.height;

            // Optional: Shadow
            const shadowInt = safeStyle.shadowIntensity ?? 0.8;
            if (shadowInt > 0) {
                ctx.shadowColor = `rgba(0, 0, 0, ${shadowInt})`;
                ctx.shadowBlur = 20 * shadowInt;
                ctx.shadowOffsetY = 4;
            }

            ctx.fillStyle = safeColor;
            ctx.globalAlpha = safeOpacity;

            // 6. Draw Text (Handle formatting)
            const safeText = text || "TITULO DEMO";
            const lines = safeText.split('\n');

            // Use custom line height if provided, else default to 1.2
            const customLineHeight = (safeStyle.lineHeight !== undefined && !isNaN(safeStyle.lineHeight)) ? safeStyle.lineHeight : 1.2;
            const lineHeight = finalFontSize * customLineHeight;

            lines.forEach((line, i) => {
                const totalHeight = lines.length * lineHeight;
                const lineOffset = (i * lineHeight) - (totalHeight / 2) + (lineHeight / 2);
                ctx.fillText(line.toUpperCase(), xPos, yPos + lineOffset);
            });

            // 7. Export
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas conversion failed'));
            }, 'image/png', 1.0);

        } catch (err) {
            console.error("[FrontendBaker] Native Canvas Error:", err);
            reject(err);
        }
    });
}
