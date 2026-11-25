import moment from "moment";

export const dateoptions = [
  { value: 'anydate', label: 'Any Date' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

export const getLabelDateType = (value) => {
  const foundOption = dateoptions.find(option => option.value == value);
  return foundOption ? foundOption.label : 'Any Date';
};

export const formatDateType = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const monthAbbr = date.toLocaleString('en-US', { month: 'short' }); // Example: "Nov" for November
  return `${day} ${monthAbbr}`;
};

export const formatDate = (dateString) => {
  if (!dateString || isNaN(Date.parse(dateString))) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const formatTimeUtc = (utcTimeString) => {
  if (!utcTimeString) return '';
  const utcDateTime = moment.utc(utcTimeString, 'HH:mm'); // Treat it as UTC
  const localTime = utcDateTime.local();
  return localTime.format('h:mm A');
};

export const sortoptions = [
  { value: 1, label: 'Nearest Distance' },
  { value: 2, label: 'Ongoing Event' },
  { value: 3, label: 'Upcoming Event' },
  { value: 4, label: 'Price High To Low' },
  { value: 5, label: 'Price Low To High' },
];

export const sortlabels = [
  { value: 1, label: 'HAPPENING AROUND YOU' },       // custom label for Nearest Distance
  { value: 2, label: 'ONGOING EVENTS' },
  { value: 3, label: 'UPCOMING EVENTS' },
  { value: 4, label: 'PRICE: HIGH TO LOW' },
  { value: 5, label: 'PRICE: LOW TO HIGH' },
];

export const getsortlabels = (value) => {
  const foundOption = sortlabels.find(option => option.value == value);
  return foundOption ? foundOption.label : 'HAPPENING AROUND YOU';
};