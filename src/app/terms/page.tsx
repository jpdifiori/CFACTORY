
import React from 'react';
import Link from 'next/link';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-primary/30">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-white mb-12 transition-colors">
                    ← Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Terms of Service</h1>
                <p className="text-gray-500 mb-12">Last Updated: January 7, 2026</p>

                <div className="space-y-12 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Cfabric (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                        <p>
                            Cfabric provides AI-powered content generation and management tools for social media marketing. We reserve the right to modify, suspend, or discontinue any part of the Service at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. User Account</h2>
                        <p>
                            You are responsible for maintaining the security of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Content and Conduct</h2>
                        <p>
                            You retain ownership of the content you generate using Cfabric. However, you grant us a license to process your content for the purpose of providing the Service. You agree not to use the Service to generate illegal, harmful, or offensive content.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Social Media Integrations</h2>
                        <p>
                            Our Service integrates with third-party platforms like Instagram and TikTok using their official APIs. By connecting your accounts, you agree to comply with their respective Terms of Service and Community Guidelines.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
                        <p>
                            Cfabric is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Contact</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at support@cfabric.app.
                        </p>
                    </section>
                </div>

                <div className="mt-24 pt-12 border-t border-white/10 text-center text-gray-600 text-sm">
                    &copy; {new Date().getFullYear()} Cfabric. All rights reserved.
                </div>
            </div>
        </div>
    );
}
