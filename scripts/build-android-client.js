#!/usr/bin/env node
const { spawn } = require('child_process');

function run(cmd, args, env = {}) {
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
    await run('npx', ['expo', 'run:android']);
  } catch (err) {
    console.error('\n[android:client] Failed:', err.message);
    process.exit(1);
  }
})();
