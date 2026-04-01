const { AccessToken } = require('livekit-server-sdk');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const params = event.queryStringParameters || {};
  const role   = params.role || 'listener';
  const room   = params.room || 'francais';

  const apiKey    = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Clés API manquantes' })
    };
  }

  const isInterpreter = role === 'interpreter';

  const token = new AccessToken(apiKey, apiSecret, {
    identity: isInterpreter ? 'interprete-visiotranslate' : `auditeur-${Date.now()}`,
    ttl: '4h',
  });

  token.addGrant({
    roomJoin: true,
    room: `visiotranslate-${room}`,
    canPublish: isInterpreter,
    canSubscribe: true,
    canPublishData: false,
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      token: await token.toJwt(),
      url: process.env.LIVEKIT_URL
    })
  };
};
