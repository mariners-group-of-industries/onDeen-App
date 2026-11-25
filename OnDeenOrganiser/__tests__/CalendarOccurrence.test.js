import { eventOccursOnDate, markedOccurrenceDates } from '../src/screens/calendarScreen/calendarOccurrence';

const event = overrides => ({
  start_date: '2026-09-01T00:00:00',
  end_date: '2026-10-31T00:00:00',
  occusr_type: 1,
  ...overrides,
});

describe('organiser calendar recurrence', () => {
  it('keeps one-off and daily dates distinct', () => {
    expect(eventOccursOnDate(event({}), '2026-09-01')).toBe(true);
    expect(eventOccursOnDate(event({}), '2026-09-02')).toBe(false);
    expect(eventOccursOnDate(event({ occusr_type: 2 }), '2026-09-30')).toBe(true);
  });

  it('uses Monday-based weekday values for weekly sessions', () => {
    const weekly = event({ occusr_type: 3, occusr_weekday: '2,4' });
    expect(eventOccursOnDate(weekly, '2026-09-02')).toBe(true);
    expect(eventOccursOnDate(weekly, '2026-09-04')).toBe(true);
    expect(eventOccursOnDate(weekly, '2026-09-03')).toBe(false);
  });

  it('supports monthly same-day and same-weekday rules', () => {
    const sameDay = event({ start_date: '2026-09-09T00:00:00', occusr_type: 4, occusr_month: 1 });
    expect(eventOccursOnDate(sameDay, '2026-10-09')).toBe(true);
    expect(eventOccursOnDate(sameDay, '2026-10-08')).toBe(false);

    const secondWednesday = event({ start_date: '2026-09-09T00:00:00', occusr_type: 4, occusr_month: 2 });
    expect(eventOccursOnDate(secondWednesday, '2026-10-14')).toBe(true);
    expect(eventOccursOnDate(secondWednesday, '2026-10-07')).toBe(false);
  });

  it('marks only real recurrence days inside the listing range', () => {
    const marks = markedOccurrenceDates([
      event({ end_date: '2026-09-05T00:00:00', occusr_type: 3, occusr_weekday: '2,4' }),
    ]);
    expect(Object.keys(marks)).toEqual(['2026-09-02', '2026-09-04']);
  });
});
