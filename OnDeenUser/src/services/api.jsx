import axios from 'axios';
import { BASE_URL } from '../helpers/Constant';
import { getTimeZone } from 'react-native-localize';
import { getDebugApiResponse } from '../helpers/debugApiMocks';

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Response interceptor for auto logout
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.log('API Error Response:', error.response.status, error.response.data);
      const status = error.response.status;
      
      if (status === 403 || status === 503) {
        if (logoutHandler) {
          console.log(`Auto logout triggered due to ${status} status`);
          logoutHandler();
        } else {
          console.log(`Logout handler not set. Received ${status} status.`);
          // You might want to show a message or handle this case
        }
      }
    }
    return Promise.reject(error);
  }
);

// Your existing apiRequest and apiGetRequest functions remain the same
export const apiRequest = async ({
  url,
  method,
  data = null,
  authToken = '',
  bearerToken = '',
  contentType = 'application/json',
  params,
}) => {
  try {
    const debugResponse = getDebugApiResponse({
      url,
      data,
      authToken,
      bearerToken,
    });

    if (debugResponse) {
      return debugResponse;
    }

    const headers = {
      'Content-Type': contentType,
      'Timezone': getTimeZone(),
      ...(authToken && { 'auth-token': authToken }),
      ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
    };

    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
      params,
      timeout: 12000,
    });
    return JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Server error occurred');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};

export const apiGetRequest = async ({
  url,
  method,
  authToken = '',
  bearerToken = '',
  contentType = 'application/json',
  params,
}) => {
  try {
    const debugResponse = getDebugApiResponse({
      url,
      authToken,
      bearerToken,
    });

    if (debugResponse) {
      return debugResponse;
    }

    const headers = {
      'Content-Type': contentType,
      'Timezone': getTimeZone(),
      ...(authToken && { 'auth-token': authToken }),
      ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
    };

    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      headers,
      params,
      timeout: 12000,
    });
    return JSON.parse(JSON.stringify(response.data));
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data?.message || 'Server error occurred');
    } else if (error.request) {
      throw new Error('No response received from server');
    } else {
      throw new Error(error.message || 'Unknown error occurred');
    }
  }
};
