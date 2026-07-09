const calendar = require('../calendar');
const { queueBookingRequest } = require('../intakeStore');

function parseSlotStart(preferredDate, preferredTime) {
  const parsed = new Date(`${preferredDate} ${preferredTime}`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

async function bookAppointment(args, practice) {
  const { patientName, callbackPhone, reason, preferredDate, preferredTime, isNewPatient } = args;

  if (calendar.isConfigured(practice)) {
    const start = parseSlotStart(preferredDate, preferredTime);
    if (!start) {
      return `I had trouble understanding that date and time — could you repeat the day and time you'd like, for example "next Tuesday at 10:30 AM"?`;
    }
    const durationMs = practice.calendar.appointmentDurationMinutes * 60000;
    const end = new Date(start.getTime() + durationMs);

    await calendar.createEvent(practice, {
      summary: `${patientName} — ${reason}`,
      description: `Booked via ARIA phone receptionist.\nCallback: ${callbackPhone}\nNew patient: ${isNewPatient ? 'Yes' : 'No'}`,
      startISO: start.toISOString(),
      endISO: end.toISOString()
    });

    return `You're booked for ${preferredDate} at ${preferredTime} for a ${reason} with ${practice.name}. We'll send a reminder to ${callbackPhone}. Is there anything else I can help with?`;
  }

  queueBookingRequest(practice.id, { patientName, callbackPhone, reason, preferredDate, preferredTime, isNewPatient: Boolean(isNewPatient) });

  return `Thanks, ${patientName}. I've got you down for a ${reason} on ${preferredDate} at ${preferredTime}, and our staff will call ${callbackPhone} within one business day to confirm. Is there anything else I can help with?`;
}

module.exports = bookAppointment;
