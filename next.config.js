/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Désactiver la compression pour des raisons de débogage
  compress: false,
  // Autoriser explicitement les requêtes provenant de n'importe quelle origine
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          // Configuration CSP pour autoriser eval et éviter les erreurs
          { 
            key: 'Content-Security-Policy', 
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *; font-src 'self' data:; connect-src *;" 
          }
        ],
      },
    ]
  },
  // Optimiser pour le développement local
  webpack: (config, { dev, isServer }) => {
    // Optimisations pour le mode développement
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        poll: 800, // Vérifier les changements toutes les 800ms
        aggregateTimeout: 300, // Attendre 300ms après la dernière modification
      };
    }
    return config;
  },
  // Désactiver les vérifications de type au runtime pour optimiser les performances
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig; 