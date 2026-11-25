import {DateTime} from 'luxon';

const WEEKDAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

const dateOnly = (value, zone) => {
  if (!value) {
    return null;
  }

  const direct = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));
  if (direct) {
    return direct[1];
  }

  const parsers = [
    () => DateTime.fromHTTP(String(value), {zone: 'utc'}),
    () => DateTime.fromRFC2822(String(value), {zone: 'utc'}),
    () => DateTime.fromSQL(String(value), {zone: zone || 'utc'}),
  ];

  for (const parse of parsers) {
    const parsed = parse();
    if (parsed.isValid) {
      return parsed.setZone(zone || 'utc').toISODate();
    }
  }

  return null;
};

const timeParts = value => {
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(String(value || ''));
  if (!match) {
    return null;
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
    second: Number(match[3] || 0),
  };
};

const atEventTime = (dateValue, timeValue, zone) => {
  const day = dateOnly(dateValue, zone);
  const time = timeParts(timeValue);
  if (!day || !time) {
    throw new Error('This event has invalid date or time information.');
  }

  const [year, month, dayOfMonth] = day.split('-').map(Number);
  const result = DateTime.fromObject(
    {year, month, day: dayOfMonth, ...time},
    {zone: zone || 'utc'},
  );

  if (!result.isValid) {
    throw new Error('This event has invalid date or time information.');
  }
  return result;
};

const recurrenceEnd = (eventDetail, zone) => {
  const day = dateOnly(eventDetail?.end_date, zone);
  if (!day) {
    return null;
  }
  return DateTime.fromISO(day, {zone: zone || 'utc'})
    .endOf('day')
    .toUTC()
    .toISO();
};

const parsedWeekdays = (value, fallbackWeekday) => {
  const values = String(value ?? '')
    .split(',')
    .map(item => Number.parseInt(item.trim(), 10))
    .filter(item => Number.isInteger(item) && item >= 0 && item <= 6);
  const unique = [...new Set(values.length ? values : [fallbackWeekday])];
  return unique.map(index => WEEKDAY_CODES[index]);
};

const isoDuration = minutes => {
  const safeMinutes = Math.max(1, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainder = safeMinutes % 60;
  return `PT${hours ? `${hours}H` : ''}${remainder ? `${remainder}M` : ''}`;
};

export const buildDeviceCalendarEvent = eventDetail => {
  const zone = eventDetail?.time_zone || 'UTC';
  const start = atEventTime(eventDetail?.start_date, eventDetail?.start_time, zone);
  let end = atEventTime(eventDetail?.start_date, eventDetail?.end_time, zone);
  if (end <= start) {
    end = end.plus({days: 1});
  }

  const occurrenceType = Number(eventDetail?.occusr_type || 1);
  const seriesEnd = recurrenceEnd(eventDetail, zone);
  const duration = isoDuration(end.diff(start, 'minutes').minutes);
  let recurrenceRule;

  if (occurrenceType === 2 && seriesEnd) {
    recurrenceRule = {frequency: 'daily', interval: 1, endDate: seriesEnd, duration};
  } else if (occurrenceType === 3 && seriesEnd) {
    recurrenceRule = {
      frequency: 'weekly',
      interval: 1,
      endDate: seriesEnd,
      daysOfWeek: parsedWeekdays(eventDetail?.occusr_weekday, start.weekday - 1),
      duration,
    };
  } else if (occurrenceType === 4 && seriesEnd) {
    recurrenceRule = {frequency: 'monthly', interval: 1, endDate: seriesEnd, duration};
    if (Number(eventDetail?.occusr_month) === 2) {
      recurrenceRule.daysOfWeek = [WEEKDAY_CODES[start.weekday - 1]];
      recurrenceRule.weekPositionInMonth = Math.ceil(start.day / 7);
    }
  }

  const marker = `[OnDeen event ${eventDetail?.id}]`;
  const description = [eventDetail?.description, marker].filter(Boolean).join('\n\n');

  return {
    title: eventDetail?.title || 'OnDeen event',
    marker,
    isRecurring: Boolean(recurrenceRule),
    details: {
      startDate: start.toUTC().toISO(),
      endDate: end.toUTC().toISO(),
      allDay: false,
      location: eventDetail?.location || '',
      notes: description,
      description,
      url: eventDetail?.id ? `ondeen://event/${eventDetail.id}` : undefined,
      timeZone: zone,
      endTimeZone: zone,
      alarms: [{date: -15}],
      ...(recurrenceRule ? {recurrenceRule} : {}),
    },
  };
};

export const buildOneToOneCalendarEvent = session => {
  const zone = session?.time_zone || session?.speaker_time_zone || 'UTC';
  const start = atEventTime(session?.date, session?.time, zone);
  const rawDuration = Number(
    session?.duration_minutes ?? session?.one_to_one_duration_minutes ?? 60,
  );
  const durationMinutes = Number.isFinite(rawDuration) && rawDuration > 0
    ? Math.round(rawDuration)
    : 60;
  const end = start.plus({minutes: durationMinutes});
  const speakerName = [session?.speaker_first_name, session?.speaker_last_name]
    .filter(Boolean)
    .join(' ')
    .trim();
  const marker = `[OnDeen one-to-one ${session?.id}]`;
  const notes = [
    session?.event_title,
    session?.user_comment,
    session?.status_reason,
    marker,
  ].filter(Boolean).join('\n\n');

  return {
    title: speakerName ? `One-to-One with ${speakerName}` : 'OnDeen One-to-One Session',
    marker,
    isRecurring: false,
    details: {
      startDate: start.toUTC().toISO(),
      endDate: end.toUTC().toISO(),
      allDay: false,
      location: session?.location || '',
      notes,
      description: notes,
      url: session?.meet_link || (session?.id ? `ondeen://one-to-one/${session.id}` : undefined),
      timeZone: zone,
      endTimeZone: zone,
      alarms: [{date: -15}],
    },
  };
};
