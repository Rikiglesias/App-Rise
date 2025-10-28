#!/usr/bin/env node

/**
 * Snapshot protection script for CI environments.
 * - Runs snapshot and visual regression suites in CI mode
 * - Fails if either suite fails or if snapshot files are modified
 */

const { spawnSync } = require('node:child_process');

const run = command => {
  const result = spawnSync(command, {
    stdio: 'inherit',
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

run(
  'npx jest --testPathPattern=snapshots --passWithNoTests --ci --runInBand'
);

run('npx jest --testPathPattern=visual --passWithNoTests --ci --runInBand');

const gitStatus = spawnSync('git', ['status', '--porcelain'], {
  encoding: 'utf8',
  shell: true,
});

if (gitStatus.status !== 0) {
  console.warn('WARNING: unable to verify snapshot cleanliness; git status failed.');
  process.exit(gitStatus.status ?? 1);
}

const dirtyEntries = gitStatus.stdout
  .split('\n')
  .map(entry => entry.trim())
  .filter(entry => entry.length > 0)
  .filter(entry => /__snapshots__|visual-snapshots/.test(entry));

if (dirtyEntries.length > 0) {
  console.error('ERROR: snapshot changes detected after validation:');
  dirtyEntries.forEach(entry => console.error(` - ${entry}`));
  console.error('Run `npm run snapshot:update` and commit the updated snapshots.');
  process.exit(1);
}

console.log('Snapshot protection checks passed with no changes detected.');
