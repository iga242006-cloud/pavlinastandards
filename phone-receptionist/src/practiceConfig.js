const fs = require('fs');
const path = require('path');

const PRACTICES_DIR = path.join(__dirname, '..', 'config', 'practices');

function loadPractice(practiceId) {
  const file = path.join(PRACTICES_DIR, `${practiceId}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`No practice config found for "${practiceId}" (expected ${file})`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function listPracticeIds() {
  return fs
    .readdirSync(PRACTICES_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace(/\.json$/, ''));
}

module.exports = { loadPractice, listPracticeIds };
