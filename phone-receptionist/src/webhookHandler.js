const { loadPractice } = require('./practiceConfig');
const checkAvailability = require('./functions/checkAvailability');
const bookAppointment = require('./functions/bookAppointment');

const handlers = {
  check_availability: checkAvailability,
  book_appointment: bookAppointment
};

// Vapi's documented tool-call payload shape has varied across API versions
// (toolCallList[].arguments vs .parameters, or a legacy toolCalls[].function
// shape). Normalize whatever we're sent into { id, name, args } so the rest
// of the handler doesn't care which shape arrived.
function normalizeToolCalls(body) {
  const message = body && body.message;
  if (!message) return [];

  if (Array.isArray(message.toolCallList)) {
    return message.toolCallList.map(tc => ({
      id: tc.id,
      name: tc.name,
      args: tc.arguments || tc.parameters || {}
    }));
  }

  if (Array.isArray(message.toolCalls)) {
    return message.toolCalls.map(tc => ({
      id: tc.id,
      name: tc.function ? tc.function.name : tc.name,
      args: tc.function && typeof tc.function.arguments === 'string'
        ? JSON.parse(tc.function.arguments)
        : (tc.function ? tc.function.arguments : tc.arguments) || {}
    }));
  }

  return [];
}

async function handleWebhook(req, res) {
  const { practiceId } = req.params;

  let practice;
  try {
    practice = loadPractice(practiceId);
  } catch (err) {
    return res.status(404).json({ error: err.message });
  }

  const toolCalls = normalizeToolCalls(req.body);
  if (!toolCalls.length) {
    // Not a tool-calls message (e.g. an end-of-call-report or status-update event) — ack and ignore.
    return res.status(200).json({ received: true });
  }

  const results = await Promise.all(
    toolCalls.map(async ({ id, name, args }) => {
      const handler = handlers[name];
      if (!handler) {
        return { toolCallId: id, result: `Unknown tool: ${name}` };
      }
      try {
        const result = await handler(args, practice);
        return { toolCallId: id, result: String(result) };
      } catch (err) {
        return { toolCallId: id, result: `Sorry, something went wrong looking that up: ${err.message}` };
      }
    })
  );

  // Always 200 — Vapi ignores non-200 responses entirely.
  res.status(200).json({ results });
}

module.exports = { handleWebhook, normalizeToolCalls };
