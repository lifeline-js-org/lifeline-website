#!/usr/bin/env node
// Gera src/lib/docs/content.ts embutindo todos os src/lib/docs/*.md como strings.
//
// Motivo: o builder da Discloud exclui arquivos .md do contexto de build
// (o contexto reportado bate exatamente com o total rastreado menos
// package-lock.json e menos todos os .md). Sem isto, o Rolldown não encontra
// os .md em tempo de build e o prerender falha com 404.
//
// Roda automaticamente antes do `vite build` (ver "scripts.build" no package.json).
// Se nenhum .md existir (ex.: build da Discloud), mantém o content.ts commitado.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = join(root, 'src', 'lib', 'docs');
const outFile = join(docsDir, 'content.ts');

const files = existsSync(docsDir)
	? readdirSync(docsDir).filter((f) => f.endsWith('.md')).sort()
	: [];

if (files.length === 0) {
	// Ambiente sem os .md (build da Discloud): usa o content.ts já commitado.
	console.log('[generate-docs] nenhum .md encontrado — mantendo content.ts existente');
	process.exit(0);
}

/** @type {Record<string, string>} */
const content = {};
for (const file of files) {
	content[file.replace(/\.md$/, '')] = readFileSync(join(docsDir, file), 'utf8');
}

const banner = `// ARQUIVO GERADO — não edite manualmente.
// Gere novamente com: node scripts/generate-docs.mjs
// Fonte: src/lib/docs/*.md
//
// O conteúdo é embutido aqui porque o builder da Discloud exclui .md do
// contexto de build; como string em .ts, sobrevive ao build e ao prerender.

`;

const body = `export const DOCS_RAW: Record<string, string> = ${JSON.stringify(content, null, '\t')};\n`;

writeFileSync(outFile, banner + body);
console.log(`[generate-docs] ${files.length} docs embutidos em src/lib/docs/content.ts`);
