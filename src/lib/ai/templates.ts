export interface Theme {
    id: string
    name: string
    wrapperClass: string
    headingClass: string
    subheadingClass: string
    tertiaryHeadingClass?: string
    paragraphClass: string
    blockquoteClass: string
    blockquoteAuthorClass?: string
    listClass?: string
    listItemClass?: string
    boldClass?: string
    italicClass?: string
    // New Advanced Layout Markers
    noteBoxClass?: string
    testimonialBoxClass?: string
    testimonialAuthorClass?: string
    highlightPhraseClass?: string
    // Typeset Automation
    heroBoxClass?: string
    heroTitleClass?: string
    gridBoxClass?: string
    gridItemClass?: string
    entranceAnimationClass?: string
    // Preview Metadata
    previewColors?: string[]
    previewFont?: string
    isNew?: boolean
}

export interface ThemeOverrides {
    // Typography
    fontSize?: number;
    lineHeight?: number;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string; // Support for Google Fonts strings
    headingFontFamily?: string;
    letterSpacing?: number;
    fontWeight?: number | string;
    textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
    textAlign?: 'left' | 'center' | 'right' | 'justify';

    // Layout
    paragraphSpacing?: number;
    pagePadding?: number; // Global padding
    marginSides?: number; // Side margins for column effect
    columnCount?: 1 | 2;
    viewport?: 'A4' | 'US_Letter' | 'Smartphone' | 'Desktop' | 'Full';

    // Effects
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    shadowDepth?: 'none' | 'soft' | 'medium' | 'hard' | 'inner';
    gradient?: string; // Linear/Radial CSS string
    bgImageUrl?: string;
    layoutMode?: 'Block' | 'Flow';
    imageSpacing?: number; // Distance between images and text
}

