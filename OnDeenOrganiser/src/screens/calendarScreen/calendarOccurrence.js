const datePart = value => typeof value === 'string' ? value.slice(0, 10) : '';

const utcDate = value => {
  const normalized = datePart(value);
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? new Date(`${normalized}T00:00:00Z`)
    : null;
};

const mondayBasedWeekday = value => {
  const date = utcDate(value);
  return date ? (date.getUTCDay() + 6) % 7 : -1;
};

const selectedWeekdays = value => String(value || '')
  .split(',')
  .filter(entry => entry !== '')
  .map(Number);

export const eventOccursOnDate = (event, candidate) => {
  const date = datePart(candidate);
  const start = datePart(event?.start_date);
  const end = datePart(event?.end_date);
  if (!date || !start || !end || date < start || date > end) {
    return false;
  }

  switch (Number(event?.occusr_type || 1)) {
    case 1:
      return date === start;
    case 2:
      return true;
    case 3:
      return selectedWeekdays(event?.occusr_weekday).includes(mondayBasedWeekday(date));
    case 4: {
      const candidateDate = utcDate(date);
      const startDate = utcDate(start);
      if (!candidateDate || !startDate) {
        return false;
      }
      if (Number(event?.occusr_month || 1) === 2) {
        const occurrence = Math.floor((startDate.getUTCDate() - 1) / 7) + 1;
        return mondayBasedWeekday(date) === mondayBasedWeekday(start)
          && Math.floor((candidateDate.getUTCDate() - 1) / 7) + 1 === occurrence;
      }
      return candidateDate.getUTCDate() === startDate.getUTCDate();
    }
    default:
      return false;
  }
};

export const markedOccurrenceDates = events => {
  const marked = {};
  (Array.isArray(events) ? events : []).forEach(event => {
    const start = utcDate(event?.start_date);
    const end = utcDate(event?.end_date);
    if (!start || !end) {
      return;
    }
    for (let cursor = new Date(start); cursor <= end; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const value = cursor.toISOString().slice(0, 10);
      if (eventOccursOnDate(event, value)) {
        marked[value] = {
          color: '#DB3171',
          endingDay: true,
          startingDay: true,
          textColor: 'white',
        };
      }
    }
  });
  return marked;
};
