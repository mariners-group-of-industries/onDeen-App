import {
  buildSessionDateOptions,
  SESSION_DATE_WINDOW_DAYS,
} from '../src/screens/RequestSessions/sessionDateOptions';

describe('session date options', () => {
  it('keeps the next weekly slot reachable when the current one is occupied', () => {
    const options = buildSessionDateOptions(new Date(2026, 8, 3, 12, 0, 0));

    expect(options).toHaveLength(SESSION_DATE_WINDOW_DAYS);
    expect(options[0]).toMatchObject({date: '2026-09-03', weekday: 'Thu'});
    expect(options).toContainEqual(expect.objectContaining({
      date: '2026-09-12',
      weekday: 'Sat',
    }));
  });
});
