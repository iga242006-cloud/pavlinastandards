require('dotenv').config();
const express = require('express');
const { handleWebhook } = require('./src/webhookHandler');
const { listPracticeIds } = require('./src/practiceConfig');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ ok: true, practices: listPracticeIds() });
});

app.post('/webhook/:practiceId', handleWebhook);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`ARIA phone receptionist server listening on port ${port}`);
  console.log(`Configured practices: ${listPracticeIds().join(', ') || '(none yet)'}`);
});
