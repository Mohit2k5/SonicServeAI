const { execSync } = require('node:child_process');

const ports = [3000, 3001, 4000];

function getPidsForPort(port) {
  try {
    const output = execSync(`netstat -ano | findstr :${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });

    return [...new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line.includes('LISTENING'))
        .map((line) => line.split(/\s+/).pop())
        .filter((pid) => pid && pid !== '0')
    )];
  } catch {
    return [];
  }
}

for (const port of ports) {
  const pids = getPidsForPort(port);
  if (pids.length === 0) continue;

  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
      console.log(`Freed port ${port} by terminating PID ${pid}`);
    } catch {
      console.warn(`Could not terminate PID ${pid} on port ${port}`);
    }
  }
}
