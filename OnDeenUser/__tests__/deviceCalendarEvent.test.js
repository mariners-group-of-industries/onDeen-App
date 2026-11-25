import {
  buildDeviceCalendarEvent,
  buildOneToOneCalendarEvent,
} from '../src/screens/AddToCalendar/deviceCalendarEvent';

describe('device calendar event mapping', () => {
  const knowledgeClass = {
    id: 1,
    title: 'The Knowledge Class',
    start_date: 'Wed, 28 Jan 2026 00:00:00 GMT',
    end_date: 'Thu, 31 Dec 2026 00:00:00 GMT',
    start_time: '19:30:00',
    end_time: '20:30:00',
    time_zone: 'Europe/London',
    occusr_type: 3,
    occusr_weekday: '2',
    location: '565A High Rd, London N17 6SN, UK',
    description: 'Reference description',
  };

  it('creates one linked weekly series from the sacred Knowledge Class fields', () => {
    const result = buildDeviceCalendarEvent(knowledgeClass);

    expect(result.title).toBe('The Knowledge Class');
    expect(result.isRecurring).toBe(true);
    expect(result.details.startDate).toBe('2026-01-28T19:30:00.000Z');
    expect(result.details.endDate).toBe('2026-01-28T20:30:00.000Z');
    expect(result.details.recurrenceRule).toMatchObject({
      frequency: 'weekly',
      interval: 1,
      daysOfWeek: ['WE'],
      duration: 'PT1H',
    });
    expect(result.details.recurrenceRule.endDate).toBe('2026-12-31T23:59:59.999Z');
    expect(result.details.notes).toContain('[OnDeen event 1]');
    expect(result.details.alarms).toEqual([{date: -15}]);
  });

  it('keeps one-off listings free of a recurrence rule', () => {
    const result = buildDeviceCalendarEvent({...knowledgeClass, occusr_type: 1});
    expect(result.isRecurring).toBe(false);
    expect(result.details.recurrenceRule).toBeUndefined();
  });

  it('maps monthly weekday recurrence without expanding independent events', () => {
    const result = buildDeviceCalendarEvent({
      ...knowledgeClass,
      start_date: 'Mon, 14 Sep 2026 00:00:00 GMT',
      end_date: 'Mon, 14 Dec 2026 00:00:00 GMT',
      occusr_type: 4,
      occusr_month: 2,
    });
    expect(result.details.recurrenceRule).toMatchObject({
      frequency: 'monthly',
      daysOfWeek: ['MO'],
      weekPositionInMonth: 2,
    });
  });

  it('maps an approved one-to-one session with an idempotency marker', () => {
    const result = buildOneToOneCalendarEvent({
      id: 41,
      date: '2026-09-05',
      time: '17:00:00',
      time_zone: 'Europe/London',
      one_to_one_duration_minutes: 45,
      speaker_first_name: 'Sheikh Habib',
      speaker_last_name: 'Hassan',
      event_title: 'The Knowledge Class',
      meet_link: 'https://meet.example/session-41',
    });

    expect(result.title).toBe('One-to-One with Sheikh Habib Hassan');
    expect(result.isRecurring).toBe(false);
    expect(result.details.startDate).toBe('2026-09-05T16:00:00.000Z');
    expect(result.details.endDate).toBe('2026-09-05T16:45:00.000Z');
    expect(result.details.url).toBe('https://meet.example/session-41');
    expect(result.details.notes).toContain('[OnDeen one-to-one 41]');
    expect(result.details.alarms).toEqual([{date: -15}]);
  });
});
