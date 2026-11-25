// helpers/dateUtils.js
export const getEventsForDate = (filteredData = [], selectedDateString) => {
    // console.log(filteredData, selectedDateString, 'filteredData = [], selectedDateString');
    
  const selectedDate = new Date(selectedDateString);
  const adjustedWeekday = (selectedDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6
  const selectedDay = selectedDate.getDate();

  return Array.isArray(filteredData)
    ? filteredData.filter(event => {
        const eventStartDateString = event.start_date?.split('T')?.[0];
        const eventEndDateString = event.end_date?.split('T')?.[0];
        const eventStartDate = new Date(eventStartDateString);
        const eventEndDate = new Date(eventEndDateString);
        const selected = new Date(selectedDateString);

        const isInRange =
          selectedDateString >= eventStartDateString &&
          selectedDateString <= eventEndDateString;
        if (!isInRange) return false;

        // Weekly recurring
        if (event.occusr_type == 3) {
          const weekdays = event.occusr_weekday
            ?.split(',')
            .map(day => parseInt(day.trim()));
          return weekdays?.includes(adjustedWeekday);
        }

        // Monthly recurring
        if (event.occusr_type == 4) {
          const eventDay = eventStartDate.getDate();
          const eventWeekday = (eventStartDate.getDay() + 6) % 7; // Adjusted for Monday start
          const eventMonth = eventStartDate.getMonth();
          const selectedMonth = selected.getMonth();

          if (event.occusr_month == 1) {
            // Match same date every month (e.g., 5th of each month)
            return selected.getDate() == eventDay;
          }

          if (event.occusr_month == 2) {
            // Match same weekday occurrence every month (e.g., 2nd Monday)
            const selectedOccurrence = getDayOccurrenceInMonth(selected);
            const eventOccurrence = getDayOccurrenceInMonth(eventStartDate);

            return (
              adjustedWeekday == eventWeekday &&
              selectedOccurrence == eventOccurrence
            );
          }
        }

        // Default match for other types (once, daily, etc.)
        return true;
      })
    : [];
};

// Helper to calculate nth weekday of the month
function getDayOccurrenceInMonth(date) {
  const day = date.getDate();
  return Math.ceil(day / 7); // 1st, 2nd, 3rd, 4th, 5th occurrence
}
