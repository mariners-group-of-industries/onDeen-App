jest.mock('react-native-localize', () => ({
  getTimeZone: () => 'Europe/Paris',
}));

const {
  formatSessionTime,
} = require('../src/timezone/maintimezone');

describe('one-to-one session timezone formatting', () => {
  it('uses the requested date and speaker timezone for the visible local time', () => {
    expect(
      formatSessionTime('2026-09-05', '17:00:00', 'Europe/London'),
    ).toBe('06:00 PM');
  });

  it('uses the session date when daylight-saving offsets differ', () => {
    expect(
      formatSessionTime('2026-03-15', '10:00:00', 'America/New_York'),
    ).toBe('03:00 PM');
  });
});
