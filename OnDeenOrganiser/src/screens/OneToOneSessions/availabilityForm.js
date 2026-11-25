export const WEEKDAYS = [
  {id: 0, short: 'Mon', label: 'Monday'},
  {id: 1, short: 'Tue', label: 'Tuesday'},
  {id: 2, short: 'Wed', label: 'Wednesday'},
  {id: 3, short: 'Thu', label: 'Thursday'},
  {id: 4, short: 'Fri', label: 'Friday'},
  {id: 5, short: 'Sat', label: 'Saturday'},
  {id: 6, short: 'Sun', label: 'Sunday'},
];

const compactTime = value => String(value || '').slice(0, 5);

const uniqueCsv = value => [...new Set(
  String(value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean),
)];

const endTime = (start, durationMinutes) => {
  const match = /^(\d{1,2}):(\d{2})$/.exec(start);
  if (!match) {
    throw new Error(`Invalid time: ${start}. Use HH:MM.`);
  }
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  if (Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new Error(`Invalid time: ${start}. Use HH:MM.`);
  }
  const end = minutes + durationMinutes;
  if (end >= 24 * 60) {
    throw new Error('A one-to-one slot cannot continue into the next day.');
  }
  return `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
};

export const availabilityToForm = availability => {
  const weekdaySlots = {};
  (availability?.availability_days || []).forEach(day => {
    if (Number(day.status) === 1) {
      weekdaySlots[Number(day.weekday)] = (day.times || [])
        .filter(slot => Number(slot.status) === 1)
        .map(slot => compactTime(slot.start_time))
        .filter(Boolean)
        .join(', ');
    }
  });
  return {
    enabled: availability?.one_to_one_enabled !== false,
    locationType: Number(availability?.location_type ?? 2),
    durationMinutes: Number(availability?.duration_minutes || 60),
    weekdaySlots,
    unavailableDates: (availability?.availability_dates || [])
      .filter(item => Number(item.status) === 2)
      .map(item => String(item.date).slice(0, 10))
      .join(', '),
  };
};

export const buildAvailabilityPayload = ({speakerId, form, current, timeZone}) => {
  const existingDays = new Map(
    (current?.availability_days || []).map(day => [Number(day.weekday), day]),
  );
  const duration = Number(form.durationMinutes);
  const availabilityDays = WEEKDAYS.map(({id}) => {
    const existing = existingDays.get(id);
    const starts = uniqueCsv(form.weekdaySlots[id]);
    if (!starts.length && !existing) {
      return null;
    }
    const existingTimes = new Map(
      (existing?.times || []).map(slot => [compactTime(slot.start_time), slot]),
    );
    const activeTimes = starts.map(start => ({
      ...(existingTimes.get(start)?.id ? {id: existingTimes.get(start).id} : {}),
      start_time: start,
      end_time: endTime(start, duration),
      status: 1,
    }));
    const removedTimes = (existing?.times || [])
      .filter(slot => !starts.includes(compactTime(slot.start_time)))
      .map(slot => ({
        id: slot.id,
        start_time: compactTime(slot.start_time),
        end_time: compactTime(slot.end_time),
        status: 2,
      }));
    return {
      ...(existing?.id ? {id: existing.id} : {}),
      weekday: id,
      status: starts.length ? 1 : 2,
      times: [...activeTimes, ...removedTimes],
    };
  }).filter(Boolean);

  const existingDates = new Map(
    (current?.availability_dates || []).map(item => [String(item.date).slice(0, 10), item]),
  );
  const unavailableDates = uniqueCsv(form.unavailableDates);
  const availabilityDates = unavailableDates.map(date => ({
    ...(existingDates.get(date)?.id ? {id: existingDates.get(date).id} : {}),
    date,
    status: 2,
  }));
  (current?.availability_dates || [])
    .filter(item => Number(item.status) === 2)
    .filter(item => !unavailableDates.includes(String(item.date).slice(0, 10)))
    .forEach(item => availabilityDates.push({
      id: item.id,
      date: String(item.date).slice(0, 10),
      remove: true,
    }));

  return {
    speaker_id: Number(speakerId),
    time_zone: timeZone || 'UTC',
    one_to_one_enabled: Boolean(form.enabled),
    location_type: Number(form.locationType),
    duration_minutes: duration,
    availability_days: availabilityDays,
    availability_dates: availabilityDates,
  };
};
