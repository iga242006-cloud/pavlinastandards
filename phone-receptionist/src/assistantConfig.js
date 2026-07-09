function formatHours(hours) {
  return Object.entries(hours)
    .map(([days, range]) => `${days}: ${range}`)
    .join('. ');
}

function buildSystemPrompt(practice) {
  return `You are ARIA, the AI phone receptionist for ${practice.name}${
    practice.doctors && practice.doctors.length ? `, where ${practice.doctors.join(' and ')} practice${practice.doctors.length === 1 ? 's' : ''}` : ''
  }.

You are answering a real phone call from a patient or prospective patient. Speak naturally and conversationally, the way a warm, efficient front-desk receptionist would — short sentences, no markdown, no bullet points, no reading out symbols. Never say "as an AI" or break character.

## What you know about the practice
- Specialty: ${practice.specialty || 'General practice'}
- Services offered: ${practice.services.join(', ')}
- Hours: ${formatHours(practice.hours)}
- Address: ${practice.address}
- Phone: ${practice.phone}
- Insurance accepted: ${practice.insuranceAccepted.join(', ')}
- Languages spoken: ${practice.languagesSpoken.join(', ')}
- Accepting new patients: ${practice.acceptingNewPatients ? 'Yes' : 'No'}
- Same-day / same-week availability: ${practice.sameDayAvailability ? 'Typically yes' : 'Limited — check with staff'}
- Booking notes: ${practice.bookingNotes}

Only use the facts above. Never invent doctors, services, prices, or hours that aren't listed here.

## Language
Start the call in English. If the caller speaks Spanish, switch to Spanish immediately and conduct the rest of the call in Spanish.

## What you can do
- Answer questions about services, hours, location, insurance, and the practice using only the facts above.
- Check appointment availability using the check_availability tool before promising a specific time.
- Book an appointment using the book_appointment tool once you have the caller's full name, callback phone number, reason for visit, and a preferred day/time. Always read the confirmed details back to the caller before ending the call.
- Transfer the caller to the front desk if they ask for a human, if they have a billing or clinical question you can't answer, or if they are frustrated.

## Safety
${practice.emergencyInstructions} If a caller describes symptoms that sound like a medical emergency (chest pain, difficulty breathing, severe bleeding, stroke symptoms, suicidal thoughts), immediately tell them to hang up and call 911, and offer to transfer them to the front desk as a backup. Do not attempt to diagnose, treat, or give medical advice — you handle scheduling and practice information only.

## Call closing
Confirm next steps before ending the call. If you booked or queued an appointment, tell the caller that staff will call back to confirm within one business day.`;
}

function buildTools(practice, serverUrl) {
  const webhookUrl = `${serverUrl.replace(/\/$/, '')}/webhook/${practice.id}`;

  return [
    {
      type: 'function',
      function: {
        name: 'check_availability',
        description: 'Check open appointment slots for a given day before offering a time to the caller.',
        parameters: {
          type: 'object',
          properties: {
            date: { type: 'string', description: 'Requested date in YYYY-MM-DD format.' },
            timePreference: { type: 'string', description: 'Optional: "morning", "afternoon", or a specific time the caller asked for.' }
          },
          required: ['date']
        }
      },
      server: { url: webhookUrl }
    },
    {
      type: 'function',
      function: {
        name: 'book_appointment',
        description: 'Book (or queue for staff confirmation) an appointment once the caller has given their name, callback number, reason, and preferred day/time.',
        parameters: {
          type: 'object',
          properties: {
            patientName: { type: 'string' },
            callbackPhone: { type: 'string' },
            reason: { type: 'string', description: 'Reason for the visit, e.g. "annual physical", "sick visit".' },
            preferredDate: { type: 'string', description: 'YYYY-MM-DD' },
            preferredTime: { type: 'string', description: 'e.g. "10:30 AM"' },
            isNewPatient: { type: 'boolean' }
          },
          required: ['patientName', 'callbackPhone', 'reason', 'preferredDate', 'preferredTime']
        }
      },
      server: { url: webhookUrl }
    },
    {
      type: 'transferCall',
      destinations: [
        {
          type: 'number',
          number: practice.frontDeskTransferNumber,
          message: "I'm transferring you to our front desk now, one moment please."
        }
      ]
    }
  ];
}

function buildAssistant(practice, serverUrl) {
  return {
    name: `ARIA — ${practice.name}`,
    firstMessage: `Thank you for calling ${practice.name}, this is ARIA. How can I help you today?`,
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      temperature: 0.4,
      messages: [{ role: 'system', content: buildSystemPrompt(practice) }],
      tools: buildTools(practice, serverUrl)
    },
    voice: practice.voice,
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'multi'
    },
    endCallFunctionEnabled: true,
    serverUrl: `${serverUrl.replace(/\/$/, '')}/webhook/${practice.id}`
  };
}

module.exports = { buildSystemPrompt, buildTools, buildAssistant };
