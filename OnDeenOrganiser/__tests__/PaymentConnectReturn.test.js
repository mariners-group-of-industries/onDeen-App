const fs = require('fs');
const path = require('path');

const confirmSource = fs.readFileSync(
  path.join(__dirname, '../src/screens/createEventScreen/Confirm.jsx'),
  'utf8',
);

describe('Stripe Connect return flow', () => {
  it('refreshes readiness when the Organiser returns from hosted onboarding', () => {
    expect(confirmSource).toContain("AppState.addEventListener('change'");
    expect(confirmSource).toContain("nextState === 'active'");
    expect(confirmSource).toContain('refreshStripeStatus();');
    expect(confirmSource).toContain("url: '/payment/connect/status'");
    expect(confirmSource).toContain("method: 'POST'");
    expect(confirmSource).toContain('return () => subscription.remove();');
  });

  it('keeps incomplete onboarding recoverable without exposing a native error', () => {
    expect(confirmSource).toContain("? 'Continue setup'");
    expect(confirmSource).toContain('Refresh status');
    expect(confirmSource).toContain("showToast('Stripe is connected and ready.', 1)");
    expect(confirmSource).toContain('catch (_error)');
  });
});
