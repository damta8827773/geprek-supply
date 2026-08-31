#!/usr/bin/env node
/**
 * Reusable supply-chain / dependency vulnerability scanner for this monorepo.
 *
 * What it does (read-only, never runs npm install/ci):
 *  1. Reads package-lock.json directly (works even without node_modules
 *     installed) and cross-checks every resolved package against
 *     security/known-bad-packages.json - the same technique used for the
 *     August 2026 keyv/cacheable incident audit, made repeatable.
 *  2. Optionally runs `npm audit --json` for a second, independent signal
 *     (advisory-database based) - best-effort, never fails the scan if the
 *     registry is unreachable.
 *
 * Usage:  node security/security-scan.mjs   (or: npm run security:scan)
 * Exit code 1 if a known-bad package version is found; 0 otherwise.
 */
import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCKFILE = path.join(ROOT, 'package-lock.json');
const ADVISORIES_FILE = path.join(__dirname, 'known-bad-packages.json');

function loadJson(file) {
  return JSON.parse(readFileSync(file, 'utf8'));
}

/** Flattens {advisories:[{packages:{name:{badVersions,safeAt}}}]} into name -> info[]. */
function buildWatchlist(advisories) {
  const map = new Map();
  for (const adv of advisories.advisories) {
    for (const [name, info] of Object.entries(adv.packages)) {
      const list = map.get(name) ?? [];
      list.push({ ...info, advisoryId: adv.id });
      map.set(name, list);
    }
  }
  return map;
}

/** Every resolved "name@version" in an npm v2/v3 lockfile's "packages" map. */
function resolvedPackages(lock) {
  const out = [];
  const packages = lock.packages ?? {};
  for (const [key, meta] of Object.entries(packages)) {
    if (!key.startsWith('node_modules/') || !meta.version) continue;
    const name = key.slice('node_modules/'.length).replace(/.*node_modules\//, '');
    out.push({ name, version: meta.version, path: key });
  }
  return out;
}

function scanLockfile() {
  if (!existsSync(LOCKFILE)) {
    console.log('! package-lock.json not found - skipping lockfile scan.');
    return { findings: [], checked: 0 };
  }
  const lock = loadJson(LOCKFILE);
  const watchlist = buildWatchlist(loadJson(ADVISORIES_FILE));
  const installed = resolvedPackages(lock);

  const findings = [];
  for (const pkg of installed) {
    const watched = watchlist.get(pkg.name);
    if (!watched) continue;
    for (const w of watched) {
      if (w.badVersions.includes(pkg.version)) {
        findings.push({
          severity: 'CRITICAL',
          package: pkg.name,
          version: pkg.version,
          path: pkg.path,
          advisory: w.advisoryId,
          detail: `Matches known-compromised version (safe: ${w.safeAt ?? 'see advisory'})`,
        });
      }
    }
  }
  return { findings, checked: installed.length, watchlistSize: watchlist.size };
}

function runNpmAudit() {
  try {
    const out = execSync('npm audit --json --workspaces --include-workspace-root', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const report = JSON.parse(out);
    return report.metadata?.vulnerabilities ?? null;
  } catch (err) {
    // npm audit exits non-zero when it FINDS vulnerabilities (not a script error) -
    // its JSON is still on stdout in that case.
    if (err.stdout) {
      try {
        const report = JSON.parse(err.stdout);
        return report.metadata?.vulnerabilities ?? null;
      } catch {
        /* fall through to null below */
      }
    }
    return null;
  }
}

function main() {
  console.log('Geprek-Supply security scan');
  console.log('============================\n');

  const { findings, checked, watchlistSize } = scanLockfile();
  console.log(`Lockfile packages checked: ${checked}`);
  console.log(`Known-bad-package entries watched: ${watchlistSize ?? 0}\n`);

  if (findings.length === 0) {
    console.log('✔ No known-compromised package versions found in package-lock.json.\n');
  } else {
    console.log(`✘ ${findings.length} finding(s):\n`);
    for (const f of findings) {
      console.log(`  [${f.severity}] ${f.package}@${f.version} (${f.path})`);
      console.log(`    ${f.detail} - advisory: ${f.advisory}\n`);
    }
  }

  console.log('Running `npm audit` for a second opinion (best-effort, needs network)...');
  const vulns = runNpmAudit();
  if (vulns) {
    const total = Object.values(vulns).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    console.log(`  npm audit: ${JSON.stringify(vulns)} (total ${total})`);
  } else {
    console.log('  npm audit: unavailable (offline or npm error) - skipped.');
  }

  if (findings.length > 0) {
    console.log('\nResult: FAIL - do not deploy until the affected package(s) are pinned/removed.');
    process.exit(1);
  }
  console.log('\nResult: PASS');
}

main();
