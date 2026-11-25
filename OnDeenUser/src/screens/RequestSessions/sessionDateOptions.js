export const SESSION_DATE_WINDOW_DAYS = 14;

export const formatLocalDateId = date => [
  date.getFullYear(),
  String(date.getMonth() + 1).padStart(2, '0'),
  String(date.getDate()).padStart(2, '0'),
].join('-');

export const buildSessionDateOptions = (
  today = new Date(),
  numberOfDays = SESSION_DATE_WINDOW_DAYS,
) => Array.from({length: numberOfDays}, (_, offset) => {
  const date = new Date(today);
  date.setDate(today.getDate() + offset);
  const localDateId = formatLocalDateId(date);

  return {
    id: localDateId,
    date: localDateId,
    day: String(date.getDate()).padStart(2, '0'),
    weekday: date.toLocaleString('en-us', {weekday: 'short'}),
    status: 1,
  };
});
