import { randomBytes } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

function fail(message) {
  console.error(`Reminder setup failed: ${message}`);
  process.exit(1);
}

function readValue(source, name) {
  const line = source
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => item && !item.startsWith('#') && item.startsWith(`${name}=`));
  return line ? line.slice(line.indexOf('=') + 1).trim().replace(/^(['"])(.*)\1$/, '$2') : '';
}

let source = '';
for (const file of ['.env.local', '.env']) {
  try {
    source += `\n${await readFile(file, 'utf8')}`;
  } catch {
    // The other supported env file may exist.
  }
}

const resendKey = readValue(source, 'RESEND_API_KEY');
const fromEmail = readValue(source, 'REMINDER_FROM_EMAIL');
if (!resendKey) fail('add RESEND_API_KEY to .env.local');

const cronSecret = randomBytes(32).toString('hex');
const temporaryDirectory = await mkdtemp(join(tmpdir(), 'debt-reminders-'));
const secretFile = join(temporaryDirectory, 'reminders.env');
const supabaseCli = fileURLToPath(new URL('../node_modules/supabase/dist/supabase.js', import.meta.url));

try {
  const lines = [
    `RESEND_API_KEY=${resendKey}`,
    `DEBT_REMINDER_CRON_SECRET=${cronSecret}`,
    fromEmail ? `REMINDER_FROM_EMAIL=${fromEmail}` : '',
  ].filter(Boolean).join('\n');
  await writeFile(secretFile, `${lines}\n`, { mode: 0o600 });

  const secretResult = spawnSync(process.execPath, [
    supabaseCli, 'secrets', 'set', '--env-file', secretFile,
  ], { stdio: 'inherit' });
  if (secretResult.status !== 0) fail('Supabase could not upload reminder secrets');

  const githubResult = spawnSync('gh', [
    'secret', 'set', 'DEBT_REMINDER_CRON_SECRET', '--body', cronSecret,
  ], { stdio: 'inherit', shell: process.platform === 'win32' });
  if (githubResult.status !== 0) fail('GitHub CLI could not save the cron secret');

  const deployResult = spawnSync(process.execPath, [
    supabaseCli, 'functions', 'deploy', 'debt-reminders', '--no-verify-jwt',
  ], { stdio: 'inherit' });
  if (deployResult.status !== 0) fail('Supabase could not deploy debt-reminders');
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

console.log('Debt reminder secrets uploaded and function deployed.');
