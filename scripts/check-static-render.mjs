import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await mkdir('.qa', { recursive: true });
await build({ entryPoints: ['tests/render-check.jsx'], bundle: true, platform: 'node', format: 'cjs', jsx: 'automatic', outfile: '.qa/render-check.cjs', logLevel: 'warning' });
const result = spawnSync(process.execPath, ['.qa/render-check.cjs'], { encoding: 'utf8' });
process.stdout.write(result.stdout || '');
process.stderr.write(result.stderr || '');
process.exitCode = result.status ?? 1;
