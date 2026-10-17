import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-static';

export async function GET() {
  const html = await readFile(path.join(process.cwd(), 'public', 'home.html'), 'utf8');
  // A rota também funciona com barra final, mantendo os assets na raiz do site.
  const pagina = html.replace('<head>', '<head><base href="/">');
  return new Response(pagina, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
