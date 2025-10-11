/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ INDUSTRY STANDARD SECURITY HEADERS (CORRECTED)
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: [
          // Content Security Policy (CSP) - Protection against XSS attacks
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co https://cdn.jsdelivr.net;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' blob: data: https://*.supabase.co https://*.supabase.in;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in;
              media-src 'self' https://*.supabase.co;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s{2,}/g, ' ').trim()
          },
          // Prevent clickjacking attacks
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          // Prevent MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Enable XSS filter in older browsers
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          // Control browser features and APIs (FIXED - removed interest-cohort)
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()'
          },
          // Force HTTPS connections (2 years)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          }
        ],
      },
    ];
  },

  // ✅ Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        assert: false,
        url: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
