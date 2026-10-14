import fs from 'node:fs';
import path from 'node:path';

const projectRoot = path.resolve(import.meta.dirname, '..');
const devDirectory = path.join(projectRoot, '.next', 'dev');
const fixturePath = path.join(devDirectory, 'types', 'validator.ts');

// Reproduce the generated references left behind by an older development run.
// Use an isolated checkout: never replace a real validator or an active preview.
if (fs.existsSync(path.join(devDirectory, 'lock'))) {
  throw new Error('A development server may be running. Use an isolated checkout for this build check.');
}

fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
fs.writeFileSync(fixturePath, [
  '// Stale development route fixture for the production-build regression check.',
  'export type RemovedSchedulePage = typeof import("../../../src/app/schedule/page.js");',
  'export type RemovedStatusRoute = typeof import("../../../src/app/api/status/route.js");',
  '',
].join('\n'), { flag: 'wx' });

console.log('Seeded stale development route types; the production build must ignore them.');
