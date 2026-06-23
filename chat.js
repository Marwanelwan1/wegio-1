const https = require('https');

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY not set in Vercel.' } });
    return;
  }

  const body = JSON.stringify(req.body);
  const options = {
    hostname: 'api.anthropic.com',
    port: 443, path: '/v1/messages', method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const pr = https.request(options, (r) => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => {
      try { res.status(r.statusCode).json(JSON.parse(d)); }
      catch(e) { res.status(500).json({ error: { message: d.substring(0, 300) } }); }
    });
  });
  pr.on('error', e => res.status(500).json({ error: { message: e.message } }));
  pr.write(body);
  pr.end();
};
