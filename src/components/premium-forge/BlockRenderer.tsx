'use client';

import React from 'react';
import { BlockType, BlockContent, HeroBlockContent, FeatureSplitBlockContent, MultiColumnBlockContent, QuoteBlockContent, CTABlockContent, DeepTextBlockContent } from '@/lib/ai/block-schemas';
import { Quote, Star, ArrowRight, Code, MoveUp, MoveDown, Trash2, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

interface BlockRendererProps {
    id: string;
    type: BlockType;
    content: BlockContent;
    status?: 'Pending' | 'Generating' | 'Completed' | 'Error' | 'ProcessingImage';
    imageUrl?: string;
    htmlOverride?: string;
    isEditing?: boolean;
    onSelection?: () => void;
    // content_json and content_html are the database fields we update
    onUpdate: (updates: { content_json?: BlockContent; content_html?: string }) => Promise<void>;
    onMove: (direction: 'up' | 'down') => void;
    onDelete: () => void;
    reasoning?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    id, type, content, status = 'Completed', imageUrl, htmlOverride, isEditing, onSelection, onUpdate, onMove, onDelete, reasoning
}) => {
    const [isEditingSource, setIsEditingSource] = React.useState(false);
    const [sourceContent, setSourceContent] = React.useState(htmlOverride || '');

    const handleSaveSource = async () => {
        await onUpdate({ content_html: sourceContent });
        setIsEditingSource(false);
    };

    const renderSkeleton = () => (
        <div className="relative p-12 bg-gray-50 rounded-[3rem] border border-gray-100 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none" />
            <div className="flex flex-col gap-6 max-w-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <div className="h-4 w-32 bg-gray-200 rounded-full animate-pulse" />
                </div>
                <div className="h-12 w-full bg-gray-200 rounded-2xl animate-pulse" />
                <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-100 rounded-full animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-100 rounded-full animate-pulse" />
                </div>
            </div>
            <div className="absolute top-8 right-8 text-[10px] font-black uppercase tracking-widest text-primary/40 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                {status === 'Pending' ? (
                    <>Blueprint Draft <ArrowRight className="w-3 h-3" /></>
                ) : (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Synthesizing Content</>
                )}
            </div>
            {reasoning && (
                <div className="mt-8 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Code className="w-3 h-3" /> Block Strategy
                    </div>
                    <p className="text-sm text-gray-600 italic leading-relaxed">&quot;{reasoning}&quot;</p>
                </div>
            )}
        </div>
    );

    const renderBlockUI = () => {
        if (status === 'Pending' || status === 'Generating') {
            return renderSkeleton();
        }

        if (isEditingSource) {
            return (
                <div className="p-8 bg-zinc-950 rounded-3xl border border-white/10 space-y-4 shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">HTML Source Editor</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsEditingSource(false)} className="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleSaveSource} className="px-4 py-1.5 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg shadow-primary/20">Save Block</button>
                        </div>
                    </div>
                    <textarea
                        value={sourceContent}
                        onChange={(e) => setSourceContent(e.target.value)}
                        className="w-full h-[400px] bg-black/50 border border-white/5 rounded-2xl p-6 text-xs text-blue-300 font-mono outline-none focus:border-primary/50 transition-all resize-none"
                    />
                </div>
            )
        }

        if (htmlOverride) {
            return <div dangerouslySetInnerHTML={{ __html: htmlOverride }} />;
        }

        switch (type) {
            case 'Hero':
                const heroContent = content as HeroBlockContent;
                return (
                    <div
                        className="relative py-24 px-12 overflow-hidden bg-black text-white transition-all duration-500"
                        style={{
                            borderRadius: 'var(--atomic-radius)',
                            borderWidth: 'var(--atomic-border-width)',
                            borderColor: 'var(--atomic-border-color)',
                            boxShadow: 'var(--atomic-shadow)',
                            fontFamily: 'var(--atomic-font-heading)'
                        }}
                    >
                        {imageUrl && imageUrl.startsWith('http') ? (
                            <div className="absolute inset-0 opacity-40">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={imageUrl} alt="Hero Background" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center opacity-30">
                                <ImageIcon className="w-20 h-20 text-white/10" />
                            </div>
                        )}
                        <div className="relative z-10 max-w-3xl">
                            <h1
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate({ content_json: { ...heroContent, mainTitle: e.currentTarget.innerText } })}
                                onMouseUp={onSelection}
                                onKeyUp={onSelection}
                                className={`text-6xl font-black mb-6 leading-tight uppercase tracking-tighter outline-none ${isEditing ? 'hover:bg-white/5 focus:bg-white/10 rounded-lg p-2 transition-all' : ''}`}
                                style={{ letterSpacing: 'var(--atomic-letter-spacing)', color: 'var(--atomic-accent)' }}
                            >
                                {heroContent.mainTitle || 'Chapter Heading'}
                            </h1>
                            <p
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate({ content_json: { ...heroContent, description: e.currentTarget.innerText } })}
                                onMouseUp={onSelection}
                                onKeyUp={onSelection}
                                className={`text-xl text-gray-300 font-medium mb-8 leading-relaxed outline-none ${isEditing ? 'hover:bg-white/5 focus:bg-white/10 rounded-lg p-2 transition-all' : ''}`}
                                style={{ fontFamily: 'var(--atomic-font-body)' }}
                            >
                                {heroContent.description || 'Chapter Subtitle or descriptive intro text hook.'}
                            </p>
                            {heroContent.ctaText && (
                                <button className="bg-primary text-white px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                                    {heroContent.ctaText}
                                </button>
                            )}
                        </div>
                    </div>
                );

            case 'FeatureSplit':
                const splitContent = content as FeatureSplitBlockContent;
                const isImageLeft = splitContent.theme === 'image-left';
                return (
                    <div
                        className={`flex flex-col md:flex-row items-center py-16 ${isImageLeft ? '' : 'md:flex-row-reverse'}`}
                        style={{ gap: 'var(--atomic-image-spacing)' }}
                    >
                        <div
                            className="flex-1 overflow-hidden bg-gray-100 min-h-[400px] flex items-center justify-center relative group/img transition-all duration-500"
                            style={{
                                borderRadius: 'var(--atomic-radius)',
                                boxShadow: 'var(--atomic-shadow)'
                            }}
                        >
                            {imageUrl && imageUrl.startsWith('http') ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imageUrl} alt={splitContent.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-4 text-gray-300">
                                    <Sparkles className={`w-12 h-12 ${status === 'ProcessingImage' ? 'animate-bounce text-primary' : ''}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {status === 'ProcessingImage' ? 'Generating Visual...' : 'Visual Placeholder'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 space-y-6">
                            {splitContent.featureLabel && (
                                <span
                                    className="text-xs font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full transition-all"
                                    style={{ color: 'var(--atomic-accent)', backgroundColor: 'color-mix(in srgb, var(--atomic-accent), transparent 90%)' }}
                                >
                                    {splitContent.featureLabel}
                                </span>
                            )}
                            <h2
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate({ content_json: { ...splitContent, title: e.currentTarget.innerText } })}
                                onMouseUp={onSelection}
                                onKeyUp={onSelection}
                                className={`text-4xl font-black text-gray-900 leading-tight outline-none ${isEditing ? 'hover:bg-black/5 focus:bg-black/5 rounded-lg p-1 transition-all' : ''}`}
                                style={{ fontFamily: 'var(--atomic-font-heading)' }}
                            >
                                {splitContent.title || 'Feature Title'}
                            </h2>
                            <div
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate({ content_json: { ...splitContent, text: e.currentTarget.innerHTML } })}
                                onMouseUp={onSelection}
                                onKeyUp={onSelection}
                                className={`text-lg text-gray-600 leading-relaxed prose prose-slate max-w-none outline-none ${isEditing ? 'hover:bg-black/5 focus:bg-black/5 rounded-lg p-2 transition-all' : ''}`}
                                style={{ fontFamily: 'var(--atomic-font-body)', lineHeight: 'var(--atomic-spacing)' }}
                                dangerouslySetInnerHTML={{ __html: splitContent.text || 'Narrative content describing this feature or point.' }}
                            />
                        </div>
                    </div>
                );

            case 'MultiColumn':
                const multiColumnContent = content as MultiColumnBlockContent;
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-12">
                        {(multiColumnContent.columns || [{}, {}, {}]).map((col, idx: number) => (
                            <div
                                key={idx}
                                className="p-8 border hover:border-primary/20 transition-all group"
                                style={{
                                    borderRadius: 'var(--atomic-radius)',
                                    boxShadow: 'var(--atomic-shadow)',
                                    backgroundColor: 'color-mix(in srgb, var(--atomic-bg), transparent 50%)',
                                    borderColor: 'var(--atomic-border-color)'
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm"
                                    style={{ color: 'var(--atomic-accent)', backgroundColor: 'color-mix(in srgb, var(--atomic-accent), transparent 90%)' }}
                                >
                                    <Star className="w-6 h-6" />
                                </div>
                                <h3
                                    contentEditable={isEditing}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => {
                                        const newColumns = [...(multiColumnContent.columns || [])];
                                        newColumns[idx] = { ...col, title: e.currentTarget.innerText };
                                        onUpdate({ content_json: { ...multiColumnContent, columns: newColumns } });
                                    }}
                                    onMouseUp={onSelection}
                                    onKeyUp={onSelection}
                                    className={`text-xl font-bold mb-4 text-gray-900 outline-none ${isEditing ? 'hover:bg-black/5 rounded-lg p-1' : ''}`}
                                    style={{ fontFamily: 'var(--atomic-font-heading)' }}
                                >
                                    {col?.title || 'Point Title'}
                                </h3>
                                <p
                                    contentEditable={isEditing}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => {
                                        const newColumns = [...(multiColumnContent.columns || [])];
                                        newColumns[idx] = { ...col, text: e.currentTarget.innerText };
                                        onUpdate({ content_json: { ...multiColumnContent, columns: newColumns } });
                                    }}
                                    onMouseUp={onSelection}
                                    onKeyUp={onSelection}
                                    className={`text-gray-600 leading-relaxed outline-none ${isEditing ? 'hover:bg-black/5 rounded-lg p-1' : ''}`}
                                    style={{ fontFamily: 'var(--atomic-font-body)' }}
                                >
                                    {col?.text || 'Explanatory text for this specific point or column.'}
                                </p>
                            </div>
                        ))}
                    </div>
                );

            case 'Quote':
                const quoteContent = content as QuoteBlockContent;
                return (
                    <div
                        className="py-20 px-8 border relative overflow-hidden transition-all duration-500"
                        style={{
                            borderRadius: 'var(--atomic-radius)',
                            backgroundColor: 'color-mix(in srgb, var(--atomic-accent), transparent 95%)',
                            borderColor: 'color-mix(in srgb, var(--atomic-accent), transparent 85%)',
                            boxShadow: 'var(--atomic-shadow)'
                        }}
                    >
                        <Quote
                            className="absolute -top-10 -left-10 w-40 h-40 rotate-12"
                            style={{ color: 'color-mix(in srgb, var(--atomic-accent), transparent 95%)' }}
                        />
                        <div className="relative z-10 max-w-4xl mx-auto text-center">
                            <blockquote
                                contentEditable={isEditing}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => onUpdate({ content_json: { ...quoteContent, quote: e.currentTarget.innerText.replace(/^"(.*)"$/, '$1') } })}
                                onMouseUp={onSelection}
                                onKeyUp={onSelection}
                                className={`text-3xl font-bold italic text-gray-800 mb-8 leading-snug outline-none ${isEditing ? 'hover:bg-primary/5 rounded-2xl p-4 transition-all' : ''}`}
                                style={{ fontFamily: 'var(--atomic-font-heading)' }}
                            >
                                &quot;{quoteContent.quote || 'Inspiring insight or categorical truth.'}&quot;
                            </blockquote>
                            <div className="flex flex-col items-center">
                                {quoteContent.authorImage && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={quoteContent.authorImage} alt={quoteContent.author} className="w-16 h-16 rounded-full mb-4 shadow-lg border-2 border-white" />
                                )}
                                <cite
                                    contentEditable={isEditing}
                                    suppressContentEditableWarning={true}
                                    onBlur={(e) => onUpdate({ content_json: { ...quoteContent, author: e.currentTarget.innerText } })}
                                    onMouseUp={onSelection}
                                    onKeyUp={onSelection}
                                    className={`not-italic text-lg font-black text-gray-900 uppercase tracking-widest outline-none ${isEditing ? 'hover:bg-primary/5 rounded-lg px-4 py-1 transition-all' : ''}`}
                                >
                                    {quoteContent.author || 'Author Name'}
                                </cite>
                                {quoteContent.authorTitle && (
                                    <span
                                        contentEditable={isEditing}
                                        suppressContentEditableWarning={true}
                                        onBlur={(e) => onUpdate({ content_json: { ...quoteContent, authorTitle: e.currentTarget.innerText } })}
                                        onMouseUp={onSelection}
                                        onKeyUp={onSelection}
                                        className={`text-gray-500 uppercase tracking-widest text-[10px] font-bold outline-none ${isEditing ? 'hover:bg-primary/5 rounded-lg px-2 mt-1 transition-all' : ''}`}
                                    >
                                        {quoteContent.authorTitle}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'DeepText':
                const deepContent = content as DeepTextBlockContent;
                return (
                    <div
                        contentEditable={isEditing}
                        suppressContentEditableWarning={true}
                        onBlur={(e) => onUpdate({ content_json: { ...deepContent, contentHtml: e.currentTarget.innerHTML } })}
                        onMouseUp={onSelection}
                        onKeyUp={onSelection}
                        className={`prose prose-xl max-w-none text-gray-800 leading-relaxed py-8 editorial-body font-serif px-4 outline-none ${isEditing ? 'hover:bg-black/5 focus:bg-black/5 rounded-3xl transition-all' : ''}`}
                        dangerouslySetInnerHTML={{ __html: deepContent.contentHtml || 'Detailed editorial body text with <em>rich</em> formatting.' }}
                    />
                );

            case 'CTA':
                const ctaContent = content as CTABlockContent;
                return (
                    <div
                        className="py-16 px-12 text-white text-center transition-all duration-500"
                        style={{
                            borderRadius: 'var(--atomic-radius)',
                            backgroundColor: 'var(--atomic-accent)',
                            boxShadow: 'var(--atomic-shadow)'
                        }}
                    >
                        <h2
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => onUpdate({ content_json: { ...ctaContent, title: e.currentTarget.innerText } })}
                            onMouseUp={onSelection}
                            onKeyUp={onSelection}
                            className={`text-4xl font-black mb-6 uppercase tracking-tight outline-none ${isEditing ? 'hover:bg-white/10 rounded-2xl p-4 transition-all' : ''}`}
                            style={{ fontFamily: 'var(--atomic-font-heading)' }}
                        >
                            {ctaContent.title || 'Call to Action'}
                        </h2>
                        <p
                            contentEditable={isEditing}
                            suppressContentEditableWarning={true}
                            onBlur={(e) => onUpdate({ content_json: { ...ctaContent, description: e.currentTarget.innerText } })}
                            onMouseUp={onSelection}
                            onKeyUp={onSelection}
                            className={`text-xl opacity-90 mb-10 max-w-2xl mx-auto outline-none ${isEditing ? 'hover:bg-white/10 rounded-2xl p-4 transition-all' : ''}`}
                            style={{ fontFamily: 'var(--atomic-font-body)' }}
                        >
                            {ctaContent.description || 'Conversion hook or transition to the next chapter.'}
                        </p>
                        <button className="bg-white text-primary px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1">
                            {ctaContent.buttonText || 'Take Action'}
                        </button>
                    </div>
                );

            default:
                return <div className="p-8 border border-dashed rounded-xl text-gray-400 text-center uppercase tracking-widest font-black text-[10px]">Unrecognized Block: {type}</div>;
        }
    };

    return (
        <div className="relative group mb-12">
            {/* Control Overlay */}
            <div className="absolute -left-16 top-0 bottom-0 w-12 flex-col items-center gap-2 py-4 opacity-0 group-hover:opacity-100 transition-all hidden lg:flex">
                <button onClick={() => onMove('up')} className="p-2.5 bg-white shadow-xl rounded-full text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-95 border border-gray-100"><MoveUp className="w-4 h-4" /></button>
                <button onClick={() => onMove('down')} className="p-2.5 bg-white shadow-xl rounded-full text-gray-400 hover:text-primary transition-all hover:scale-110 active:scale-95 border border-gray-100"><MoveDown className="w-4 h-4" /></button>
                <div className="flex-1" />
                <button onClick={() => { setSourceContent(htmlOverride || document.getElementById(`block-${id}`)?.innerHTML || ''); setIsEditingSource(true); }} className="p-2.5 bg-white shadow-xl rounded-full text-gray-400 hover:text-blue-500 transition-all hover:scale-110 active:scale-95 border border-gray-100" title="Edit HTML Source"><Code className="w-4 h-4" /></button>
                <button onClick={onDelete} className="p-2.5 bg-white shadow-xl rounded-full text-gray-400 hover:text-red-500 transition-all hover:scale-110 active:scale-95 border border-gray-100"><Trash2 className="w-4 h-4" /></button>
            </div>

            <div
                id={`block-${id}`}
                className="transition-all duration-500 group-hover:shadow-[0_0_80px_rgba(0,0,0,0.05)]"
                style={{
                    borderRadius: 'var(--atomic-radius)',
                    backgroundColor: 'var(--atomic-block-bg)',
                    padding: 'var(--atomic-block-padding)',
                    marginBottom: 'var(--atomic-spacing)'
                }}
            >
                {renderBlockUI()}
            </div>
        </div>
    );
};
