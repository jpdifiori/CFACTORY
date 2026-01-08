export type Language = 'en' | 'es'

export interface Translation {
    nav: {
        features: string
        testimonials: string
        terms: string
        login: string
        join: string
        dashboard: string
        projects: string
        settings: string
        premium_forge: string
        new_campaign: string
        social_hub: string
        vault: string
    }
    connections: {
        title: string
        subtitle: string
        disconnected: string
        no_account: string
        test_bridge: string
        connect_account: string
        safety_zones_title: string
        safety_zones_desc: string
        bottom_clearance: string
        top_clearance: string
        side_clearance: string
        apply_context: string
        encryption_notice: string
        modal: {
            sync: string
            handshake: string
            account_label: string
            account_placeholder: string
            platform_id_label: string
            access_token_label: string
            how_to: string
            help: string
            authorize: string
            loading: string
        }
        platforms: {
            instagram: { id_label: string, token_label: string, id_help: string, token_help: string }
            facebook: { id_label: string, token_label: string, id_help: string, token_help: string }
            linkedin: { id_label: string, token_label: string, id_help: string, token_help: string }
            twitter: { id_label: string, token_label: string, id_help: string, token_help: string }
            tiktok: { id_label: string, token_label: string, id_help: string, token_help: string }
        }
    }
    new_campaign: {
        title: string
        subtitle: string
        back: string
        strategy_level: string
        visual_level: string
        form: {
            name_label: string
            name_placeholder: string
            duration_label: string
            objective_label: string
            objective_placeholder: string
            framework_label: string
            cta_label: string
            cta_placeholder: string
            pillars_label: string
            pillars_placeholder: string
            add_pillar: string
            copy_instructions_label: string
            copy_instructions_placeholder: string
            visual_style_label: string
            mood_label: string
            mood_placeholder: string
            palette_label: string
            palette_placeholder: string
            visual_instructions_label: string
            visual_instructions_placeholder: string
            submit_button: string
            submitting: string
            uses_strategy: string
        }
        options: {
            duration: {
                monthly: string
                quarterly: string
                annual: string
            }
        }
        wizard: {
            steps: {
                context: string
                insights: string
                strategy: string
                content: string
                visual: string
            }
            market: {
                intel_title: string
                intel_subtitle: string
                topic_label: string
                orientation_label: string
                problem_label: string
                topic_placeholder: string
                orientation_placeholder: string
                problem_placeholder: string
                differential_label: string
                differential_placeholder: string
                analyze_button: string
                analyzing: string
                insights: {
                    analyzing: string
                    failed: string
                    viral_potential: string
                    score: string
                    niche_gap: string
                    top_hook: string
                    hooks: string
                    patterns: string
                    seo_title: string
                    authority_title: string
                    gap_label: string
                    auth_keywords: string
                    generate_instructions: string
                }
            }
            nav: {
                next: string
                back: string
                create: string
            }
            help: {
                topic: { description: string; examples: string }
                orientation: { description: string; examples: string }
                problem: { description: string; examples: string }
                differential: { description: string; examples: string }
                name: { description: string; examples: string }
                duration: { description: string; examples: string }
                objective: { description: string; examples: string }
                framework: { description: string; examples: string }
                cta: { description: string; examples: string }
                pillars: { description: string; examples: string }
                copy_instructions: { description: string; examples: string }
                visual_style: { description: string; examples: string }
                mood: { description: string; examples: string }
                palette: { description: string; examples: string }
                visual_instructions: { description: string; examples: string }
            }
        }
    }
    userMenu: {
        profile: string
        logout: string
        language: string
    }
    settings: {
        title: string
        profile_section: string
        full_name: string
        job_title: string
        save: string
        success: string
        error: string
    }
    hero: {
        badge: string
        title_part1: string
        title_part2: string
        description: string
        cta_primary: string
        cta_secondary: string
        social_proof: {
            fastest: string
            secure: string
            hd: string
        }
    }
    features: {
        badge: string
        badge_accent: string
        description: string
        items: Array<{ title: string, description: string }>
        trusted: string
        live_data: string
    }
    testimonials: {
        title: string
        title_accent: string
        subtitle: string
        items: Array<{ name: string, role: string, content: string }>
    }
    cta: {
        title: string
        title_accent: string
        description: string
        button: string
    }
    footer: {
        rights: string
    }
    terms: {
        title: string
        updated: string
        sections: Array<{ title: string, content: string }>
        disclaimer: string
        button: string
    }
    dashboard: {
        title: string
        subtitle: string
        new_project: string
        recent_activity: string
        no_projects: string
        create_first: string
        active: string
        stats: {
            active_projects: string
            content_pieces: string
            avg_engagement: string
            live_data: string
        }
        edit_details: string
        new_campaign: string
        active_campaigns: string
        content_queue: string
        queue_desc: string
        auto_fill: string
        no_results: string
        clear_filters: string
    }
    projects: {
        title: string
        subtitle: string
        create_new: string
        no_projects: string
        no_projects_desc: string
        create_project: string
        manage_content: string
        active: string
        edit_title: string
        initialize_title: string
        initialize_desc: string
        foundation_title: string
        foundation_desc: string
        name_label: string
        niche_label: string
        offering_label: string
        usp_label: string
        problem_label: string
        audience_label: string
        voice_label: string
        save_changes: string
        saving: string
        back_to_dashboard: string
        back_to_project: string
        loading_details: string
        create_company: string
        initializing: string
    }
    campaigns: {
        title: string
        new_campaign: string
        empty_title: string
        empty_desc: string
        edit_campaign: string
        quick_generate: string
        cta_label: string
        generate_title: string
        start_generation: string
        processing: string
        social_post: string
        reel_script: string
        blog_article: string
        push_notification: string
        content_type: string
        quantity: string
        items_count: string
        english: string
        spanish: string
        engine_label: string
        preview_logic: string
        save_config: string
        generation_hub: string
        advanced_settings: string
        format_label: string
        aesthetic_style: string
        quality_label: string
        assets_title: string
        visual_dna: string
        base_style: string
        mood_label: string
        palette_label: string
        voice_label: string
        voice_placeholder: string
        save_success: string
        ready_activation: string
        ready_activation_desc: string
        inspecting_logic: string
        system_role: string
        business_context: string
        master_directives: string
        marketing_framework: string
        language: string
        strategy_brainstorm: string
        brainstorm_desc: string
        generate_ideas: string
        select_idea: string
        ideas_ready: string
        no_ideas: string
        applying_idea: string
        visual_impl: string
        concept_desc: string
        headline_examples: string
        image_text_options: string
        download_image: string
        copy_text: string
        visual_engine: string
        gemini_engine: string
        fal_engine: string
        text_copied: string
        no_text_label: string
        post: string
        reels: string
        story: string
        video: string
        landscape: string
        article: string
        carrusel: string
    }
    sidebar: {
        platform: string
        active_apps: string
        tokens_used: string
        logout: string
        logging_out: string
    }
    common: {
        loading: string
        edit: string
        delete: string
        save: string
        cancel: string
        publish: string
        download: string
        copy: string
        error: string
        all: string
        search: string
        no_data: string
        filter_campaign: string
        filter_month: string
        success: string
    }
    premium_forge: {
        badge: string
        title_forge: string
        description: string
        cta_start: string
        select_type: string
        types: {
            ebook: { title: string, desc: string }
            blog: { title: string, desc: string }
            whitepaper: { title: string, desc: string }
        }
        recent_productions: string
        no_projects: string
        initialize_first: string
        modal: {
            title: string
            context_project: string
            main_topic: string
            placeholder: string
            initializing: string
            create: string
        }
        detail: {
            loading: string
            not_found: string
            back: string
            context: string
            generating_all: string
            generate_all: string
            chapters: string
            status: {
                completed: string
                generating: string
                error: string
                pending: string
            }
            active_theme: string
            pdf_export: string
            weaving: string
            weaving_desc: string
            select_preview: string
            start_generation: string
        }
    }
}

