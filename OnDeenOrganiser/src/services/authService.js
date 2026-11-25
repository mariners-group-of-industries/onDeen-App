import {apiRequest} from './api';

export const organizerEmailSendOtpAPI = ({email_id, authToken}) => {
  return apiRequest({
    url: '/organizer_app/login/email_send_otp',
    method: 'POST',
    data: {email_id},
    authToken,
    contentType: 'application/json',
  });
};

export const organizerEmailVerifyOtpAPI = ({email_id, otp, authToken}) => {
  return apiRequest({
    url: '/organizer_app/login/email_verify_otp',
    method: 'POST',
    data: {email_id, otp},
    authToken,
    contentType: 'application/json',
  });
};

export const organizerRegisterSocialAPI = ({data, authToken}) => {
  return apiRequest({
    url: '/organizer_app/login/register_social',
    method: 'POST',
    data,
    authToken,
    contentType: 'application/json',
  });
};

export const organizerChangePasswordAPI = ({new_password, bearerToken}) => {
  return apiRequest({
    url: '/organizer_app/login/change_password',
    method: 'POST',
    data: {new_password},
    bearerToken,
    contentType: 'application/json',
  });
};