export const THEMES: Record<string, Theme> = {
    premium_blog: {
        id: 'premium_blog',
        name: 'Premium Blog',
        wrapperClass: 'bg-white text-slate-900 font-sans p-8 md:p-16 max-w-5xl mx-auto shadow-2xl rounded-[3rem] my-10 border border-slate-100',
        headingClass: 'text-6xl font-black text-slate-900 mb-10 tracking-tight leading-[1.1]',
        subheadingClass: 'text-3xl font-bold text-blue-600 mt-16 mb-6',
        tertiaryHeadingClass: 'text-xl font-black text-slate-800 mt-10 mb-4 uppercase tracking-wider',
        paragraphClass: 'text-xl text-slate-600 mb-8 leading-relaxed font-medium',
        blockquoteClass: 'border-l-8 border-blue-500 bg-blue-50/30 p-10 my-12 rounded-2xl italic text-2xl text-blue-900 font-serif',
        blockquoteAuthorClass: 'block mt-4 text-lg font-bold text-blue-600 non-italic',
        listClass: 'space-y-4 my-8 ml-6',
        listItemClass: 'text-lg text-slate-600 flex items-start gap-3 before:content-["→"] before:text-blue-500 before:font-bold',
        boldClass: 'font-black text-slate-900',
        italicClass: 'italic text-slate-500',
        noteBoxClass: 'bg-amber-50 border-l-4 border-amber-400 p-8 my-10 rounded-r-2xl text-amber-900 font-medium shadow-sm',
        testimonialBoxClass: 'bg-slate-50 border border-slate-200 p-10 my-12 rounded-[2rem] text-slate-700 italic text-xl text-center',
        testimonialAuthorClass: 'block mt-6 text-sm font-black uppercase tracking-widest text-slate-400',
        highlightPhraseClass: 'px-2 py-0.5 bg-blue-100/50 text-blue-700 font-bold rounded-md',
        heroBoxClass: 'editorial-hero bg-gradient-to-b from-blue-50 to-white rounded-[4rem] mb-20',
        heroTitleClass: 'text-7xl font-black text-slate-900',
        gridBoxClass: 'editorial-grid',
        gridItemClass: 'editorial-grid-item bg-white border-slate-100 hover:shadow-xl',
        previewColors: ['#ffffff', '#3b82f6', '#0f172a'],
        previewFont: 'Sans',
        entranceAnimationClass: 'reveal-on-scroll'
    },
    modern_dark: {
        id: 'modern_dark',
        name: 'Modern Dark',
        wrapperClass: 'bg-[#0a0a0b] text-[#d1d5db] font-sans p-8 md:p-20 max-w-6xl mx-auto border border-white/5 rounded-[4rem] my-12 shadow-[0_0_100px_rgba(37,99,235,0.1)]',
        headingClass: 'text-7xl font-black text-white mb-12 tracking-tighter leading-none bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent',
        subheadingClass: 'text-3xl font-black text-blue-400 mt-20 mb-8 uppercase tracking-widest',
        tertiaryHeadingClass: 'text-xl font-bold text-white/90 mt-12 mb-4 border-b border-white/10 pb-2 inline-block',
        paragraphClass: 'text-lg text-gray-400 mb-10 leading-8 font-light tracking-wide',
        blockquoteClass: 'relative p-12 my-16 bg-white/[0.02] border font-serif border-white/10 rounded-3xl italic text-3xl text-blue-200 text-center before:content-["“"] before:absolute before:-top-5 before:left-10 before:text-8xl before:text-blue-500/20',
        blockquoteAuthorClass: 'block mt-8 text-sm font-black uppercase tracking-[0.3em] text-blue-500',
        listClass: 'space-y-6 my-10',
        listItemClass: 'text-gray-300 flex items-center gap-4 before:w-2 before:h-2 before:bg-blue-600 before:rounded-full before:shadow-[0_0_10px_rgba(37,99,235,0.8)]',
        boldClass: 'text-white font-black',
        italicClass: 'italic text-gray-500',
        noteBoxClass: 'bg-blue-600/10 border-r-2 border-blue-600 p-10 my-12 rounded-l-3xl text-blue-100 font-medium',
        testimonialBoxClass: 'bg-zinc-900/50 border border-white/5 p-12 my-16 rounded-[3rem] text-gray-300 italic text-2xl text-center',
        testimonialAuthorClass: 'block mt-8 text-xs font-black uppercase tracking-[0.4em] text-zinc-600',
        highlightPhraseClass: 'text-blue-400 font-bold border-b-2 border-blue-400/20 pb-0.5',
        heroBoxClass: 'editorial-hero bg-blue-600/5 border border-white/5 rounded-[4rem] mb-20',
        heroTitleClass: 'text-7xl font-black text-white bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent',
        gridBoxClass: 'editorial-grid',
        gridItemClass: 'editorial-grid-item bg-white/5 border-white/10 hover:bg-white/[0.07]',
        previewColors: ['#0a0a0b', '#3b82f6', '#ffffff'],
        previewFont: 'Sans',
        entranceAnimationClass: 'reveal-on-scroll'
    },
    minimalist_paper: {
        id: 'minimalist_paper',
        name: 'Minimalist Paper',
        wrapperClass: 'bg-[#fff] text-[#1a1a1a] font-serif p-12 md:p-24 max-w-4xl mx-auto min-h-screen border-x border-slate-100 shadow-sm leading-relaxed',
        headingClass: 'text-5xl font-normal text-black mb-16 border-b-2 border-black pb-8 tracking-tight',
        subheadingClass: 'text-2xl font-bold text-black mt-16 mb-6 tracking-tight',
        tertiaryHeadingClass: 'text-lg font-bold text-slate-800 mt-12 mb-4 italic',
        paragraphClass: 'text-xl text-slate-800 mb-8 leading-loose indent-8 first-of-type:indent-0',
        blockquoteClass: 'py-12 px-10 my-16 border-y border-slate-200 text-3xl font-light text-center tracking-tight text-slate-900',
        blockquoteAuthorClass: 'block mt-6 text-sm font-bold uppercase tracking-widest text-slate-400 text-center',
        listClass: 'space-y-4 my-10 ml-12 list-decimal',
        listItemClass: 'text-lg text-slate-700 font-medium',
        boldClass: 'font-black text-black',
        italicClass: 'italic text-slate-600',
        noteBoxClass: 'bg-slate-50 p-10 my-12 font-sans border border-slate-100 text-slate-600 text-lg leading-relaxed',
        testimonialBoxClass: 'my-20 font-sans text-center max-w-2xl mx-auto',
        testimonialAuthorClass: 'block mt-4 text-xs font-bold uppercase tracking-widest text-slate-300',
        highlightPhraseClass: 'bg-yellow-100/30 font-bold px-1',
        heroBoxClass: 'editorial-hero border-b border-black mb-24',
        heroTitleClass: 'text-6xl font-normal text-black italic',
        gridBoxClass: 'editorial-grid border-y border-slate-100',
        gridItemClass: 'editorial-grid-item border-none',
        previewColors: ['#ffffff', '#1a1a1a', '#657b83'],
        previewFont: 'Serif',
        entranceAnimationClass: 'reveal-on-scroll'
    },
    saas_modern: {
        id: 'saas_modern',
        name: 'SaaS Modern',
        wrapperClass: 'bg-white text-slate-900 font-sans p-12 max-w-4xl mx-auto leading-relaxed',
        headingClass: 'text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-8 tracking-tighter',
        subheadingClass: 'text-2xl font-bold text-slate-800 mt-12 mb-4',
        paragraphClass: 'text-lg text-slate-600 mb-6',
        blockquoteClass: 'border-l-4 border-blue-500 pl-6 py-2 italic text-slate-500 my-8 bg-blue-50/50 rounded-r-xl',
        listClass: 'list-disc ml-6 space-y-2 my-6',
        listItemClass: 'text-slate-600',
        boldClass: 'font-bold text-slate-900',
        noteBoxClass: 'bg-slate-50 border border-slate-200 p-6 my-8 rounded-xl',
        highlightPhraseClass: 'text-blue-600 font-bold',
        heroBoxClass: 'editorial-hero bg-slate-50/50 rounded-3xl mb-12',
        heroTitleClass: 'text-5xl font-black text-slate-900',
        gridBoxClass: 'editorial-grid',
        previewColors: ['#ffffff', '#2563eb', '#1e293b'],
        previewFont: 'Sans',
        gridItemClass: 'editorial-grid-item bg-white border-slate-200'
    },
    editorial_luxury: {
        id: 'editorial_luxury',
        name: 'Editorial Luxury',
        wrapperClass: 'bg-[#faf9f6] text-[#1a1a1a] font-serif p-16 max-w-3xl mx-auto italic-quotes leading-loose',
        headingClass: 'text-6xl font-normal border-b border-black/10 pb-6 mb-12 text-center uppercase tracking-[0.2em]',
        subheadingClass: 'text-3xl font-light italic mt-16 mb-6 text-slate-700',
        paragraphClass: 'text-xl text-[#2c2c2c] mb-8 first-letter:text-5xl first-letter:font-bold first-letter:mr-3 first-letter:float-left',
        blockquoteClass: 'border-y border-black/5 py-10 px-8 text-2xl font-light text-center my-12 tracking-wide',
        listClass: 'list-none space-y-4 my-8 italic text-center',
        listItemClass: 'text-slate-700',
        boldClass: 'font-semibold tracking-tighter',
        previewColors: ['#faf9f6', '#1a1a1a', '#000000'],
        previewFont: 'Serif',
        blockquoteAuthorClass: 'block mt-4 text-xs font-bold text-center'
    },
    bold_industrial: {
        id: 'bold_industrial',
        name: 'Bold Industrial',
        wrapperClass: 'bg-[#050505] text-[#e0e0e0] font-mono p-10 max-w-5xl mx-auto border-x border-white/5',
        headingClass: 'text-7xl font-black text-white mb-6 uppercase tracking-tighter bg-yellow-400 text-black px-4 inline-block',
        subheadingClass: 'text-2xl font-black text-white mt-14 mb-4 border-l-8 border-yellow-400 pl-4 uppercase',
        paragraphClass: 'text-base text-gray-400 mb-6 leading-7',
        blockquoteClass: 'bg-white/5 border border-white/10 p-8 my-10 font-bold text-yellow-400 uppercase tracking-widest',
        listClass: 'space-y-4 my-8 border-l border-white/10 pl-6',
        listItemClass: 'before:content-["["] after:content-["]"] before:mr-2 after:ml-2 text-yellow-500 font-bold',
        boldClass: 'text-white underline decoration-yellow-400 underline-offset-4',
        noteBoxClass: 'border-2 border-yellow-400 p-6 my-8 text-white uppercase',
        previewColors: ['#050505', '#facc15', '#ffffff'],
        previewFont: 'Mono'
    },
    executive_platinum: {
        id: 'executive_platinum',
        isNew: true,
        name: 'Executive Platinum',
        wrapperClass: 'bg-[#0f172a] text-slate-200 font-sans p-12 md:p-24 max-w-5xl mx-auto shadow-2xl rounded-none border-t-[12px] border-slate-400',
        headingClass: 'text-6xl font-black text-white mb-12 tracking-tight uppercase border-b border-white/10 pb-8',
        subheadingClass: 'text-2xl font-black text-slate-400 mt-16 mb-6 tracking-[0.2em] uppercase',
        paragraphClass: 'text-xl text-slate-300 mb-8 leading-relaxed font-light',
        blockquoteClass: 'bg-slate-800/50 p-12 my-14 border-l-4 border-slate-400 italic text-2xl text-white',
        listClass: 'space-y-4 my-10 ml-6',
        listItemClass: 'text-lg text-slate-300 flex items-start gap-4 before:content-["■"] before:text-slate-500 before:text-xs before:mt-1.5',
        boldClass: 'text-white font-black',
        noteBoxClass: 'bg-slate-700/30 border border-slate-600 p-8 my-10 rounded-lg text-slate-200',
        previewColors: ['#0f172a', '#94a3b8', '#ffffff'],
        previewFont: 'Sans'
    },
    cyberpunk_neon: {
        id: 'cyberpunk_neon',
        isNew: true,
        name: 'Cyberpunk Neon',
        wrapperClass: 'bg-[#020202] text-[#00ffcc] font-mono p-8 md:p-16 max-w-6xl mx-auto border-2 border-[#ff00ff]/20 shadow-[0_0_50px_rgba(255,0,255,0.1)]',
        headingClass: 'text-7xl font-black mb-12 italic uppercase tracking-tighter shadow-magenta drop-shadow-[0_0_10px_#ff00ff]',
        subheadingClass: 'text-3xl font-bold text-[#ff00ff] mt-16 mb-8 uppercase animate-pulse',
        paragraphClass: 'text-lg text-[#00ffcc]/80 mb-8 leading-7 border-l-2 border-[#00ffcc]/20 pl-6',
        blockquoteClass: 'bg-[#ff00ff]/5 border border-[#ff00ff]/30 p-10 my-12 text-2xl text-white font-black uppercase text-center',
        listClass: 'space-y-4 my-10 ml-4',
        listItemClass: 'text-[#00ffcc] flex items-center gap-3 before:content-["_>"] before:text-[#ff00ff]',
        boldClass: 'text-white bg-[#ff00ff]/20 px-1',
        noteBoxClass: 'bg-[#00ffcc]/10 border-l-4 border-[#00ffcc] p-8 my-10 text-white',
        previewColors: ['#020202', '#ff00ff', '#00ffcc'],
        previewFont: 'Mono'
    },
    solarized_creative: {
        id: 'solarized_creative',
        isNew: true,
        name: 'Solarized Creative',
        wrapperClass: 'bg-[#fdf6e3] text-[#657b83] font-sans p-10 md:p-20 max-w-5xl mx-auto shadow-sm border border-[#eee8d5]',
        headingClass: 'text-6xl font-black text-[#268bd2] mb-10 tracking-tight leading-none',
        subheadingClass: 'text-3xl font-bold text-[#859900] mt-16 mb-6',
        paragraphClass: 'text-xl text-[#586e75] mb-8 leading-relaxed',
        blockquoteClass: 'bg-[#eee8d5] p-12 my-14 text-3xl font-light italic text-[#cb4b16] text-center rounded-3xl',
        listClass: 'space-y-4 my-10 ml-6',
        listItemClass: 'text-lg text-[#586e75] flex items-center gap-3 before:w-3 before:h-3 before:bg-[#2aa198] before:rounded-full',
        boldClass: 'text-[#073642] font-black',
        noteBoxClass: 'bg-[#eee8d5] border border-[#d33682]/20 p-8 my-10 rounded-2xl text-[#d33682]',
        previewColors: ['#fdf6e3', '#268bd2', '#859900'],
        previewFont: 'Sans'
    },
    academic_ivory: {
        id: 'academic_ivory',
        isNew: true,
        name: 'Academic Ivory',
        wrapperClass: 'bg-[#fcf8f2] text-[#2c1810] font-serif p-16 md:p-32 max-w-4xl mx-auto shadow-inner border border-[#e8dfd0]',
        headingClass: 'text-5xl font-normal text-[#1a0f0a] mb-16 text-center border-b border-[#2c1810]/20 pb-12 font-serif italic',
        subheadingClass: 'text-2xl font-bold text-[#4a2c1d] mt-20 mb-8 border-l-2 border-[#4a2c1d] pl-6 uppercase tracking-widest',
        paragraphClass: 'text-xl text-[#3d2b1f] mb-10 leading-loose first-letter:text-4xl first-letter:font-bold',
        blockquoteClass: 'py-12 px-16 my-20 border-y border-[#2c1810]/20 text-2xl font-serif italic text-center text-[#4a2c1d]',
        listClass: 'space-y-6 my-12 ml-12 list-decimal',
        listItemClass: 'text-lg text-[#3d2b1f]',
        boldClass: 'font-black text-[#1a0f0a]',
        noteBoxClass: 'bg-[#f5eadc] p-10 my-12 border-l-8 border-[#1a0f0a] text-[#1a0f0a]',
        previewColors: ['#fcf8f2', '#1a0f0a', '#4a2c1d'],
        previewFont: 'Serif'
    }
}

