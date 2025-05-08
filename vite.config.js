import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { reactComponentTagger } from 'react-component-tagger';

export default defineConfig({
	base: '/',
	plugins: [react(), reactComponentTagger()],
	build: {
		chunkSizeWarningLimit: 10240,
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
