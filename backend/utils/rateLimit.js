/**
 * Simple in-memory rate limiter for Express routes.
 * Limits requests per IP.
 */
const requests = new Map();

function rateLimit(maxRequests = 30, windowMs = 60000) {
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(ip)) requests.set(ip, []);

    const timestamps = requests.get(ip).filter((t) => t > windowStart);
    requests.set(ip, timestamps);

    if (timestamps.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    timestamps.push(now);
    next();
  };
}

module.exports = rateLimit;
