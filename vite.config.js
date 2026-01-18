import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/VECODE/build/',
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            outDir: 'public/build',
            base: '/VECODE/build/',
            manifest: {
                name: 'VECODE Platform',
                short_name: 'VECODE',
                description: 'Sistema Integral de Logística Pro-Agroindustria',
                theme_color: '#1e1b4b',
                background_color: '#0f172a',
                display: 'standalone',
                scope: '/VECODE/',
                start_url: '/VECODE/dashboard',
                icons: [
                    {
                        src: '/VECODE/images/Logo_vde.png',
                        sizes: 'any',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            },
            workbox: {
                maximumFileSizeToCacheInBytes: 5000000,
                navigateFallback: null,
                skipWaiting: true,
                clientsClaim: true,
                cleanupOutdatedCaches: true
            }
        })
    ],
    build: {
        manifest: false, // Explicitly disable to avoid conflict with PWA plugin
    }
});
