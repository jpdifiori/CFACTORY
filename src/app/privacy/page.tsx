
import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[#050505] text-gray-300 font-sans selection:bg-primary/30">
            <div className="max-w-4xl mx-auto px-6 py-24">
                <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-white mb-12 transition-colors">
                    ← Back to Home
                </Link>

                <h1 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Privacy Policy</h1>
                <p className="text-gray-500 mb-12">Last Updated: January 7, 2026</p>

                <div className="space-y-12 text-lg leading-relaxed">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as your name, email address, and payment information when you register for an account. We also collect data related to your usage of our AI generation tools.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">2. Social Media Data</h2>
                        <p>
                            When you connect your social media accounts (e.g., Instagram, TikTok), we access restricted data as permitted by their APIs. This may include your profile name, avatar, and account statistics. We <strong>do not</strong> store your passwords. Access tokens are encrypted securely.
                        </p>
                        <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-400">
                            <li><strong>Instagram/Facebook:</strong> Used for publishing content and page insights.</li>
                            <li><strong>TikTok:</strong> Used for publishing videos and retrieving basic profile info.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
                        <p>
                            We use your information to operate, maintain, and improve our Service, to process your transactions, and to communicate with you. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
                        <p>
                            We implement industry-standard security measures to protect your personal information. Social media tokens are stored using AES-256 encryption.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">5. Third-Party Services</h2>
                        <p>
                            Our Service may contain links to or integrations with third-party websites or services that are not owned or controlled by us. We are not responsible for the privacy practices of such third parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
                        <p>
                            You may access, correct, or delete your personal information by managing your account settings or contacting us. You can revoke social media permissions at any time via the specific platform&apos;s security settings.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">7. Changes to This Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">8. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@cfabric.app.
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
