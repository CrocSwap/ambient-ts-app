import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import macrosPlugin from 'vite-plugin-babel-macros';

export default defineConfig({
    base: '',
    plugins: [react(), macrosPlugin()],
    define: {
        'import.meta.env': {},
        global: {},
    },
    server: {
        port: 3000,
    },
});
