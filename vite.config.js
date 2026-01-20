import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    base: '/build/',
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
        /*
                VitePWA({
                    registerType: 'autoUpdate',
                    outDir: 'public/build',
                    base: '/build/',
                    manifest: {
                        name: 'VECODE Platform',
                        short_name: 'VECODE',
                        description: 'Sistema Integral de Logística Pro-Agroindustria',
                        version: '1.0.3',
                        theme_color: '#1e1b4b',
                        background_color: '#0f172a',
                        display: 'standalone',
                        scope: '/',
                        start_url: '/dashboard',
                        icons: [
                            {
                                src: '/images/Logo_vde.png',
                                sizes: '192x192',
                                type: 'image/png',
                                purpose: 'any'
                            },
                            {
                                src: '/images/Logo_vde.png',
                                sizes: '512x512',
                                type: 'image/png',
                                purpose: 'any'
                            },
                            {
                                src: '/images/Logo_vde.png',
                                sizes: 'any',
                                type: 'image/png',
                                purpose: 'maskable'
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
        */
    ],
    build: {
        manifest: true, // Generate .vite/manifest.json (Handled by Deploy Script)
        chunkSizeWarningLimit: 1600,
    }
});
