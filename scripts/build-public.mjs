import ambienteNext from '@next/env';
import { build } from 'esbuild';
import { writeFile } from 'node:fs/promises';

ambienteNext.loadEnvConfig(process.cwd());
const configuracao = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};
await writeFile('public/src/js/firebase-config.js', 'window.noxFirebaseConfig = ' + JSON.stringify(configuracao) + ';\n');
await build({
  entryPoints: ['src/js/public-cms.ts'],
  outfile: 'public/src/js/cms-public.bundle.js',
  bundle: true,
  format: 'iife',
  target: ['es2020'],
  minify: true,
});
console.log('Integração pública do Firebase preparada para a exportação estática.');
