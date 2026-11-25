const fs = require('fs');
const path = require('path');

const walletSource = fs.readFileSync(
  path.join(__dirname, '../src/screens/walletScreen/walletScreen.jsx'),
  'utf8',
);

describe('organiser wallet layout', () => {
  it('shows balances before the collapsible refund and history sections', () => {
    const balances = walletSource.indexOf('balanceCards.map');
    const refunds = walletSource.indexOf('Toggle refund requests');
    const history = walletSource.indexOf('Toggle transaction history');

    expect(balances).toBeGreaterThan(-1);
    expect(refunds).toBeGreaterThan(balances);
    expect(history).toBeGreaterThan(refunds);
    expect(walletSource).toContain('accessibilityState={{ expanded: refundsExpanded }}');
    expect(walletSource).toContain('accessibilityState={{ expanded: historyExpanded }}');
  });

  it('paginates long transaction histories', () => {
    expect(walletSource).toContain('const HISTORY_PAGE_SIZE = 8;');
    expect(walletSource).toContain('transactionHistory.slice(start, start + HISTORY_PAGE_SIZE)');
    expect(walletSource).toContain('Page {historyPage} of {totalHistoryPages}');
    expect(walletSource).toContain('Previous transaction page');
    expect(walletSource).toContain('Next transaction page');
  });
});
