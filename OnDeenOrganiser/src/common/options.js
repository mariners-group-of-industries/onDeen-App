import Events from '../assets/images/Events.png';
import Tours from '../assets/images/Tours.png';
import Courses from '../assets/images/Courses.png';

const twentyarray = Array.from({length: 20}, (_, index) => ({
  value: index + 1,
  label: index + 1,
}));
const getEventTitle = value => {
  let title = value == 2 ? 'Course' : value == 3 ? 'Tour' : 'Event';
  return title;
};
const getEventImageurl = value => {
  let title = value == 2 ? Courses : value == 3 ? Tours : Events;
  return title;
};
export {twentyarray, getEventTitle, getEventImageurl};
