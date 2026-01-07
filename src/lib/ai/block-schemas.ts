export type BlockType = 'Hero' | 'FeatureSplit' | 'MultiColumn' | 'Quote' | 'DeepText' | 'CTA' | 'Gallery';

export interface BaseBlockContent {
    title?: string;
    subtitle?: string;
    accent?: string;
}

export interface HeroBlockContent extends BaseBlockContent {
    mainTitle: string;
    description: string;
    ctaText?: string;
    imagePrompt: string;
}

export interface FeatureSplitBlockContent extends BaseBlockContent {
    theme: 'image-left' | 'image-right';
    title: string;
    text: string;
    featureLabel?: string;
    imagePrompt: string;
}

export interface MultiColumnBlockContent extends BaseBlockContent {
    columns: Array<{
        title: string;
        text: string;
        icon?: string;
    }>;
}

export interface QuoteBlockContent extends BaseBlockContent {
    quote: string;
    author: string;
    authorTitle?: string;
    authorImage?: string;
}

export interface DeepTextBlockContent extends BaseBlockContent {
    contentHtml: string; // Clean semantic HTML
}

export interface CTABlockContent extends BaseBlockContent {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
}

export interface GalleryBlockContent extends BaseBlockContent {
    images: Array<{
        url?: string;
        caption?: string;
        prompt?: string;
    }>;
}

export type BlockContent =
    | HeroBlockContent
    | FeatureSplitBlockContent
    | MultiColumnBlockContent
    | QuoteBlockContent
    | DeepTextBlockContent
    | CTABlockContent
    | GalleryBlockContent;

export interface BlockStyleOverrides {
    padding?: string;
    margin?: string;
    backgroundColor?: string;
    textColor?: string;
    borderRadius?: string;
    boxShadow?: string;
    opacity?: number;
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    letterSpacing?: string;
    maxWidth?: string;
    fullBleed?: boolean;
}

export interface AtomicBlock {
    id: string;
    type: BlockType;
    content: BlockContent;
    style_overrides: BlockStyleOverrides;
    reasoning?: string;
}

export interface BlockBlueprint {
    type: BlockType;
    reasoning: string; // Why the AI chose this block here
}
