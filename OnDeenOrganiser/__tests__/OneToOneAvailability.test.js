import {
  availabilityToForm,
  buildAvailabilityPayload,
} from '../src/screens/OneToOneSessions/availabilityForm';

describe('one-to-one availability form', () => {
  const current = {
    one_to_one_enabled: true,
    location_type: 2,
    duration_minutes: 60,
    availability_days: [{
      id: 7,
      weekday: 5,
      status: 1,
      times: [{id: 9, start_time: '17:00:00', end_time: '18:00:00', status: 1}],
    }],
    availability_dates: [{id: 11, date: '2026-09-12', status: 2, times: []}],
  };

  it('hydrates the sacred Saturday slot and unavailable date', () => {
    expect(availabilityToForm(current)).toMatchObject({
      enabled: true,
      locationType: 2,
      durationMinutes: 60,
      weekdaySlots: {5: '17:00'},
      unavailableDates: '2026-09-12',
    });
  });

  it('preserves IDs while changing duration and adding a second slot', () => {
    const payload = buildAvailabilityPayload({
      speakerId: 16,
      timeZone: 'Europe/London',
      current,
      form: {
        ...availabilityToForm(current),
        durationMinutes: 45,
        weekdaySlots: {5: '17:00, 18:30'},
      },
    });
    expect(payload).toMatchObject({
      speaker_id: 16,
      duration_minutes: 45,
      location_type: 2,
      time_zone: 'Europe/London',
    });
    expect(payload.availability_days[0]).toMatchObject({id: 7, weekday: 5, status: 1});
    expect(payload.availability_days[0].times).toEqual([
      {id: 9, start_time: '17:00', end_time: '17:45', status: 1},
      {start_time: '18:30', end_time: '19:15', status: 1},
    ]);
    expect(payload.availability_dates).toEqual([{id: 11, date: '2026-09-12', status: 2}]);
  });

  it('explicitly disables removed slots and removes cleared date overrides', () => {
    const payload = buildAvailabilityPayload({
      speakerId: 16,
      timeZone: 'Europe/London',
      current,
      form: {
        ...availabilityToForm(current),
        weekdaySlots: {},
        unavailableDates: '',
      },
    });
    expect(payload.availability_days[0]).toMatchObject({id: 7, weekday: 5, status: 2});
    expect(payload.availability_days[0].times[0]).toMatchObject({id: 9, status: 2});
    expect(payload.availability_dates).toEqual([{id: 11, date: '2026-09-12', remove: true}]);
  });
});