/**
 * Wraps stitched HTML content with the selected theme's styling.
 * This replaces standard HTML tags with Tailwind-styled equivalents
 * and handles custom [MARKER] identifiers for Typeset-style automation.
 */
export function applyTheme(htmlContent: string, themeId: string, overrides?: ThemeOverrides, wrapLayout: boolean = true): string {
    const theme = THEMES[themeId] || THEMES.premium_blog
    const anim = theme.entranceAnimationClass || ''

    // 1. Generate Dynamic Styles (Advanced Engine)
    const dynamicStyles = overrides ? `
        --content-font-size: ${overrides.fontSize || 18}px;
        --content-line-height: ${overrides.lineHeight || 1.6};
        --content-accent-color: ${overrides.accentColor || 'inherit'};
        --content-bg-color: ${overrides.backgroundColor || 'transparent'};
        --content-text-color: ${overrides.textColor || 'inherit'};
        --content-padding: ${overrides.pagePadding || 0}px;
        --content-margin-sides: ${overrides.marginSides || 0}px;
        --content-letter-spacing: ${overrides.letterSpacing || 0}em;
        --content-font-family: ${overrides.fontFamily || 'inherit'};
        --heading-font-family: ${overrides.headingFontFamily || overrides.fontFamily || 'inherit'};
        --content-paragraph-spacing: ${overrides.paragraphSpacing || 2}rem;
        --content-border-radius: ${overrides.borderRadius || 0}px;
        --content-border-width: ${overrides.borderWidth || 0}px;
        --content-border-color: ${overrides.borderColor || 'transparent'};
        --content-font-weight: ${overrides.fontWeight || 'inherit'};
        --content-text-transform: ${overrides.textTransform || 'none'};
        --content-text-align: ${overrides.textAlign || 'left'};
        --content-gradient: ${overrides.gradient || 'none'};
        --content-bg-image: ${overrides.bgImageUrl ? `url(${overrides.bgImageUrl})` : 'none'};
        
        /* Shadow Mapping */
        --content-shadow: ${overrides.shadowDepth === 'soft' ? '0 10px 30px rgba(0,0,0,0.05)' :
            overrides.shadowDepth === 'medium' ? '0 20px 50px rgba(0,0,0,0.1)' :
                overrides.shadowDepth === 'hard' ? '0 30px 100px rgba(0,0,0,0.2)' :
                    overrides.shadowDepth === 'inner' ? 'inset 0 2px 20px rgba(0,0,0,0.1)' : 'none'};
                    
        /* Layout Mapping */
        --content-columns: ${overrides.columnCount || 1};
        --content-image-spacing: ${overrides.imageSpacing !== undefined ? overrides.imageSpacing : 40}px;
    ` : '';

    const wrapperStyle = overrides ? `style="${dynamicStyles}"` : '';
    const overrideClasses = overrides ? 'customized-content' : '';

    // 2. High-Impact Section Markers
    let styledHtml = htmlContent
        .replace(/\[HERO:\s*(.*?)\s*--\s*(.*?)\]/g, `<div class="${theme.heroBoxClass || 'editorial-hero'} ${anim}">
                <h1 class="${theme.heroTitleClass || theme.headingClass}">$1</h1>
                <p class="${theme.paragraphClass}">$2</p>
            </div>`)
        .replace(/\[GRID:\s*(.*?)\s*\]/g, (_, content) => {
            const items = content.split('|').map((item: string, i: number) =>
                `<div class="${theme.gridItemClass || 'editorial-grid-item'} ${anim} delay-${(i + 1) * 100}">${item.trim()}</div>`
            ).join('');
            return `<div class="${theme.gridBoxClass || 'editorial-grid'}">${items}</div>`;
        })
        .replace(/\[SPLIT:\s*(.*?)\s*--\s*(.*?)\]/g, `<div class="editorial-split ${anim}">
                <div class="split-text">${mdToHtml('$1')}</div>
                <div class="split-content">${mdToHtml('$2')}</div>
            </div>`)

    // 3. Standard Markers
    styledHtml = styledHtml
        .replace(/\[(?:QUOTE|TESTIMONIAL):\s*(.*?)\s*--\s*(.*?)\]/g, (match, text, author) => {
            const isTestimonial = match.includes('TESTIMONIAL')
            const boxClass = isTestimonial ? theme.testimonialBoxClass : theme.blockquoteClass
            const authorClass = isTestimonial ? theme.testimonialAuthorClass : theme.blockquoteAuthorClass
            return `<div class="${boxClass || 'p-8 border my-8'} ${anim}">
                "${text}"
                <span class="${authorClass || 'block mt-2 font-bold'}">${author}</span>
            </div>`
        })
        .replace(/\[NOTE:\s*(.*?)\]/g, `<div class="${theme.noteBoxClass || 'bg-slate-50 p-4 my-6 border'} ${anim}">$1</div>`)
        .replace(/\[PHRASE:\s*(.*?)\]/g, `<span class="${theme.highlightPhraseClass || 'font-bold underline'} phrase-marker">$1</span>`)

    // 4. Aggressive Tag Styling
    styledHtml = styledHtml
        .replace(/<h1[^>]*>(.*?)<\/h1>/gi, `<h1 class="${theme.headingClass} ${anim}">$1</h1>`)
        .replace(/<h2[^>]*>(.*?)<\/h2>/gi, `<h2 class="${theme.subheadingClass} ${anim} mt-20 mb-8">$1</h2>`)
        .replace(/<h3[^>]*>(.*?)<\/h3>/gi, `<h3 class="${theme.tertiaryHeadingClass || 'text-xl font-bold'} ${anim} mt-12 mb-4">$1</h3>`)
        .replace(/<p[^>]*>(.*?)<\/p>/gi, `<p class="${theme.paragraphClass} ${anim} mb-8">$1</p>`)
        .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, `<blockquote class="${theme.blockquoteClass} ${anim}">$1</blockquote>`)
        .replace(/<strong[^>]*>(.*?)<\/strong>/gi, `<strong class="${theme.boldClass || 'font-extrabold text-slate-900'}">$1</strong>`)
        .replace(/<em[^>]*>(.*?)<\/em>/gi, `<em class="${theme.italicClass || 'italic'}">$1</em>`)
        .replace(/<li[^>]*>(.*?)<\/li>/gi, `<li class="${theme.listItemClass || 'mb-2'} ${anim}">$1</li>`)
        .replace(/<ul[^>]*>(.*?)<\/ul>/gi, `<ul class="${theme.listClass || 'list-disc ml-6 my-8 space-y-2'} ${anim}">$1</ul>`)
        .replace(/<ol[^>]*>(.*?)<\/ol>/gi, `<ol class="${theme.listClass || 'list-decimal ml-6 my-8 space-y-2'} ${anim}">$1</ol>`);

    if (!wrapLayout) return styledHtml

    const fontsToLoad = [overrides?.fontFamily, overrides?.headingFontFamily].filter(Boolean) as string[];
    const googleFontsUrl = fontsToLoad.length > 0 ?
        `https://fonts.googleapis.com/css2?family=${fontsToLoad.map(f => f.split(',')[0].trim().replace(/\s+/g, '+')).join('&family=')}&display=swap` : '';

    return `
        <div class="premium-content-container ${theme.wrapperClass} ${overrideClasses}" ${wrapperStyle}>
            ${googleFontsUrl ? `<link rel="stylesheet" href="${googleFontsUrl}">` : ''}
            <style>
                .customized-content {
                    --accent: ${overrides?.accentColor || 'inherit'};
                    font-family: var(--content-font-family) !important;
                    background-color: var(--content-bg-color) !important;
                    background-image: var(--content-gradient), var(--content-bg-image) !important;
                    background-size: cover !important;
                    background-position: center !important;
                    color: var(--content-text-color) !important;
                    padding: var(--content-padding) !important;
                    letter-spacing: var(--content-letter-spacing) !important;
                    border-radius: var(--content-border-radius) !important;
                    border: var(--content-border-width) solid var(--content-border-color) !important;
                    box-shadow: var(--content-shadow) !important;
                    padding-left: calc(var(--content-padding) + var(--content-margin-sides)) !important;
                    padding-right: calc(var(--content-padding) + var(--content-margin-sides)) !important;
                }
                .customized-content p, .customized-content li, .customized-content blockquote {
                    font-size: var(--content-font-size) !important;
                    line-height: var(--content-line-height) !important;
                    font-family: var(--content-font-family) !important;
                    color: var(--content-text-color) !important;
                    font-weight: var(--content-font-weight) !important;
                    text-transform: var(--content-text-transform) !important;
                    text-align: var(--content-text-align) !important;
                }
                .customized-content h1, .customized-content h2, .customized-content h3 {
                    font-family: var(--heading-font-family) !important;
                    color: var(--accent) !important;
                    text-align: var(--content-text-align) !important;
                }
                .customized-content p, .customized-content ul, .customized-content ol, .customized-content blockquote {
                    margin-bottom: var(--content-paragraph-spacing) !important;
                }
                .customized-content .editorial-body {
                    column-count: var(--content-columns);
                    column-gap: 3rem;
                }
                .customized-content strong, .customized-content .phrase-marker, .customized-content .accent-text {
                    color: var(--accent) !important;
                }
                
                /* List Styling */
                .customized-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; }
                .customized-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; }
                .customized-content li { margin-bottom: 0.5rem !important; }
                
                /* Image Spacing */
                .customized-content img {
                    margin-top: var(--content-image-spacing) !important;
                    margin-bottom: var(--content-image-spacing) !important;
                }
            </style>
            <div class="editorial-body">
                ${styledHtml}
            </div>
            <script>
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) entry.target.classList.add('is-visible');
                    });
                }, { threshold: 0.1 });
                document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
            </script>
        </div>
    `
}

// Helper needed because applyTheme might be called recursively for split sections
function mdToHtml(md: string): string {
    // This is a simple version, the full one is in stitching.ts but we need a 
    // basic one here for the split content logic if it contains MD
    return md.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}
