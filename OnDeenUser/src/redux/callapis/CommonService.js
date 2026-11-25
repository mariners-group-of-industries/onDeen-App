import { callAuthorizedApi } from "./apimethodimp/commonapiMethod";
import { makeApiCall } from "./apimethodimp/apiHelper";


export const getNotificationsAPI = () => {

  return callAuthorizedApi({
    url: '/customer_app/users/get_notifications',
    method: 'GET',
  });
};

export const getFilterListOptions = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/event/filter',
    method: 'POST',
    data,
  });
};


export const userLogout = () => {

  return callAuthorizedApi({
    url: '/customer_app/users/logout',
    method: 'GET',
  });
};

export const createRegisterSocial = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/users/register_social',
    method: 'POST',
    data,
  });
};


export const emailSendOtpAPI = (data) => {
  console.log(data, 'data');
  
  return callAuthorizedApi({
    url: '/customer_app/users/email_send_otp',
    method: 'POST',
    data,
  });
};


export const sendEmailAPI = (data) => {
  
  return callAuthorizedApi({
    url: '/customer_app/users/send_email',
    method: 'POST',
    data,
  });
};

export const emailVerifyOtpAPI = (data) => {
  
  return callAuthorizedApi({
    url: '/customer_app/users/email_verify_otp',
    method: 'POST',
    data,
  });
};


export const createNewAccount = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/users/register',
    method: 'POST',
    data,
  });
};

export const imcfetchBookingList = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/event/booking_list',
    method: 'POST',
    data,
  });
};

export const fetchOneToOneSessionsAPI = () => {
  return callAuthorizedApi({
    url: '/customer_app/event/get_request_buddy_list',
    method: 'POST',
    data: { type: 2 },
  });
};

export const PaymentStatusUpdate = async (data) => {
  const orderKey = data?.payment_order_key || data?.order_key;
  if (!orderKey) {
    throw new Error('Missing payment order reference');
  }
  return callAuthorizedApi({
    url: `/payment/orders/${encodeURIComponent(orderKey)}`,
    method: 'POST',
    data: data?.recovery_token ? { recovery_token: data.recovery_token } : {},
  });
};

export const requestPaymentRefundAPI = data => callAuthorizedApi({
  url: '/payment/refunds',
  method: 'POST',
  data,
});


export const eventBookingAPI = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/event/booking',
    method: 'POST',
    data,
  });
};

export const guestBookingAPI = (data) => {
  return makeApiCall({
    url: '/customer_app/event/guest_booking',
    method: 'POST',
    data,
  });
};

export const migrateGuestBookingsAPI = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/event/guest_booking_migrate',
    method: 'POST',
    data,
  });
};

export const participantListEventID = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/event/participant_list',
    method: 'POST',
    data,
  });
};

export const eventbyIdAPI = (id, participant_id = null) => {
  return callAuthorizedApi({
    url: participant_id ? `/customer_app/event/event_id?id=${id}&participant_id=${participant_id}` : `/customer_app/event/event_id?id=${id}`,
    method: 'GET',
  });
};

export const publicEventbyIdAPI = (id) => {
  return makeApiCall({
    url: `/customer_app/event/event_id?id=${id}`,
    method: 'GET',
  });
};
export const questionAnswersAPI = (id) => {
  return callAuthorizedApi({
    url: `/customer_app/event/question_and_answers/${id}`,
    method: 'GET',
  });
};


export const callHomepageCategory = () =>
  callAuthorizedApi({ url: '/customer_app/home/get_category', method: 'GET' });

export const publicHomepageCategory = () =>
  makeApiCall({ url: '/customer_app/home/get_category', method: 'GET' });

export const publicHomepageData = () =>
  makeApiCall({ url: '/customer_app/home/home', method: 'GET' });

export const filterAllHomePageEvents = (data) => {
  return callAuthorizedApi({
    url: `/customer_app/event/event`,
    method: 'POST',
    data: data,
  });
};

