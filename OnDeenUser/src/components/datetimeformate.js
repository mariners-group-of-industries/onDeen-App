const today = new Date();
const currentYear = today.getFullYear();
const currentDate = today.toISOString().split('T')[0]; 
const nextYearDate = new Date(today);
nextYearDate.setFullYear(currentYear + 1);
const nextYearCurrentDate = nextYearDate.toISOString().split('T')[0]; 

const getTimeandhours = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();

  // Format the time
  const hour = date.getHours();
  const minutes = date.getMinutes();
  const period = hour >= 12 ? "PM" : "AM";
  const formattedHours = hour % 12 == 0 ? 12 : hour % 12; // Handle 12 AM/PM case
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero if needed

  // return `${day} ${month} ${year} ${formattedHours}:${formattedMinutes} ${period}`;
  return `${formattedHours}:${formattedMinutes} ${period}`;
};


const getDateFormate = (dateString) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "short" }); // Change 'long' to 'short'
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};


const colors = [
  '#DB3171', '#33FF57', '#3357FF', '#F2D7D5', '#7D3C98',
  '#F39C12', '#16A085', '#D35400', '#2980B9', '#8E44AD'
];

const getOnlyDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", { weekday: "short" }) + ",";
};


export {
  currentDate,
  nextYearCurrentDate,
  currentYear,
  getTimeandhours,
  getDateFormate,
  colors,
  getOnlyDayName
};