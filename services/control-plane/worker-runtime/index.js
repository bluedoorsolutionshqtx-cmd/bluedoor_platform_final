import { spawn } from 'child_process';

const workers = [
  'routing',
  'dispatch',
  'billing',
  'notification',
  'memory',
  'recovery'
];

for (const worker of workers) {
  const child = spawn(
    'node',
    [
      './platform/orchestrator/workers/runtime.worker.js',
      worker
    ],
    {
      stdio: 'inherit',
      cwd: process.cwd()
    }
  );

  child.on(
    'exit',
    code => {
      console.error(
        `[worker-runtime] ${worker} exited`,
        code
      );
    }
  );
}

console.log(
  '[worker-runtime] started'
);

setInterval(
  () => {},
  1000
);
