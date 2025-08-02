// esbuild config for server: exclude dev-only files from production bundle
require('esbuild').build({
  entryPoints: ['server/index.ts'],
  bundle: true,
  platform: 'node',
  target: ['node18'],
  outfile: 'dist/index.js',
  format: 'esm',
  sourcemap: false,
  minify: true,
  external: [
    'pg', 'ws', 'express', 'zod', 'drizzle-orm', 'drizzle-orm/pg-core', 'drizzle-orm/neon-serverless', 'dotenv', 'bcryptjs', 'express-session', 'connect-pg-simple', '@neondatabase/serverless', 'exceljs', 'nanoid', '@vitejs/plugin-react', '@replit/vite-plugin-runtime-error-modal', '@replit/vite-plugin-cartographer', 'react', 'react-dom', 'path', 'fs', 'http', 'url'
  ],
  inject: [],
  treeShaking: true,
  logLevel: 'info',
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  },
  plugins: [
    {
      name: 'exclude-dev-files',
      setup(build) {
        build.onResolve({ filter: /devServer|viteDev/ }, args => ({ external: true }));
      }
    }
  ]
}).catch(() => process.exit(1));
