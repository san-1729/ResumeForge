/**
 * Special Babel configuration for Vercel Node.js deployment
 * This ensures JSX is properly transformed for CommonJS environments
 */
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    ['@babel/preset-react', {
      runtime: 'automatic',
      importSource: 'react',
      development: process.env.NODE_ENV === 'development',
    }],
    '@babel/preset-typescript',
  ],
  plugins: [
    // Force CommonJS modules for Node.js environment
    process.env.VERCEL && '@babel/plugin-transform-modules-commonjs',
  ].filter(Boolean),
};
