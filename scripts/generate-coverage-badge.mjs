#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { makeBadge } from 'badge-maker';

function readCoverageSummary(summaryPath) {
  try {
    const raw = fs.readFileSync(summaryPath, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Failed to read coverage summary at ${summaryPath}`);
    process.exit(1);
  }
}

function pickColor(pct) {
  if (pct >= 90) return 'brightgreen';
  if (pct >= 80) return 'green';
  if (pct >= 70) return 'yellowgreen';
  if (pct >= 60) return 'yellow';
  if (pct >= 50) return 'orange';
  return 'red';
}

function main() {
  const root = process.cwd();
  const summaryPath = path.join(root, 'coverage', 'coverage-summary.json');
  const outDir = path.join(root, 'badges');
  const outPath = path.join(outDir, 'coverage.svg');

  const summary = readCoverageSummary(summaryPath);
  const pct = Math.round((summary.total.statements.pct + Number.EPSILON) * 10) / 10;
  const color = pickColor(pct);

  const format = {
    label: 'coverage',
    message: `${pct}%`,
    color,
    labelColor: '555',
    style: 'flat',
  };

  const svg = makeBadge(format);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf-8');
  console.log(`Wrote ${outPath} (${pct}%)`);
}

main();