export const updateStatusRequestBuddy = ({ data }) => {

  return callAuthorizedApi({
    url: '/customer_app/event/update_status_request_buddy',
    method: 'POST',
    data,
  });
};

export const callAPiforAllCalender = ({ data }) => {
  console.log(data, 'PAYLOAD TO CHECK CALENDER');
  
  return callAuthorizedApi({
    url: '/customer_app/event/booking_list',
    method: 'POST',
    data,
  });
};

export const checkInforEvent = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/event/check_in',
    method: 'POST',
    data,
  });
};

export const onlineCheckInAPI = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/event/online_check_in',
    method: 'POST',
    data,
  });
};

export const debugCompleteBookingAPI = (data = {}) => {
  return callAuthorizedApi({
    url: '/customer_app/event/debug_complete_booking',
    method: 'POST',
    data,
  });
};

export const sendOtpAPI = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/users/send_otp',
    method: 'POST',
    data,
  });
};




export const addEventQuestion = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/event/add_event_question',
    method: 'POST',
    data,
  });
};

export const addEventNotes = ({ data }) => {

  return callAuthorizedApi({
    url: '/customer_app/event/event_note_add',
    method: 'POST',
    data,
  });
};


export const getEventNoteslist = ({ data }) => {

  return callAuthorizedApi({
    url: '/customer_app/event/get_all_event_note',
    method: 'POST',
    data,
  });
};


export const getTicketQRcodesAPI = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/event/ticket_qrcodes',
    method: 'POST',
    data,
  });
};

export const insertPushTokenAPI = ({ data }) => {
  return callAuthorizedApi({
    url: '/customer_app/users/insert_push_token',
    method: 'POST',
    data,
  });
};

export const checkVersionApi = ({ data }) => {
  console.log('====================================');
  console.log(data, 'PAYLOAD');
  console.log('====================================');
  return callAuthorizedApi({
    url: '/customer_app/users/check_version',
    method: 'POST',
    data,
  });
};

export const getUserProfileAPI = ({ data }) => {

  return callAuthorizedApi({
    url: '/customer_app/event/get_user_profile',
    method: 'POST',
    data,
  });
};
export const getSelfProfileAPI = () => {
  return callAuthorizedApi({
    url: '/customer_app/users/get_profile',
    method: 'GET',
  });
};

export const getGamificationProfileAPI = () => {
  return callAuthorizedApi({
    url: '/customer_app/users/gamification_profile',
    method: 'GET',
  });
};

export const getPendingGamificationSummaryAPI = () => {
  return callAuthorizedApi({
    url: '/customer_app/users/gamification_summary',
    method: 'GET',
    params: { requested_at: Date.now() },
  });
};

export const markGamificationSummarySeenAPI = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/users/gamification_summary_seen',
    method: 'POST',
    data,
  });
};

export const submitSessionFeedbackAPI = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/users/session_feedback',
    method: 'POST',
    data,
  });
};

export const skipSessionFeedbackAPI = (data) => {
  return callAuthorizedApi({
    url: '/customer_app/users/session_feedback_skip',
    method: 'POST',
    data,
  });
};


export const addRatingAPI = (data) => {

  return callAuthorizedApi({
    url: '/customer_app/event/add_rating',
    method: 'POST',
    data,
  });
};

export const callhomeoage = () =>
  callAuthorizedApi({ url: '/customer_app/home/home', method: 'GET' });

export const orfderdeatils = () =>
  callAuthorizedApi({ url: '/customer_app/home/home', method: 'GET' });

export const biookslist = () =>
  callAuthorizedApi({ url: '/customer_app/home/home', method: 'GET' });

export const apsnahfhh = () =>
  callAuthorizedApi({ url: '/customer_app/home/home', method: 'GET' });

export const dhshfgfhs = () =>
  callAuthorizedApi({ url: '/customer_app/home/home', method: 'GET' });

export const checkInToEvent = ({ data }) =>
  callAuthorizedApi({
    url: '/customer_app/home/home',
    method: 'POST',
    data: data
  });
