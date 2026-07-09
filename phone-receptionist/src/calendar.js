const { google } = require('googleapis');

function isConfigured(practice) {
  return Boolean(
    practice.calendar &&
    practice.calendar.enabled &&
    practice.calendar.calendarId &&
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY
  );
}

function getClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar']
  });
  return google.calendar({ version: 'v3', auth });
}

/**
 * Returns an array of busy { start, end } ISO ranges for the given calendar/day.
 * Requires the target calendar to have been shared with the service account email
 * (Settings and sharing → Share with specific people → Editor) — see README.
 */
async function getBusyRanges(practice, dateISO) {
  const calendar = getClient();
  const dayStart = new Date(`${dateISO}T00:00:00`);
  const dayEnd = new Date(`${dateISO}T23:59:59`);

  const res = await calendar.freebusy.query({
    requestBody: {
      timeMin: dayStart.toISOString(),
      timeMax: dayEnd.toISOString(),
      timeZone: practice.timezone,
      items: [{ id: practice.calendar.calendarId }]
    }
  });

  return res.data.calendars[practice.calendar.calendarId].busy || [];
}

async function createEvent(practice, { summary, description, startISO, endISO }) {
  const calendar = getClient();
  const res = await calendar.events.insert({
    calendarId: practice.calendar.calendarId,
    requestBody: {
      summary,
      description,
      start: { dateTime: startISO, timeZone: practice.timezone },
      end: { dateTime: endISO, timeZone: practice.timezone }
    }
  });
  return res.data;
}

module.exports = { isConfigured, getBusyRanges, createEvent };
