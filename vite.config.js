import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { socialPreviewPlugin } from './scripts/social-origin.mjs';
export default defineConfig(({ mode }) => ({ plugins: [react(), socialPreviewPlugin({ ...loadEnv(mode, process.cwd(), ''), ...process.env })], build: { outDir: 'dist', rollupOptions: { output: { manualChunks(id) { if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis') || id.includes('node_modules/@gsap')) return 'scroll-motion'; if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'interface-motion'; } } } } }));
