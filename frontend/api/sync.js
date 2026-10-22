/**
 * Vercel Serverless Function: Cloud Database Sync Proxy
 * Bảo vệ URL Google Apps Script bí mật, che giấu hoàn toàn khỏi phía client trình duyệt.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  const GOOGLE_SCRIPT_URL = process.env.XENO_CLOUD_API_URL || "https://script.google.com/macros/s/AKfycbw_7LwmAK4kH8JLY-KLEFXksnAn7EV6HgUfoHfBPFZa-xnoa5ylFXlMYHOWVAKkXzzp5A/exec";

  try {
    const rawBody = typeof req.body === 'string' 
      ? req.body 
      : JSON.stringify(req.body || {});

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: rawBody,
      redirect: 'follow'
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[API SYNC ERROR]:', error);
    return res.status(500).json({
      success: false,
      error: 'Lỗi đồng bộ Cloud Database: ' + error.message
    });
  }
}
