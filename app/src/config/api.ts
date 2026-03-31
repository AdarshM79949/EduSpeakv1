// API base URL - uses environment variable in production, empty in dev (Vite proxy)
const API_BASE = import.meta.env.VITE_API_URL || '';

// Override global fetch to prepend API base URL for /api/* requests
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string' && input.startsWith('/api/') && API_BASE) {
    input = `${API_BASE}${input}`;
  }
  return originalFetch.call(this, input, init);
};

export {};
