#!/usr/bin/env node
const { spawn } = require('child_process');

async function run(cmd, args, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: { ...process.env, ...env },
    });
    child.on('exit', code =>
      code === 0
        ? resolve()
        : reject(new Error(`${cmd} exited with code ${code}`))
    );
  });
}

(async () => {
  try {
    const env = {
      EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION: 'true',
      EXPO_PUBLIC_PERFECT_STRICT_MODE: 'true',
    };
    await run(
      'npx',
      ['eas', 'build', '-p', 'ios', '--profile', 'development'],
      env
    );
  } catch (err) {
    console.error('\n[ios:build:strict] Failed:', err.message);
    console.error(
      'Assicurati di aver fatto eas login e di avere accesso Apple.'
    );
    process.exit(1);
  }
})();
