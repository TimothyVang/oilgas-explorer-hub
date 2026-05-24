// Shared CORS configuration for edge functions
// Restricts access to specific allowed origins instead of wildcard

const ALLOWED_ORIGINS = [
  // Production domains
  'https://bah-oil.com',
  'https://bah-oil-gas.com',
  'https://www.bah-oil-gas.com',
  'https://bahoilgas.lovable.app',
  // Development
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  
  // Check if origin is allowed
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-docusign-signature-1",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
}

export function handleCorsOptions(req: Request): Response {
  return new Response(null, { 
    headers: getCorsHeaders(req),
    status: 204 
  });
}
