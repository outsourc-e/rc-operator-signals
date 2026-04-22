// Pre-render the operator brief at build time using the engine.
// Outputs JSON that the React app loads at runtime.
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

mkdirSync('./src/data', { recursive: true });

const json = execSync('cd .. && ./node_modules/.bin/tsx src/cli.ts --demo --json', {
  encoding: 'utf-8',
});

writeFileSync('./src/data/brief.json', json);
console.log('Pre-rendered brief.json');
