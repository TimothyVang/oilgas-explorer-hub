// Shared CORS configuration for edge functions
// Restricts access to specific allowed origins instead of wildcard

const ALLOWED_ORIGINS = [
  // Production domains - add your actual domain here
  'https://chpshvjvbtoflkwmljvf.lovableproject.com',
  'https://bah-oil-gas.lovable.app',
  // Development
  'http://localhost:5173',
  'http://localhost:3000',
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
  };
}

export function handleCorsOptions(req: Request): Response {
  return new Response(null, { 
    headers: getCorsHeaders(req),
    status: 204 
  });
}
