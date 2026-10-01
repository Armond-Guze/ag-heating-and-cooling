const fields = ['name', 'email', 'town', 'service', 'timeline', 'message'];
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method not allowed');
  }
  const body = typeof req.body === 'string'
    ? Object.fromEntries(new URLSearchParams(req.body)) : (req.body || {});
  if (body['bot-field']) return res.redirect(303, '/thank-you');
  if (fields.some(field => typeof body[field] !== 'string' || !body[field].trim() || body[field].length > 10000)
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return res.status(400).send('Please complete all fields with a valid email address. Use your browser’s Back button to return to the form.');
  }
  const payload = new URLSearchParams({ 'form-name': 'service-request', 'bot-field': '' });
  for (const field of fields) payload.set(field, body[field].trim());
  try {
    const response = await fetch('https://ag-heating-cooling-nj.netlify.app/thank-you', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: payload.toString(), redirect: 'manual', signal: AbortSignal.timeout(15000)
    });
    if (!response.ok && ![301, 302, 303].includes(response.status)) throw new Error('Submission failed');
    return res.redirect(303, '/thank-you');
  } catch {
    return res.status(502).send('Your request could not be sent. Please try again or email AGHVACLLC@GMAIL.com.');
  }
}
