import moment from 'moment-timezone';

const Commas = num => {
  if (num == undefined || num == null || isNaN(num)) {
    return 'N/A';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const formatDate = dateString => {
  const date = moment(dateString).isValid() ? moment(dateString) : moment();
  const day = String(date.date()).padStart(2, '0'); // Get day and ensure it's two digits
  const month = String(date.month() + 1).padStart(2, '0'); // Get month (1-12) and ensure it's two digits
  const year = date.year();
  return `${day}-${month}-${year}`;
};

const formatTime = dateString => {
  const rawValue = typeof dateString === 'string' ? dateString.trim() : dateString;
  const parsedTime = typeof rawValue === 'string'
    ? moment(rawValue, ['HH:mm:ss', 'HH:mm', 'h:mm A', 'h:mmA'], true)
    : null;
  const parsedDate = parsedTime?.isValid() ? parsedTime : moment(rawValue);
  const date = parsedDate.isValid() ? parsedDate.toDate() : new Date();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const amPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${amPm}`;
};

const formatDay = dateString => {
  const date = moment(dateString).isValid()
    ? moment(dateString).toDate()
    : new Date();
  return date.toLocaleString('default', {weekday: 'long'});
};

function convertTo24HourFormat(time) {
  const [timePart, modifier] = time.split(' ');
  const [hours, minutes] = timePart.split(':');

  let hour = parseInt(hours, 10);
  if (modifier === 'PM' && hour !== 12) {
    hour += 12;
  } else if (modifier === 'AM' && hour === 12) {
    hour = 0;
  }

  const formattedHour = hour.toString().padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');
  const seconds = '00';

  return `${formattedHour}:${formattedMinutes}:${seconds}`;
}
function formatDateToISO(dateString) {
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(dateString)) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return date.toISOString().split('T')[0];
  }

  const europeanPattern = /^\d{2}-\d{2}-\d{4}$/;
  if (europeanPattern.test(dateString)) {
    const [day, month, year] = dateString.split('-');
    const formattedDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(formattedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return formattedDate.toISOString().split('T')[0];
  }

  const usPattern = /^\d{2}\/\d{2}\/\d{4}$/;
  if (usPattern.test(dateString)) {
    const [month, day, year] = dateString.split('/');
    const formattedDate = new Date(`${year}-${month}-${day}`);
    if (isNaN(formattedDate.getTime())) {
      throw new Error('Invalid date format');
    }
    return formattedDate.toISOString().split('T')[0];
  }

  throw new Error(
    'Invalid date format. Supported formats are YYYY-MM-DD, DD-MM-YYYY, MM/DD/YYYY.',
  );
}

function calculateDays(startDateStr, endDateStr) {
  const [startDay, startMonth, startYear] = startDateStr.split('-').map(Number);
  const [endDay, endMonth, endYear] = endDateStr.split('-').map(Number);

  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  const differenceInMs = endDate - startDate;

  const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

  return differenceInDays + 1;
}

const getDatewithmonthname = dateString => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', {month: 'long'});
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

const today = new Date();
const currentYear = today.getFullYear();
const currentDate = today.toISOString().split('T')[0]; 
const nextYearDate = new Date(today);
nextYearDate.setFullYear(currentYear + 1);
const nextYearCurrentDate = nextYearDate.toISOString().split('T')[0]; 


const nocommavalue = num => {
  if (num === undefined || num === null || isNaN(num)) {
    return 'N/A';
  }
  return Math.floor(num);
};

const formatDatewithtime = dateString => {
  const date = moment(dateString).isValid() ? moment(dateString) : moment();
  
  const formattedDate = date.format('DD MMM YYYY, h:mmA').toLowerCase(); 
  
  return formattedDate;
};

export {
  formatDate,
  formatTime,
  Commas,
  formatDay,
  convertTo24HourFormat,
  formatDateToISO,
  calculateDays,
  getDatewithmonthname,
  currentDate,
  nextYearCurrentDate,
  currentYear,
  nocommavalue,
  formatDatewithtime
};
