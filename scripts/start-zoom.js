#!/usr/bin/env node
const { spawn } = require('child_process');

const env = {
  EXPO_PUBLIC_ENABLE_DISPLAY_ZOOM_NORMALIZATION: 'true',
};

const child = spawn('npx', ['expo', 'start', '-c'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: { ...process.env, ...env },
});
child.on('exit', code => process.exit(code || 0));
