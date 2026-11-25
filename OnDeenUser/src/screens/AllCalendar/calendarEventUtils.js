// helpers/calendarEventUtils.js
import moment from 'moment';

export const getFilteredCalendarEvents = (events = [], selectedDateString) => {
  const selectedDate = moment?.utc(selectedDateString);
  const selectedYear = selectedDate.year();
  const selectedMonth = selectedDate.month();
  const selectedWeekday = selectedDate.day();
  const backendWeekday = (selectedWeekday + 6) % 7; // iOS mapping

  const getOrdinalWeekdayInMonth = date => {
    const year = date.year();
    const month = date.month();
    const day = date.date();
    const weekday = date.day();

    let count = 0;
    for (let d = 1; d <= day; d++) {
      const temp = moment.utc([year, month, d]);
      if (temp.day() == weekday) count++;
    }
    return count;
  };

  const filterEventByDate = event => {
    const start = moment.utc(event.start_date);
    const end = moment.utc(event.end_date);
    const occusrType = event.occusr_type;
    const occusrMonth = event.occusr_month ?? 1;
    const occusrWeekdays = event.occusr_weekday
      ?.split(',')
      .map(w => parseInt(w.trim(), 10)) ?? [];

    const isInRange =
      selectedDate.isSameOrAfter(start, 'day') &&
      selectedDate.isSameOrBefore(end, 'day');

    switch (occusrType) {
      case 0: return isInRange; // Custom Range
      case 1: return selectedDate.isSame(start, 'day'); // Once
      case 2: return isInRange; // Daily
      case 3: return isInRange && occusrWeekdays.includes(backendWeekday); // Weekly
      case 4: {
        if (!isInRange) return false;
        const eventDay = start.date();
        const eventWeekday = start.day();
        const eventOrdinal = getOrdinalWeekdayInMonth(start);

        if (occusrMonth == 1) {
          return selectedDate.date() == eventDay;
        }

        if (occusrMonth == 2) {
          let count = 0;
          let match = false;
          const year = selectedDate.year();
          const month = selectedDate.month();

          for (let day = 1; day <= selectedDate.daysInMonth(); day++) {
            const temp = moment.utc([year, month, day]);
            if (temp.day() == eventWeekday) {
              count++;
              if (count == eventOrdinal && day == selectedDate.date()) {
                match = true;
                break;
              }
            }
          }

          return match;
        }

        return false;
      }
      default:
        return false;
    }
  };

  let filteredData = Array.isArray(events)
    ? events.filter(filterEventByDate)
    : [];

  if (filteredData.length == 0 && Array.isArray(events)) {
    filteredData = events.filter(event => {
      const eventStart = moment.utc(event.start_date);
      return (
        eventStart.year() == selectedYear &&
        eventStart.month() == selectedMonth
      );
    });
  }

  return filteredData.map(event => ({
    id: event.id,
    title: event.title,
    start_date: event.start_date,
    start_time: event.start_time,
    end_date: event.end_date,
    participant_id: event.participant_id,
    time_zone: event.time_zone,
  }));
};