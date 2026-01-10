import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://cdn.tailwindcss.com https://*.googleapis.com https://*.fal.ai; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; img-src * blob: data:; font-src 'self' https://fonts.gstatic.com; frame-src 'self' https://*.youtube.com https://*.vimeo.com; connect-src * https://*.fal.ai; worker-src 'self' blob: 'unsafe-eval'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests;"
          }
        ],
      },
    ]
  },
};

export default nextConfig;
