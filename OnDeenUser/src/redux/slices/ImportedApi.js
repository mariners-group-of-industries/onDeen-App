// apis.ts
import { apiRequest } from '../../services/api';

export const impfetchBookingList = async () => {
  try {
    const response = await apiRequest({
      url: '/customer_app/event/booking_list',
      method: 'POST',
      contentType: 'application/json',
      data: {
        type: 1,
        from_date: '2025-07-01',
        to_date: '2025-07-31',
      },
    });

    return response;
  } catch (error) {

  }
};

export const fetchBookings = async () => {
  try {
    const res = await apiRequest({
      url: '/customer_app/event/booking_list',
      method: 'POST',
      contentType: 'application/json',
      data: {
        type: 1,
        from_date: '2025-07-01',
        to_date: '2025-07-31',
      },
    });

    return res;
  } catch (error) {

    return null;
  }
};
