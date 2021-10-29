const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const cra = path.join(__dirname, 'example', 'cra');
if (!fs.existsSync(path.join(cra, 'node_modules'))) {
  spawn('npm', ['install'], { cwd: cra, stdio: 'inherit' });
}