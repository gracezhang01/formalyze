import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactComponentTagger } from 'react-component-tagger';

export default defineConfig({
	base: './',
	plugins: [react(), reactComponentTagger()],
	build: {
		chunkSizeWarningLimit: 10240,
		outDir: 'dist',
		assetsDir: 'assets',
		emptyOutDir: true,
		rollupOptions: {
			output: {
				manualChunks: undefined,
				assetFileNames: 'assets/[name].[hash][extname]',
				chunkFileNames: 'assets/[name].[hash].js',
				entryFileNames: 'assets/[name].[hash].js',
			},
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false
			},
		},
	},
});
