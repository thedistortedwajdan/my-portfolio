// Builds the downloadable resume from resume/resume.tex into public/. Needs a LaTeX install (pdflatex).
// Usage: npm run resume
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';

const dir = 'resume';
const target = path.join('public', 'Muhammad_Wajdan_Ismail_Resume.pdf');

// Twice, so the hyperlinks and any cross-references settle.
for (let pass = 0; pass < 2; pass += 1) {
  const run = spawnSync('pdflatex', ['-interaction=nonstopmode', '-halt-on-error', 'resume.tex'], {
    cwd: dir,
    encoding: 'utf8',
  });
  if (run.error || run.status !== 0) {
    console.error(run.error ? `Could not run pdflatex: ${run.error.message}` : run.stdout.split('\n').slice(-25).join('\n'));
    process.exit(1);
  }
}

const built = path.join(dir, 'resume.pdf');
if (!existsSync(built)) {
  console.error('pdflatex finished but resume/resume.pdf is missing');
  process.exit(1);
}
copyFileSync(built, target);
for (const ext of ['aux', 'log', 'out', 'pdf']) rmSync(path.join(dir, `resume.${ext}`), { force: true });
console.log(`Wrote ${target}`);
