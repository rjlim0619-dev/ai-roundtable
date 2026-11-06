// AI Roundtable - Twilio Function that phones Ryan and reads the team's update.
// Paste this into a Twilio Function at path /call and set its visibility to "Public".
// Environment variables needed (Functions > Settings > Environment Variables):
//   CALL_SECRET   - a password you also type into the app ("Call password")
//   MY_PHONE      - your phone number, e.g. +639171234567
//   TWILIO_NUMBER - your Twilio phone number, e.g. +15551234567
exports.handler = async function (context, event, callback) {
  const response = new Twilio.Response();
  response.appendHeader('Access-Control-Allow-Origin', '*');
  response.appendHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.appendHeader('Content-Type', 'application/json');

  if (!event.secret || event.secret !== context.CALL_SECRET) {
    response.setStatusCode(401);
    response.setBody({ ok: false, error: 'Wrong call password' });
    return callback(null, response);
  }

  const text = String(event.message || 'Your AI team has an update for you.')
    .replace(/[<>&]/g, ' ').slice(0, 1200);

  const twiml = new Twilio.twiml.VoiceResponse();
  const voice = { voice: 'Polly.Joanna' };
  twiml.pause({ length: 1 });
  twiml.say(voice, 'Hi Ryan! This is your A I team calling with an update.');
  twiml.pause({ length: 1 });
  twiml.say(voice, text);
  twiml.pause({ length: 1 });
  twiml.say(voice, 'Once more, here is the update.');
  twiml.say(voice, text);
  twiml.say(voice, 'That is all for now. Open your A I Roundtable app to reply. Goodbye!');

  try {
    const call = await context.getTwilioClient().calls.create({
      to: context.MY_PHONE,
      from: context.TWILIO_NUMBER,
      twiml: twiml.toString(),
    });
    response.setBody({ ok: true, sid: call.sid });
  } catch (e) {
    response.setStatusCode(500);
    response.setBody({ ok: false, error: e.message });
  }
  return callback(null, response);
};
