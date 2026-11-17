import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], build: { outDir: 'dist', rollupOptions: { output: { manualChunks(id) { if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis') || id.includes('node_modules/@gsap')) return 'scroll-motion'; if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'interface-motion'; } } } } });
