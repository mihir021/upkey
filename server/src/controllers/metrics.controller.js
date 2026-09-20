const { productAddedToCartTotal, activeUsersGauge } = require('../metrics/prometheus');

/**
 * POST /api/metrics/track
 * Accepts telemetry events from the frontend for metrics that cannot be inferred solely from backend state.
 */
async function trackEvent(req, res) {
  try {
    const { event, payload } = req.body;
    
    if (event === 'cart_add') {
      const { product_id, category } = payload || {};
      if (product_id) {
        productAddedToCartTotal.inc({ product_id, category: category || 'Unknown' });
      }
    } else if (event === 'logout') {
      activeUsersGauge.dec();
    }
    
    // Always return 200 OK so frontend telemetry is non-blocking
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Metrics track event error:', err);
    // Return 200 even on error to prevent breaking client flows
    return res.status(200).json({ status: 'error' });
  }
}

module.exports = { trackEvent };