export const translations: Record<Language, Translation> = {
    en: {
        nav: {
            features: "Features",
            testimonials: "Success Stories",
            terms: "Terms",
            login: "Login",
            join: "Join Now",
            dashboard: "Dashboard",
            projects: "Projects",
            settings: "Settings",
            premium_forge: "Premium Forge",
            new_campaign: "Design Campaign",
            social_hub: "Social Hub",
            vault: "Security Vault"
        },
        connections: {
            title: "Project Connections",
            subtitle: "Manage your social platform credentials and safety configurations.",
            disconnected: "Disconnected",
            no_account: "No account linked yet",
            test_bridge: "Test Bridge",
            connect_account: "Connect Account",
            safety_zones_title: "Safety Zones",
            safety_zones_desc: "Define protection areas for your brand. AI will respect these zones to avoid overlapping with platform UI elements.",
            bottom_clearance: "Bottom Clearance (UI)",
            top_clearance: "Top Area (Logo)",
            side_clearance: "Sides Margin",
            apply_context: "Apply Global Context",
            encryption_notice: "All credentials are encrypted client-side and stored in our secure vault. We never store plain-text access tokens.",
            modal: {
                sync: "Sync",
                handshake: "Secure Handshake",
                account_label: "Account Name / User",
                account_placeholder: "@your_brand",
                platform_id_label: "Platform / Page ID",
                access_token_label: "Access Token / API Key",
                how_to: "How to get this?",
                help: "Help",
                authorize: "Authorize",
                loading: "Loading Vault..."
            },
            platforms: {
                instagram: {
                    id_label: "Page ID / Business ID",
                    token_label: "Long-lived Access Token",
                    id_help: "Found in Business Manager > Page Settings > General",
                    token_help: "Generate text token via Graph API Explorer"
                },
                facebook: {
                    id_label: "Page ID",
                    token_label: "Page Access Token",
                    id_help: "Go to your Page > About > transparency",
                    token_help: "Requires pages_manage_posts permission"
                },
                linkedin: {
                    id_label: "Organization URN (numbers only)",
                    token_label: "OAuth 2.0 Access Token",
                    id_help: "Check URL when logged as admin: /company/[12345]",
                    token_help: "Valid for 60 days standard"
                },
                twitter: {
                    id_label: "API Key",
                    token_label: "API Secret Key",
                    id_help: "Developer Portal > Projects > Keys and Tokens",
                    token_help: "Keep this secret!"
                },
                tiktok: {
                    id_label: "Client Key",
                    token_label: "Client Secret",
                    id_help: "TikTok for Developers > My Apps",
                    token_help: "Used for Oauth handshake"
                }
            }
        },
        new_campaign: {
            title: "Design New Campaign",
            subtitle: "Define the strategy and visual direction for this batch of content.",
            back: "Back to Project",
            strategy_level: "Strategy Level",
            visual_level: "Visual Identity",
            form: {
                name_label: "Campaign Name",
                name_placeholder: "e.g. Summer Launch 2024",
                duration_label: "Campaign Duration",
                objective_label: "Strategic Objective",
                objective_placeholder: "e.g. Generate Leads, Brand Education",
                framework_label: "Marketing Framework",
                cta_label: "Main CTA",
                cta_placeholder: "Select or type CTA...",
                pillars_label: "Content Pillars",
                pillars_placeholder: "Select or type a pillar...",
                add_pillar: "Add",
                copy_instructions_label: "Custom Copywriting Instructions (Master Prompt)",
                copy_instructions_placeholder: "e.g. Always start with a provocative question. Focus on benefit X over feature Y. Use emojis only at the end.",
                visual_style_label: "Visual Style",
                mood_label: "Mood / Vibe",
                mood_placeholder: "Select or type Mood...",
                palette_label: "Color Palette",
                palette_placeholder: "Select or type Palette...",
                visual_instructions_label: "Custom Visual Artist Instructions (Master Prompt)",
                visual_instructions_placeholder: "e.g. Figures should be silhouettes. Lighting should be dramatic chiaroscuro. All backgrounds must be pure white.",
                submit_button: "Save Campaign Strategy",
                submitting: "Creating Strategy...",
                uses_strategy: "Uses strategy:"
            },
            options: {
                duration: {
                    monthly: "Monthly (30 days)",
                    quarterly: "Quarterly (90 days)",
                    annual: "Annual (365 days)"
                }
            },
            wizard: {
                steps: {
                    context: "Market Context",
                    insights: "AI Insights",
                    strategy: "Core Strategy",
                    content: "Content Foundations",
                    visual: "Visual Identity"
                },
                market: {
                    intel_title: "1. Market Intel",
                    intel_subtitle: "Define the core problem and topic",
                    topic_label: "Campaign Topic",
                    orientation_label: "Target Orientation",
                    problem_label: "Problem Solved",
                    topic_placeholder: "e.g. Sustainable Fashion",
                    orientation_placeholder: "e.g. Eco-conscious Gen Z",
                    problem_placeholder: "e.g. Finding affordable eco-clothes",
                    differential_label: "Campaign USP / Differential",
                    differential_placeholder: "e.g. 100% compostable packaging",
                    analyze_button: "Analyze Market",
                    analyzing: "Analyzing...",
                    insights: {
                        analyzing: "Analyzing Market Intelligence...",
                        failed: "Analysis Failed",
                        viral_potential: "Viral Potential",
                        score: "Score",
                        niche_gap: "Niche Gap",
                        top_hook: "Top Hook",
                        hooks: "Viral Hooks",
                        patterns: "Effective Patterns",
                        seo_title: "SEO Intelligence",
                        authority_title: "Niche Authority",
                        gap_label: "Identified Content Gap",
                        auth_keywords: "Authority Keywords",
                        generate_instructions: "Generate AI Prompt"
                    }
                },
                nav: {
                    next: "Next Step",
                    back: "Previous",
                    create: "Create Campaign"
                },
                help: {
                    topic: {
                        description: "What is your campaign about? Focus on the main theme, product or service you are promoting.",
                        examples: "Digital Marketing Course, Sustainable Sneakers, Vegan Restaurant launch."
                    },
                    orientation: {
                        description: "Who are you talking to? Define your target audience characteristics.",
                        examples: "Eco-conscious Gen Z, Small business owners in NY, Stay-at-home parents."
                    },
                    problem: {
                        description: "What specific pain point or desire does this campaign address?",
                        examples: "Lack of time for cooking, high cost of electricity, difficulty finding reliable freelancers."
                    },
                    differential: {
                        description: "Why should they choose you specifically for this offer?",
                        examples: "Free shipping, 24/7 support, Proprietary AI technology"
                    },
                    name: {
                        description: "Internal name for managing your campaigns in the dashboard.",
                        examples: "Summer Launch 2024, Q3 Flash Sale, Branding Campaign V2."
                    },
                    duration: {
                        description: "How long will this content be distributed? Helps in planning content volume.",
                        examples: "30 days (standard), 90 days (long term), 365 days (brand presence)."
                    },
                    objective: {
                        description: "What is the primary business goal of this campaign?",
                        examples: "Increase direct sales, build authority, educate new users about a feature."
                    },
                    framework: {
                        description: "The copywriting structure to follow for persuasion.",
                        examples: "AIDA (Attention, Interest, Desire, Action), PAS (Problem, Agitation, Solution)."
                    },
                    cta: {
                        description: "What specific action should the user take after seeing the content?",
                        examples: "Click the link in bio, send a DM for price, register for the free webinar."
                    },
                    pillars: {
                        description: "Sub-topics that form the backbone of your content to ensure variety.",
                        examples: "Behind the scenes, Customer results, Educational tips, Product features."
                    },
                    copy_instructions: {
                        description: "Specific rules for the AI writer regarding tone, style, and structure.",
                        examples: "Use friendly witty tone, don't use emojis, always start with a question."
                    },
                    visual_style: {
                        description: "The artistic direction and atmosphere for generated images.",
                        examples: "Realistic photography, 3D illustration, Minimalist Apple-style."
                    },
                    mood: {
                        description: "The emotional vibe or energy the visuals should transmit.",
                        examples: "Luxury and exclusive, Energetic and fast, Cozy and warm."
                    },
                    palette: {
                        description: "The dominant colors that will define the campaign visual identity.",
                        examples: "Ocean blue and white, Neon cyberpunk, Earthy tones and green."
                    },
                    visual_instructions: {
                        description: "Specific instructions for the AI artist regarding composition and lighting.",
                        examples: "Low angle shots, soft natural lighting, high contrast shadows."
                    }
                }
            }
        },
        userMenu: {
            profile: "Edit Profile",
            logout: "Log Out",
            language: "Language"
        },
        settings: {
            title: "Settings",
            profile_section: "Personal Data",
            full_name: "Full Name",
            job_title: "Job Title",
            save: "Save Changes",
            success: "Profile updated successfully!",
            error: "Error updating profile"
        },
        hero: {
            badge: "AI-Powered Content Revolution",
            title_part1: "Dominate Social",
            title_part2: "with Infinite AI.",
            description: "Create world-class visual content, headlines, and strategies in seconds. The ultimate command center for modern digital creators and agencies.",
            cta_primary: "Start Creating Free",
            cta_secondary: "Sign In",
            social_proof: {
                fastest: "FASTEST GEN",
                secure: "SECURE DATA",
                hd: "HD VISUALS"
            }
        },
        features: {
            badge: "The Future of Content,",
            badge_accent: "Automated.",
            description: "Stop wasting hours on ideation. Let our AI Factory handle the strategy while you focus on the growth.",
            items: [
                {
                    title: "Market Trend Analysis",
                    description: "Stay ahead of the competition with real-time AI analysis of niche trends and high-engagement hooks."
                },
                {
                    title: "Infinite Visual Engine",
                    description: "Generate breathtaking, high-definition images tailored perfectly to your brand identity using Flux Dev."
                },
                {
                    title: "Multi-Platform Strategy",
                    description: "One project, infinite outputs. Automatically adapt your strategy for Instagram, LinkedIn, and more."
                },
                {
                    title: "World-Class Copy",
                    description: "Headlines that convert and body copy that engages, all generated with Gemini 1.5 Flash precision."
                }
            ],
            trusted: "Trusted by 2k+ creators",
            live_data: "Live Data Analysis"
        },
        testimonials: {
            title: "Loved by",
            title_accent: "Power Creators.",
            subtitle: "Join 2,000+ professionals using the factory daily.",
            items: [
                { name: "Alex Rivera", role: "E-comm Founder", content: "The AI Factory changed our workflow completely. We've scaled from 3 to 20 posts a week without hiring." },
                { name: "Sarah Chen", role: "Agency Director", content: "Flux images are indistinguishable from studio shots. Our clients are mind-blown by the quality." },
                { name: "Marco Rossi", role: "SaaS Marketer", content: "Gemini 1.5 hook variety matrix is a game changer for carousel performance. CTR increased by 40%." },
                { name: "Jessica Bloom", role: "Influencer", content: "I finally have a visual identity that feels consistent and premium. This tool is my secret weapon." },
                { name: "Daniel Smith", role: "Content Manager", content: "The multi-language support is flawlessly integrated. Expanding our brand to LATAM was a breeze." },
                { name: "Elena Volkov", role: "Startup CEO", content: "Fastest way to test new visual styles for our brand. Invaluable tool for growth marketing." },
                { name: "Liam O'Connor", role: "Digital Artist", content: "Usually I hate AI art, but the control given here is professional-grade. Love the master instructions." },
                { name: "Sofia Garcia", role: "Brand Strategist", content: "It's not just tools; it's a workflow. The factory logic makes sense for real-world marketing." },
                { name: "Kenji Sato", role: "Social Media Ninja", content: "Hook variety matrix alone is worth the subscription. Never running out of ideas again." },
                { name: "Amara Okoro", role: "Creative Lead", content: "Transparent, fast, and beautiful. The UI is a joy to work in every single day." },
            ]
        },
        cta: {
            title: "Ready to",
            title_accent: "Scale?",
            description: "Join the elite creators who have automated their entire content production cycle. Secure your spot in the factory today.",
            button: "CREATE YOUR FACTORY"
        },
        footer: {
            rights: "All rights reserved."
        },
        terms: {
            title: "Terms of Service",
            updated: "Last Updated: Dec 2025",
            sections: [
                {
                    title: "1. Data Ownership",
                    content: "All content generated by our AI engines remains the intellectual property of the user. We do not claim ownership of any visual or textual outputs created within your factory workspace."
                },
                {
                    title: "2. Prohibited Content",
                    content: "Users are strictly prohibited from generating illegal, harmful, or sexually explicit content. Violation of these terms will result in immediate and permanent account suspension."
                },
                {
                    title: "3. AI Usage Limits",
                    content: "Fair use policies apply to generation tokens. Automated scraping or botting of our AI endpoints is strictly monitored and blocked."
                }
            ],
            disclaimer: "By using the AI Content Factory, you agree to comply with our global safety standards and those of our engine providers (Google Gemini & Fal.ai).",
            button: "I AGREE & UNDERSTAND"
        },
        dashboard: {
            title: "Command Center",
            subtitle: "Welcome back, Strategist. Here is your portfolio overview.",
            new_project: "New Project",
            recent_activity: "Recent Activity",
            no_projects: "No projects yet. Start by creating one!",
            create_first: "Create First Project",
            active: "Active",
            stats: {
                active_projects: "Active Projects",
                content_pieces: "Content Pieces",
                avg_engagement: "Avg. Engagement",
                live_data: "Live data"
            },
            edit_details: "Edit Details",
            new_campaign: "New Campaign",
            active_campaigns: "Active Campaigns",
            content_queue: "Content Queue",
            queue_desc: "Review, refine, and publish your generated content",
            auto_fill: "Auto-Fill Schedule",
            no_results: "No content matches your filters.",
            clear_filters: "Clear all filters"
        },
        projects: {
            title: "All Projects",
            subtitle: "Manage your portfolio of automated content apps.",
            create_new: "Create New Project",
            no_projects: "No projects yet",
            no_projects_desc: "Start by creating your first AI-driven content project.",
            create_project: "Create Project",
            manage_content: "Manage Content",
            active: "Active",
            edit_title: "Edit Company Identity",
            initialize_title: "Initialize Your App",
            initialize_desc: "Define the core business identity that will power your AI content strategy.",
            foundation_title: "Company Foundation",
            foundation_desc: "Update the strategic foundation used by the AI engine.",
            name_label: "Company Name",
            niche_label: "Niche / Industry",
            offering_label: "Offering (Simple phrase)",
            usp_label: "Key Differential (USP)",
            problem_label: "Problem Solved",
            audience_label: "Target Audience",
            voice_label: "Brand Voice",
            save_changes: "Save Changes",
            saving: "Saving...",
            back_to_dashboard: "Back to Dashboard",
            back_to_project: "Back to Project",
            loading_details: "Loading company details...",
            create_company: "Create Company",
            initializing: "Initializing..."
        },
        campaigns: {
            title: "Active Campaigns",
            new_campaign: "New Campaign",
            empty_title: "No Active Campaigns",
            empty_desc: "Create a campaign to define your content strategy.",
            edit_campaign: "Edit Campaign",
            quick_generate: "Quick Generate",
            cta_label: "CTA",
            generate_title: "Generar Contenido",
            start_generation: "Start Generation",
            processing: "Processing...",
            social_post: "Social Post",
            reel_script: "Reel Script",
            blog_article: "Blog Article",
            push_notification: "Push Notification",
            content_type: "Content Type",
            quantity: "Quantity",
            items_count: "items",
            english: "ENGLISH 🇺🇸",
            spanish: "ESPAÑOL 🇪🇸",
            engine_label: "Engine",
            preview_logic: "Preview Full Logic",
            save_config: "Save Configuration",
            generation_hub: "GENERATION HUB",
            advanced_settings: "ADVANCED VISUAL SETTINGS",
            format_label: "Format",
            aesthetic_style: "Aesthetic Style",
            quality_label: "Inference Quality",
            assets_title: "CAMPAIGN ASSETS",
            visual_dna: "VISUAL DNA",
            base_style: "Base Style",
            mood_label: "Mood / Vibe",
            palette_label: "Color Palette",
            voice_label: "Brand Voice",
            voice_placeholder: "Select or type a custom brand voice...",
            save_success: "Campaign configuration saved successfully!",
            ready_activation: "Ready for Activation",
            ready_activation_desc: "Select content type and quantity above to populate this campaign.",
            inspecting_logic: "Inspecting live logic for",
            system_role: "SYSTEM ROLE",
            business_context: "BUSINESS CONTEXT (PROJECT)",
            master_directives: "CAMPAIGN MASTER DIRECTIVES",
            marketing_framework: "MARKETING FRAMEWORK",
            language: "Language",
            strategy_brainstorm: "STRATEGY BRAINSTORM",
            brainstorm_desc: "Generate 10 fresh ideas based on your recent performance.",
            generate_ideas: "Generate New Ideas",
            select_idea: "Select this Idea",
            ideas_ready: "Choose an idea to start your next generation",
            no_ideas: "No ideas generated yet. Start brainstorming!",
            applying_idea: "Applying idea to directives...",
            visual_impl: "Visual implementation for",
            concept_desc: "Recommended concept",
            headline_examples: "Headline Examples",
            image_text_options: "Image Text Options",
            download_image: "Download Image",
            copy_text: "Copy Post Text",
            visual_engine: "Visual Engine",
            gemini_engine: "Gemini 2.0 (Imagen 3)",
            fal_engine: "FAL.ai (Flux.1 Dev)",
            text_copied: "Copied",
            no_text_label: "Clean Image (No text)",
            post: "Post",
            reels: "Reels",
            story: "Story",
            video: "Video",
            landscape: "Landscape",
            article: "Article",
            carrusel: "Carousel"
        },
        sidebar: {
            platform: "Platform",
            active_apps: "Active Apps",
            tokens_used: "Tokens Used",
            logout: "Log Out",
            logging_out: "Logging out..."
        },
        common: {
            loading: "Loading...",
            edit: "Edit",
            delete: "Delete",
            save: "Save",
            cancel: "Cancel",
            publish: "Publish",
            download: "Download",
            copy: "Copy",
            error: "Error",
            all: "All",
            search: "Search...",
            no_data: "No items found",
            filter_campaign: "Filter by Campaign",
            filter_month: "Filter by Month",
            success: "Success"
        },
        premium_forge: {
            badge: "Standard Subscription Required",
            title_forge: "PREMIUM FORGE",
            description: "Transform single ideas into high-authority long-form assets. Generate complex eBooks, professional whitepapers, and giant SEO blogs with deep context.",
            cta_start: "START NEW FORGE",
            select_type: "Select Type",
            types: {
                ebook: { title: "eBook / High-Value Guide", desc: "Multi-chapter sequential generation." },
                blog: { title: "Deep-Dive Article", desc: "2000+ words SEO-optimized piece." },
                whitepaper: { title: "Whitepaper / Tech Note", desc: "Concise, data-driven professional layout." }
            },
            recent_productions: "RECENT PRODUCTIONS",
            no_projects: "No premium projects found.",
            initialize_first: "+ Initialise First Project",
            modal: {
                title: "FORGE NEW ASSET",
                context_project: "Context Project",
                main_topic: "Main Topic or Title",
                placeholder: "e.g. The Ultimate Guide to AI Automation for Agencies",
                initializing: "Initialising Logic...",
                create: "Create Outline & Initialise"
            },
            detail: {
                loading: "Heavy Loading...",
                not_found: "404: FORGE NOT FOUND",
                back: "Back to Forge",
                context: "Context",
                generating_all: "Generating Sequential Flow...",
                generate_all: "Generate All Chapters",
                chapters: "CHAPTERS",
                status: {
                    completed: "Completed",
                    generating: "Generating",
                    error: "Error",
                    pending: "Pending"
                },
                active_theme: "Active Theme",
                pdf_export: "PDF EXPORT",
                weaving: "Weaving the Blueprint...",
                weaving_desc: "Generating Content & Stitching Artwork",
                select_preview: "Select a completed chapter to preview",
                start_generation: "Start Generation"
            }
        }
    },
    es: {
        nav: {
            features: "Funcionalidades",
            testimonials: "Casos de Éxito",
            terms: "Términos",
            login: "Ingresar",
            join: "Únete Ahora",
            dashboard: "Dashboard",
            projects: "Proyectos",
            settings: "Configuración",
            premium_forge: "Premium Forge",
            new_campaign: "Diseñar Campaña",
            social_hub: "Social Hub",
            vault: "Vault de Seguridad"
        },
        connections: {
            title: "Conexiones del Proyecto",
            subtitle: "Gestiona tus credenciales sociales y configuraciones de seguridad.",
            disconnected: "Desconectado",
            no_account: "Sin cuenta vinculada",
            test_bridge: "Probar Conexión",
            connect_account: "Conectar Cuenta",
            safety_zones_title: "Zonas de Seguridad",
            safety_zones_desc: "Define áreas de protección para tu marca. La IA respetará estas zonas para evitar solapamientos con elementos de interfaz.",
            bottom_clearance: "Margen Inferior (UI)",
            top_clearance: "Área Superior (Logo)",
            side_clearance: "Márgenes Laterales",
            apply_context: "Aplicar Contexto Global",
            encryption_notice: "Todas las credenciales se cifran del lado del cliente y se guardan en nuestra bóveda segura. Nunca almacenamos tokens en texto plano.",
            modal: {
                sync: "Sincronizar",
                handshake: "Enlace Seguro",
                account_label: "Nombre de Cuenta / Usuario",
                account_placeholder: "@tu_marca",
                platform_id_label: "ID de Plataforma / Página",
                access_token_label: "Token de Acceso / API Key",
                how_to: "¿Cómo obtener esto?",
                help: "Ayuda",
                authorize: "Autorizar",
                loading: "Cargando Bóveda..."
            },
            platforms: {
                instagram: {
                    id_label: "ID de Página / Business ID",
                    token_label: "Token de Acceso (Long-lived)",
                    id_help: "En Business Manager > Configuración de Página > General",
                    token_help: "Generar token de texto vía Graph API Explorer"
                },
                facebook: {
                    id_label: "ID de Página",
                    token_label: "Token de Acceso de Página",
                    id_help: "Ir a tu Página > Información > Transparencia",
                    token_help: "Requiere permiso pages_manage_posts"
                },
                linkedin: {
                    id_label: "URN de Organización (solo números)",
                    token_label: "Token de Acceso OAuth 2.0",
                    id_help: "Ver URL al entrar como admin: /company/[12345]",
                    token_help: "Válido por 60 días estándar"
                },
                twitter: {
                    id_label: "API Key",
                    token_label: "API Secret Key",
                    id_help: "Developer Portal > Projects > Keys and Tokens",
                    token_help: "¡Mantén esto en secreto!"
                },
                tiktok: {
                    id_label: "Client Key",
                    token_label: "Client Secret",
                    id_help: "TikTok for Developers > My Apps",
                    token_help: "Usado para el handshake Oauth"
                }
            }
        },
        new_campaign: {
            title: "Diseñar Nueva Campaña",
            subtitle: "Define la estrategia y dirección visual para este lote de contenido.",
            back: "Volver al Proyecto",
            strategy_level: "Nivel Estratégico",
            visual_level: "Identidad Visual",
            form: {
                name_label: "Nombre de la Campaña",
                name_placeholder: "ej. Lanzamiento de Verano 2024",
                duration_label: "Duración de la Campaña",
                objective_label: "Objetivo Estratégico",
                objective_placeholder: "ej. Generar Leads, Educación de Marca",
                framework_label: "Framework de Marketing",
                cta_label: "CTA Principal",
                cta_placeholder: "Selecciona o escribe un CTA...",
                pillars_label: "Pilares de Contenido",
                pillars_placeholder: "Selecciona o escribe un pilar...",
                add_pillar: "Agregar",
                copy_instructions_label: "Instrucciones de Copywriting (Prompt Maestro)",
                copy_instructions_placeholder: "ej. Siempre empieza con una pregunta provocativa. Enfócate en el beneficio X sobre la característica Y. Usa emojis solo al final.",
                visual_style_label: "Estilo Visual",
                mood_label: "Mood / Vibra",
                mood_placeholder: "Selecciona o escribe el Mood...",
                palette_label: "Paleta de Colores",
                palette_placeholder: "Selecciona o escribe la Paleta...",
                visual_instructions_label: "Instrucciones Visuales (Prompt Maestro)",
                visual_instructions_placeholder: "ej. Las figuras deben ser siluetas. Iluminación dramática claroscuro. Todos los fondos deben ser blanco puro.",
                submit_button: "Guardar Estrategia",
                submitting: "Creando Estrategia...",
                uses_strategy: "Usa estrategia:"
            },
            options: {
                duration: {
                    monthly: "Mensual (30 días)",
                    quarterly: "Trimestral (90 días)",
                    annual: "Anual (365 días)"
                }
            },
            wizard: {
                steps: {
                    context: "Contexto de Mercado",
                    insights: "Inteligencia IA",
                    strategy: "Estrategia Base",
                    content: "Cimientos de Contenido",
                    visual: "Identidad Visual"
                },
                market: {
                    intel_title: "1. Contexto Inicial",
                    intel_subtitle: "Define el problema central y tema",
                    topic_label: "Tema de la Campaña",
                    orientation_label: "Orientación del Target",
                    problem_label: "Problema Resuelto",
                    topic_placeholder: "ej. Moda Sostenible",
                    orientation_placeholder: "ej. Gen Z eco-consciente",
                    problem_placeholder: "ej. Encontrar ropa eco económica",
                    differential_label: "USP / Diferencial de Campaña",
                    differential_placeholder: "ej. Packaging 100% compostable",
                    analyze_button: "Analizar Mercado",
                    analyzing: "Analizando...",
                    insights: {
                        analyzing: "Analizando Inteligencia de Mercado...",
                        failed: "Análisis Fallido",
                        viral_potential: "Potencial Viral",
                        score: "Puntaje",
                        niche_gap: "Brecha de Nicho",
                        top_hook: "Hook Principal",
                        hooks: "Hooks Virales",
                        patterns: "Patrones Efectivos",
                        seo_title: "Inteligencia SEO",
                        authority_title: "Autoridad de Nicho",
                        gap_label: "Brecha de Contenido Identificada",
                        auth_keywords: "Keywords de Autoridad",
                        generate_instructions: "Asistente IA"
                    }
                },
                nav: {
                    next: "Siguiente",
                    back: "Anterior",
                    create: "Crear Campaña"
                },
                help: {
                    topic: {
                        description: "¿De qué trata tu campaña? Define el tema central, producto o servicio que promocionas.",
                        examples: "Curso de Marketing Digital, Zapatillas Sustentables, Lanzamiento de Restaurante Vegan."
                    },
                    orientation: {
                        description: "¿A quién le hablas? Define las características de tu audiencia objetivo.",
                        examples: "Gen Z eco-consciente, Dueños de pequeñas empresas en NY, Padres que trabajan desde casa."
                    },
                    problem: {
                        description: "¿Qué problema específico o deseo resuelve esta campaña?",
                        examples: "Falta de tiempo para cocinar, alto costo de electricidad, dificultad para hallar freelancers confiables."
                    },
                    differential: {
                        description: "¿Por qué deberían elegirte a ti específicamente para esta oferta?",
                        examples: "Envío gratis, soporte 24/7, tecnología IA propia."
                    },
                    name: {
                        description: "Nombre interno para organizar tus campañas en el panel de control.",
                        examples: "Lanzamiento Verano 2024, Oferta Flash Q3, Campaña Branding V2."
                    },
                    duration: {
                        description: "¿Cuánto tiempo durará la distribución? Ayuda a planificar el volumen de contenido.",
                        examples: "30 días (estándar), 90 días (largo plazo), 365 días (presencia de marca)."
                    },
                    objective: {
                        description: "¿Cuál es la meta comercial principal de esta campaña?",
                        examples: "Aumentar ventas directas, construir autoridad, educar sobre una nueva función."
                    },
                    framework: {
                        description: "La estructura de redacción persuasiva a seguir.",
                        examples: "AIDA (Atención, Interés, Deseo, Acción), PAS (Problema, Agitación, Solución)."
                    },
                    cta: {
                        description: "¿Qué acción específica debe tomar el usuario al ver el contenido?",
                        examples: "Click en link de biografía, enviar DM para precio, registrarse al webinar gratuito."
                    },
                    pillars: {
                        description: "Sub-temas que forman la base de tu contenido para asegurar variedad.",
                        examples: "Detrás de escena, Resultados de clientes, Tips educativos, Funciones del producto."
                    },
                    copy_instructions: {
                        description: "Reglas específicas para el escritor IA sobre tono, estilo y estructura.",
                        examples: "Usa un tono amigable e ingenioso, no uses emojis, siempre comienza con una pregunta."
                    },
                    visual_style: {
                        description: "La dirección artística y atmósfera para las imágenes generadas.",
                        examples: "Fotografía realista, ilustración 3D, estilo minimalista tipo Apple."
                    },
                    mood: {
                        description: "La vibra emocional o energía que los visuales deben transmitir.",
                        examples: "Lujo y exclusividad, Enérgico y rápido, Acogedor y cálido."
                    },
                    palette: {
                        description: "Los colores dominantes que definirán la identidad visual de la campaña.",
                        examples: "Azul océano y blanco, Cyberpunk neón, Tonos tierra y verde."
                    },
                    visual_instructions: {
                        description: "Instrucciones específicas para el artista IA sobre composición e iluminación.",
                        examples: "Tomas de ángulo bajo, luz natural suave, sombras de alto contraste."
                    }
                }
            }
        },
        userMenu: {
            profile: "Editar Perfil",
            logout: "Cerrar Sesión",
            language: "Idioma"
        },
        settings: {
            title: "Configuración",
            profile_section: "Datos Personales",
            full_name: "Nombre Completo",
            job_title: "Cargo / Ocupación",
            save: "Guardar Cambios",
            success: "Perfil actualizado con éxito!",
            error: "Error al actualizar el perfil"
        },
        hero: {
            badge: "Revolución de Contenido con IA",
            title_part1: "Domina tus Redes",
            title_part2: "con IA Infinita.",
            description: "Crea contenido visual de clase mundial, titulares y estrategias en segundos. El centro de comando definitivo para creadores digitales y agencias modernas.",
            cta_primary: "Empieza Gratis Ahora",
            cta_secondary: "Ingresar",
            social_proof: {
                fastest: "GEN MÁXIMA VELOCIDAD",
                secure: "DATOS SEGUROS",
                hd: "VISUALES HD"
            }
        },
        features: {
            badge: "El Futuro del Contenido,",
            badge_accent: "Automatizado.",
            description: "Deja de perder horas ideando. Permite que nuestra Fábrica IA maneje la estrategia mientras tú te enfocas en crecer.",
            items: [
                {
                    title: "Análisis de Tendencias",
                    description: "Mantente por delante de la competencia con análisis de IA en tiempo real sobre nichos y ganchos de alto engagement."
                },
                {
                    title: "Motor Visual Infinito",
                    description: "Genera imágenes impresionantes en alta definición adaptadas perfectamente a la identidad de tu marca usando Flux Dev."
                },
                {
                    title: "Estrategia Multi-Plataforma",
                    description: "Un proyecto, infinitas salidas. Adapta automáticamente tu estrategia para Instagram, LinkedIn y más."
                },
                {
                    title: "Copy de Clase Mundial",
                    description: "Titulares que convierten y textos que enganchan, todo generado con la precisión de Gemini 1.5 Flash."
                }
            ],
            trusted: "Confiado por +2k creadores",
            live_data: "Análisis de Datos en Vivo"
        },
        testimonials: {
            title: "Amado por",
            title_accent: "Creadores Pro.",
            subtitle: "Únete a más de 2,000 profesionales que usan la fábrica a diario.",
            items: [
                { name: "Alex Rivera", role: "Fundador E-comm", content: "La Fábrica IA cambió nuestro flujo de trabajo por completo. Escalamos de 3 a 20 posts por semana sin contratar." },
                { name: "Sarah Chen", role: "Directora de Agencia", content: "Las imágenes de Flux son indistinguibles de fotos de estudio. Nuestros clientes están asombrados." },
                { name: "Marco Rossi", role: "Marketer SaaS", content: "La matriz de ganchos de Gemini 1.5 cambió el juego. El CTR aumentó en un 40%." },
                { name: "Jessica Bloom", role: "Influencer", content: "Finalmente tengo una identidad visual que se siente consistente y premium. Esta herramienta es mi arma secreta." },
                { name: "Daniel Smith", role: "Content Manager", content: "El soporte multi-idioma está integrado perfectamente. Expandir nuestra marca a LATAM fue muy fácil." },
                { name: "Elena Volkov", role: "Startup CEO", content: "La forma más rápida de probar nuevos estilos visuales. Herramienta invaluable para marketing de crecimiento." },
                { name: "Liam O'Connor", role: "Artista Digital", content: "Usualmente odio el arte por IA, pero el control que da es profesional. Amo las instrucciones maestras." },
                { name: "Sofia Garcia", role: "Estratega de Marca", content: "No son solo herramientas; es un flujo. La lógica de la fábrica tiene sentido para el marketing real." },
                { name: "Kenji Sato", role: "Ninja de Redes", content: "Solo la matriz de ganchos vale la suscripción. Nunca más me quedo sin ideas." },
                { name: "Amara Okoro", role: "Directora Creativa", content: "Transparente, rápido y hermoso. La interfaz es un placer para trabajar cada día." },
            ]
        },
        cta: {
            title: "Listo para",
            title_accent: "Escalar?",
            description: "Únete a los creadores de élite que han automatizado su ciclo completo de producción de contenido. Asegura tu lugar hoy.",
            button: "CREA TU FÁBRICA"
        },
        footer: {
            rights: "Todos los derechos reservados."
        },
        terms: {
            title: "Términos de Servicio",
            updated: "Última actualización: Dic 2025",
            sections: [
                {
                    title: "1. Propiedad de los Datos",
                    content: "Todo el contenido generado por nuestros motores de IA sigue siendo propiedad intelectual del usuario. No reclamamos la propiedad de ninguna salida visual o textual."
                },
                {
                    title: "2. Contenido Prohibido",
                    content: "Los usuarios tienen estrictamente prohibido generar contenido ilegal, dañino o sexualmente explícito. La violación resultará en suspensión permanente."
                },
                {
                    title: "3. Límites de Uso de IA",
                    content: "Se aplican políticas de uso justo a los tokens de generación. El scraping automatizado o bots están estrictamente prohibidos."
                }
            ],
            disclaimer: "Al usar la Fábrica de Contenido IA, aceptas cumplir con nuestros estándares globales de seguridad y los de nuestros proveedores (Google Gemini & Fal.ai).",
            button: "ACEPTO Y ENTIENDO"
        },
        dashboard: {
            title: "Centro de Mando",
            subtitle: "Bienvenido de nuevo, Estratega. Aquí tienes tu portafolio.",
            new_project: "Nuevo Proyecto",
            recent_activity: "Actividad Reciente",
            no_projects: "Sin proyectos aún. ¡Empieza creando uno!",
            create_first: "Crear Primer Proyecto",
            active: "Activo",
            stats: {
                active_projects: "Proyectos Activos",
                content_pieces: "Piezas de Contenido",
                avg_engagement: "Engagement Promedio",
                live_data: "Datos en vivo"
            },
            edit_details: "Editar Detalles",
            new_campaign: "Nueva Campaña",
            active_campaigns: "Campañas Activas",
            content_queue: "Cola de Contenido",
            queue_desc: "Revisa, perfecciona y publica tu contenido generado",
            auto_fill: "Autoprogramar",
            no_results: "No hay contenido que coincida con los filtros.",
            clear_filters: "Limpiar todos los filtros"
        },
        projects: {
            title: "Todos los Proyectos",
            subtitle: "Gestiona tu portafolio de aplicaciones de contenido.",
            create_new: "Crear Nuevo Proyecto",
            no_projects: "Sin proyectos aún",
            no_projects_desc: "Empieza creando tu primer proyecto de contenido IA.",
            create_project: "Crear Proyecto",
            manage_content: "Gestionar Contenido",
            active: "Activo",
            edit_title: "Editar Identidad de la Empresa",
            initialize_title: "Inicializa tu App",
            initialize_desc: "Define la identidad central de negocio que potenciará tu estrategia de contenido IA.",
            foundation_title: "Cimientos de la Empresa",
            foundation_desc: "Actualiza la base estratégica utilizada por el motor de IA.",
            name_label: "Nombre de la Empresa",
            niche_label: "Niche / Industria",
            offering_label: "Propuesta (Frase simple)",
            usp_label: "Diferencial Clave (USP)",
            problem_label: "Problema que Resuelve",
            audience_label: "Audiencia Objetivo",
            voice_label: "Voz de Marca",
            save_changes: "Guardar Cambios",
            saving: "Guardando...",
            back_to_dashboard: "Volver al Dashboard",
            back_to_project: "Volver al Proyecto",
            loading_details: "Cargando detalles de la empresa...",
            create_company: "Crear Empresa",
            initializing: "Inicializando..."
        },
        campaigns: {
            title: "Campañas Activas",
            new_campaign: "Nueva Campaña",
            empty_title: "Sin Campañas Activas",
            empty_desc: "Crea una campaña para definir tu estrategia de contenido.",
            edit_campaign: "Editar Campaña",
            quick_generate: "Generación Rápida",
            cta_label: "CTA",
            generate_title: "Generar Contenido",
            start_generation: "Comenzar Generación",
            processing: "Procesando...",
            social_post: "Post de Redes",
            reel_script: "Guión de Reel",
            blog_article: "Artículo de Blog",
            push_notification: "Notificación Push",
            content_type: "Tipo de Contenido",
            quantity: "Cantidad",
            items_count: "items",
            english: "INGLÉS 🇺🇸",
            spanish: "ESPAÑOL 🇪🇸",
            engine_label: "Motor",
            preview_logic: "Ver Lógica Completa",
            save_config: "Guardar Configuración",
            generation_hub: "CENTRO DE GENERACIÓN",
            advanced_settings: "AJUSTES VISUALES AVANZADOS",
            format_label: "Formato",
            aesthetic_style: "Estilo Estético",
            quality_label: "Calidad de Inferencia",
            assets_title: "RECURSOS DE CAMPAÑA",
            visual_dna: "ADN VISUAL",
            base_style: "Estilo Base",
            mood_label: "Mood / Vibe",
            palette_label: "Paleta de Colores",
            voice_label: "Voz de Marca",
            voice_placeholder: "Selecciona o escribe el tono de voz...",
            save_success: "¡Configuración de campaña guardada con éxito!",
            ready_activation: "Listo para Activación",
            ready_activation_desc: "Selecciona tipo y cantidad arriba para poblar esta campaña.",
            inspecting_logic: "Inspeccionando lógica en vivo para",
            system_role: "ROL DEL SISTEMA",
            business_context: "CONTEXTO DE NEGOCIO (PROYECTO)",
            master_directives: "DIRECTIVAS MAESTRAS DE CAMPAÑA",
            marketing_framework: "FRAMEWORK DE MARKETING",
            language: "Idioma",
            strategy_brainstorm: "LLUVIA DE IDEAS ESTRATÉGICA",
            brainstorm_desc: "Genera 10 ideas frescas basadas en tu rendimiento reciente.",
            generate_ideas: "Generar Nuevas Ideas",
            select_idea: "Seleccionar esta Idea",
            ideas_ready: "Elige una idea para comenzar tu próxima generación",
            no_ideas: "Aún no hay ideas generadas. ¡Comienza la lluvia de ideas!",
            applying_idea: "Aplicando idea a las directivas...",
            visual_impl: "Implementación visual para",
            concept_desc: "Concepto recomendado",
            headline_examples: "Ejemplos de Títulos",
            image_text_options: "Textos para la Imagen",
            download_image: "Descargar Imagen",
            copy_text: "Copiar Texto",
            visual_engine: "Motor Visual",
            gemini_engine: "Gemini 2.0 (Imagen 3)",
            fal_engine: "FAL.ai (Flux.1 Dev)",
            text_copied: "Copiado",
            no_text_label: "Imagen Limpia (Sin texto)",
            post: "Post",
            reels: "Reels",
            story: "Story",
            video: "Video",
            landscape: "Horizontal",
            article: "Artículo",
            carrusel: "Carrusel de Imágenes"
        },
        sidebar: {
            platform: "Plataforma",
            active_apps: "Apps Activas",
            tokens_used: "Tokens Usados",
            logout: "Cerrar Sesión",
            logging_out: "Cerrando sesión..."
        },
        common: {
            loading: "Cargando...",
            edit: "Editar",
            delete: "Eliminar",
            save: "Guardar",
            cancel: "Cancelar",
            publish: "Publicar",
            download: "Descargar",
            copy: "Copiar",
            error: "Error",
            all: "Todo",
            search: "Buscar...",
            no_data: "No hay datos",
            filter_campaign: "Filtrar por Campaña",
            filter_month: "Filtrar por Mes",
            success: "Éxito"
        },
        premium_forge: {
            badge: "Suscripción Estándar Requerida",
            title_forge: "PREMIUM FORGE",
            description: "Transforma ideas simples en activos de largo formato con alta autoridad. Genera eBooks complejos, whitepapers profesionales y blogs SEO gigantes con contexto profundo.",
            cta_start: "INICIAR NUEVA FORJA",
            select_type: "Seleccionar Tipo",
            types: {
                ebook: { title: "eBook / Guía de Alto Valor", desc: "Generación secuencial multi-capítulo." },
                blog: { title: "Artículo de Investigación", desc: "Pieza de +2000 palabras optimizada para SEO." },
                whitepaper: { title: "Whitepaper / Nota Técnica", desc: "Diseño profesional conciso y basado en datos." }
            },
            recent_productions: "PRODUCCIONES RECIENTES",
            no_projects: "No se encontraron proyectos premium.",
            initialize_first: "+ Inicializar Primer Proyecto",
            modal: {
                title: "FORJAR NUEVO ACTIVO",
                context_project: "Proyecto de Contexto",
                main_topic: "Tema Principal o Título",
                placeholder: "ej. La Guía Definitiva de Automatización IA para Agencias",
                initializing: "Inicializando Lógica...",
                create: "Crear Índice e Inicializar"
            },
            detail: {
                loading: "Carga Pesada...",
                not_found: "404: FORJA NO ENCONTRADA",
                back: "Volver a la Forja",
                context: "Contexto",
                generating_all: "Generando Flujo Secuencial...",
                generate_all: "Generar Todos los Capítulos",
                chapters: "CAPÍTULOS",
                status: {
                    completed: "Completado",
                    generating: "Generando",
                    error: "Error",
                    pending: "Pendiente"
                },
                active_theme: "Tema Activo",
                pdf_export: "EXPORTAR PDF",
                weaving: "Tejiendo el Plano...",
                weaving_desc: "Generando Contenido y Uniendo Arte",
                select_preview: "Selecciona un capítulo completado para previsualizar",
                start_generation: "Comenzar Generación"
            }
        }
    }
}
