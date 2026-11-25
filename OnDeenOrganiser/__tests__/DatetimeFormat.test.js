const {formatTime} = require('../src/common/datetimeformate');

describe('organiser time formatting', () => {
  it('preserves API HH:mm:ss values when opening an existing event', () => {
    expect(formatTime('10:00:00')).toBe('10:00 AM');
    expect(formatTime('23:15:00')).toBe('11:15 PM');
  });
});
