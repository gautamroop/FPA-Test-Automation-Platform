/**
 * publish-report.js
 *
 * Publishes the Playwright HTML report from reports/salesforce/oms/ to the
 * GitHub Pages repo (gautamroop/fp-openwebui-test-report) under:
 *   salesforce/oms/
 *
 * Usage:
 *   npm run publish:report
 *
 * Requires GITHUB_PERSONAL_ACCESS_TOKEN in .env (or in the environment).
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ── Load .env ──────────────────────────────────────────────────────────────
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const PAT = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
if (!PAT) {
  console.error('ERROR: GITHUB_PERSONAL_ACCESS_TOKEN is not set in .env');
  process.exit(1);
}

// ── Config ─────────────────────────────────────────────────────────────────
const REPORT_OWNER = 'gautamroop';
const REPORT_REPO  = 'fp-openwebui-test-report';
const REPORT_BRANCH = 'gh-pages';
const LOCAL_REPORT_DIR = path.resolve(__dirname, '../reports/salesforce/oms');
const DEST_SUBFOLDER   = 'salesforce/oms';

// ── Verify the local report exists ─────────────────────────────────────────
if (!fs.existsSync(LOCAL_REPORT_DIR)) {
  console.error(`ERROR: Report not found at ${LOCAL_REPORT_DIR}`);
  console.error('Run "npm run test:oms" first to generate the report.');
  process.exit(1);
}

// ── Clone target repo into a temp dir ──────────────────────────────────────
const tmpDir = path.resolve(__dirname, '../.tmp-report-publish');

function run(cmd, cwd) {
  console.log(`$ ${cmd}`);
  execSync(cmd, { cwd: cwd ?? process.cwd(), stdio: 'inherit' });
}

// Clean up any leftover temp dir
if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const remoteUrl = `https://${PAT}@github.com/${REPORT_OWNER}/${REPORT_REPO}.git`;

console.log(`\nCloning ${REPORT_OWNER}/${REPORT_REPO} (branch: ${REPORT_BRANCH})...`);
run(`git clone --branch ${REPORT_BRANCH} --single-branch --depth 1 "${remoteUrl}" "${tmpDir}"`);

// ── Copy the report into the correct subfolder ─────────────────────────────
const destDir = path.join(tmpDir, DEST_SUBFOLDER);
if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir, { recursive: true });

// Recursively copy LOCAL_REPORT_DIR → destDir
copyDir(LOCAL_REPORT_DIR, destDir);
console.log(`\nCopied report to ${DEST_SUBFOLDER}/`);

// ── Commit and push ────────────────────────────────────────────────────────
const timestamp = new Date().toISOString().replace('T', ' ').replace(/\..+/, '') + ' UTC';
const commitMsg = `ci: publish OMS Playwright report [${timestamp}]`;

run(`git config user.email "ci@fpa-test-automation"`, tmpDir);
run(`git config user.name "FPA CI"`, tmpDir);
run(`git add ${DEST_SUBFOLDER}`, tmpDir);
run(`git commit -m "${commitMsg}"`, tmpDir);
run(`git push origin ${REPORT_BRANCH}`, tmpDir);

// ── Cleanup ────────────────────────────────────────────────────────────────
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\nReport published successfully!`);
console.log(`View at: https://${REPORT_OWNER}.github.io/${REPORT_REPO}/${DEST_SUBFOLDER}/`);

// ── Helpers ────────────────────────────────────────────────────────────────
function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
