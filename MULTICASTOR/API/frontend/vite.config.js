import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  
  // ⚡ Important : chemins relatifs pour que les assets fonctionnent depuis n'importe quelle IP ou sous-dossier
  base: './',

  build: {
    outDir: 'dist',        // dossier de build
    emptyOutDir: true,     // vide dist avant build
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        // conserver le dossier assets avec hash
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },

  server: {
    host: true,            // accessible depuis l'IP réseau
    port: 5173,            // port dev (modifiable)
    fs: { strict: false },
    historyApiFallback: true, // évite les 404 sur routes React en dev
  },

  preview: {
    host: true,               // accès réseau pour preview
    port: 4173,
    historyApiFallback: true, // fallback SPA pour preview
  },
});
