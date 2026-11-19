#!/usr/bin/env node
/**
 * GitHub Actions workflow hardening checker.
 *
 * Compromised contributor accounts often persist access by editing workflows.
 * This check fails CI when a workflow introduces the patterns most abused in
 * supply-chain attacks: unpinned actions, untrusted-context interpolation into
 * shell, download-and-execute, hook bypasses, and privileged trigger misuse.
 *
 * Usage: node scripts/security/check-workflows.mjs [dir]
 * Exit codes: 0 clean (warnings allowed), 1 fail-level findings, 2 usage error.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const WORKFLOW_DIR = process.argv[2] ?? ".github/workflows";
const ROOT = process.cwd();
const SEVERITY_RANK = { critical: 3, high: 2, medium: 1, low: 0 };
const FAIL_LEVEL = 2;

if (!existsSync(join(ROOT, WORKFLOW_DIR))) {
  console.log(`No workflow directory at ${WORKFLOW_DIR} — nothing to check.`);
  process.exit(0);
}

const findings = [];
const add = (severity, rule, file, line, detail, evidence) =>
  findings.push({ severity, rule, file, line, detail, evidence: evidence ?? null });

const UNTRUSTED_CONTEXTS = [
  "github.event.issue.title", "github.event.issue.body",
  "github.event.pull_request.title", "github.event.pull_request.body",
  "github.event.pull_request.head.ref", "github.event.pull_request.head.label",
  "github.event.comment.body", "github.event.review.body",
  "github.event.discussion.title", "github.event.discussion.body",
  "github.event.pages", "github.head_ref", "github.ref_name",
  "github.event.workflow_run.head_branch", "github.event.inputs",
];

function extractRunBlocks(lines) {
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\s*)(run|script):\s*(.*)$/);
    if (!match) continue;
    const indent = match[1].length;
    const rest = match[3].trim();
    const startLine = i + 1;
    if (rest === "|" || rest === "|-" || rest === ">" || rest === ">-" || rest === "") {
      const chunk = [];
      for (let j = i + 1; j < lines.length; j++) {
        const line = lines[j];
        if (line.trim() === "") {
          chunk.push(line);
          continue;
        }
        const lineIndent = line.match(/^(\s*)/)[1].length;
        if (lineIndent <= indent) break;
        chunk.push(line);
      }
      blocks.push({ text: chunk.join("\n"), startLine });
    } else {
      blocks.push({ text: rest, startLine });
    }
  }
  return blocks;
}

function checkFile(relPath) {
  const content = readFileSync(join(ROOT, relPath), "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNo = i + 1;

    const uses = line.match(/uses:\s*["']?([^\s"']+)["']?/);
    if (uses) {
      const ref = uses[1];
      if (ref.startsWith("./")) continue;
      if (!/@[0-9a-f]{40}$/.test(ref)) {
        add("high", "actions-unpinned", relPath, lineNo,
          "Action is not pinned to a full commit SHA — tags can be moved to ship malicious code", ref);
      }
    }

    if (/^\s*pull_request_target\s*:/.test(line)) {
      add("high", "actions-pr-target", relPath, lineNo,
        "pull_request_target runs with base-repo privileges on untrusted PR content — review carefully");
    }

    if (/github\.event\.pull_request\.head/.test(content) && /^\s*pull_request_target\s*:/.test(content)) {
      add("critical", "actions-pr-target-head-checkout", relPath, lineNo,
        "pull_request_target combined with a checkout of the PR head — privilege-escalation pattern");
    }
  }

  if (!/^\s*permissions\s*:/m.test(content)) {
    add("medium", "actions-no-permissions", relPath, 1,
      "Workflow declares no top-level `permissions:` — default token may be over-privileged");
  }

  for (const block of extractRunBlocks(lines)) {
    const { text, startLine } = block;

    for (const context of UNTRUSTED_CONTEXTS) {
      const needle = "${{ " + context;
      if (text.includes(needle)) {
        add("critical", "actions-script-injection", relPath, startLine,
          `Untrusted context \`${context}\` interpolated into a shell command — script injection`,
          needle);
      }
    }

    if (/(curl|wget)[^\n]{0,200}\|\s*(bash|sh|zsh)\b/.test(text)) {
      add("critical", "actions-curl-pipe-shell", relPath, startLine,
        "Download-and-execute pipe in a workflow step", "curl|sh");
    }

    if (/--no-verify/.test(text)) {
      add("high", "actions-no-verify", relPath, startLine,
        "Hook bypass (--no-verify) in a workflow step");
    }

    if (/(push\s+-(u[f]?|f|--force)\b)/.test(text) && !/--force-with-lease/.test(text)) {
      add("high", "actions-force-push", relPath, startLine,
        "Force push in a workflow step — history-rewriting pattern (cf. temp_auto_push.bat)");
    }

    if (/\bgit\s+config\b[^\n]*user\.(name|email)/.test(text)) {
      add("medium", "actions-git-identity-rewrite", relPath, startLine,
        "Workflow rewrites git identity — used to falsify commit authorship");
    }
  }
}

const files = readdirSync(join(ROOT, WORKFLOW_DIR))
  .filter((name) => /\.ya?ml$/i.test(name))
  .map((name) => relative(ROOT, join(WORKFLOW_DIR, name)).split("\\").join("/"));

for (const file of files) checkFile(file);

const deduped = [];
const seen = new Set();
for (const finding of findings) {
  const key = `${finding.rule}|${finding.file}|${finding.line}`;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(finding);
}
deduped.sort((a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]);

const failing = deduped.filter((f) => SEVERITY_RANK[f.severity] >= FAIL_LEVEL);

console.log(`Workflow hardening: ${files.length} workflow file(s) checked, ${deduped.length} finding(s).`);
for (const f of deduped) {
  const tag = SEVERITY_RANK[f.severity] >= FAIL_LEVEL ? "FAIL" : "WARN";
  console.log(`  [${tag}] (${f.severity}) ${f.rule} @ ${f.file}:${f.line}`);
  console.log(`         ${f.detail}`);
  if (f.evidence) console.log(`         evidence: ${f.evidence}`);
  if (process.env.GITHUB_ACTIONS) {
    const level = SEVERITY_RANK[f.severity] >= FAIL_LEVEL ? "error" : "warning";
    console.log(`::${level} file=${f.file},line=${f.line},title=${f.rule}::${f.detail}`);
  }
}
if (failing.length === 0) {
  console.log(deduped.length ? "No findings at or above the fail threshold." : "Clean — workflows follow the hardening rules.");
}

process.exit(failing.length > 0 ? 1 : 0);
