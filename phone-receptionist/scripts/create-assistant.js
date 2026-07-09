require('dotenv').config();
const { loadPractice } = require('../src/practiceConfig');
const { buildAssistant } = require('../src/assistantConfig');

async function main() {
  const practiceId = process.argv[2];
  if (!practiceId) {
    console.error('Usage: node scripts/create-assistant.js <practiceId>');
    console.error('Example: node scripts/create-assistant.js example-practice');
    process.exit(1);
  }

  if (!process.env.VAPI_API_KEY) {
    console.error('Missing VAPI_API_KEY in .env — get one from the Vapi dashboard under API Keys.');
    process.exit(1);
  }

  if (!process.env.PUBLIC_SERVER_URL || process.env.PUBLIC_SERVER_URL.includes('your-deployed-domain')) {
    console.error('Set PUBLIC_SERVER_URL in .env to this server\'s public HTTPS address before provisioning.');
    process.exit(1);
  }

  const practice = loadPractice(practiceId);
  const assistant = buildAssistant(practice, process.env.PUBLIC_SERVER_URL);

  const res = await fetch('https://api.vapi.ai/assistant', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(assistant)
  });

  const data = await res.json();

  if (!res.ok) {
    console.error('Vapi rejected the assistant:', JSON.stringify(data, null, 2));
    process.exit(1);
  }

  console.log(`Created assistant "${assistant.name}"`);
  console.log(`Assistant ID: ${data.id}`);
  console.log('');
  console.log('Next step: in the Vapi dashboard, go to Phone Numbers, buy or import a number,');
  console.log(`and assign it to this assistant (${data.id}) so calls route to it.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
