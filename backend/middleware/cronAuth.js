// middleware/cronAuth.js
// Validates that cron requests come from your trusted third-party service.
// Set CRON_SECRET in your .env file.
// Configure your cron service to send: Authorization: Bearer <CRON_SECRET>

export const cronAuth = (req, res, next) => {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // If no secret is configured, allow (development mode)
    console.warn('⚠️  CRON_SECRET not set — cron endpoints are unprotected!');
    return next();
  }

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (token !== secret) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  return next();
};