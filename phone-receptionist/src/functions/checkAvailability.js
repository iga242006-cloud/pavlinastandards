const calendar = require('../calendar');

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(slotStart, slotEnd, busyStart, busyEnd) {
  return slotStart < busyEnd && slotEnd > busyStart;
}

async function checkAvailability({ date, timePreference }, practice) {
  if (!calendar.isConfigured(practice)) {
    return `We don't have live calendar access connected yet for ${practice.name}. ${practice.bookingNotes} I can take your preferred day and time and have our staff confirm the exact slot.`;
  }

  const { appointmentDurationMinutes, workingHours } = practice.calendar;
  const busy = (await calendar.getBusyRanges(practice, date)).map(b => ({
    start: new Date(b.start),
    end: new Date(b.end)
  }));

  const dayStartMin = toMinutes(workingHours.start);
  const dayEndMin = toMinutes(workingHours.end);
  const openSlots = [];

  for (let min = dayStartMin; min + appointmentDurationMinutes <= dayEndMin; min += appointmentDurationMinutes) {
    const slotStart = new Date(`${date}T00:00:00`);
    slotStart.setMinutes(min);
    const slotEnd = new Date(slotStart.getTime() + appointmentDurationMinutes * 60000);

    if (timePreference === 'morning' && min >= 12 * 60) continue;
    if (timePreference === 'afternoon' && min < 12 * 60) continue;

    const isBusy = busy.some(b => overlaps(slotStart, slotEnd, b.start, b.end));
    if (!isBusy) {
      openSlots.push(slotStart.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    }
    if (openSlots.length >= 3) break;
  }

  if (!openSlots.length) {
    return `I don't see any open slots on ${date}${timePreference ? ` in the ${timePreference}` : ''}. Would you like me to check a different day?`;
  }

  return `On ${date} we have ${openSlots.join(', ')} available. Would any of those work for you?`;
}

module.exports = checkAvailability;
