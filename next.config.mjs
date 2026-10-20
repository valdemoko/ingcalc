// STATIC_EXPORT=1 builds a plain static site (`out/`) served by Cloudflare as
// Workers Static Assets. No Worker code runs per request, so the Workers Free
// plan's 10 ms CPU limit cannot cause 503s or hung requests (the OpenNext Worker
// did: ~15-40 ms CPU per request and ~half of the requests timing out).
// `headers()` is unsupported by `output: "export"`; its equivalent ships in
// `public/_headers`. Keep the two lists in sync.
const isStaticExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig = {
  ...(isStaticExport ? { output: "export", images: { unoptimized: true } } : {}),
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  ...(isStaticExport
    ? {}
    : {
        async headers() {
          return [
            {
              source: "/(.*)",
              headers: securityHeaders,
            },
          ];
        },
      }),
};

export default nextConfig;
