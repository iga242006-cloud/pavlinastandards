const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

// NOTE: This is a local JSON file used only so the scaffold works end-to-end
// without any external service configured. It is NOT encrypted, NOT access
// controlled, and NOT suitable for storing real patient data (PHI). Before
// using this with a real practice, replace this with a proper database or a
// direct integration into the practice's EHR/CRM under a signed BAA. See README.
function storePath(practiceId) {
  return path.join(DATA_DIR, `${practiceId}-intake.json`);
}

function queueBookingRequest(practiceId, request) {
  const file = storePath(practiceId);
  const existing = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  existing.push({ ...request, receivedAt: new Date().toISOString() });
  fs.writeFileSync(file, JSON.stringify(existing, null, 2));
}

module.exports = { queueBookingRequest };
