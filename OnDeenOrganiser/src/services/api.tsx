import axios from 'axios';
import {BASE_URL} from '../helpers/Constant';

interface ApiConfig {
  url: string;
  method: 'GET' | 'POST' | 'DELETE';
  data?: any;
  authToken?: any;
  bearerToken?: any;
  contentType?: 'application/json' | 'multipart/form-data';
  params?: any;
}

const isDebugBypassSession = (bearerToken: any) =>
  typeof __DEV__ !== 'undefined' && __DEV__ && bearerToken === 'debug-token';

const debugBypassResponse = (url: string) => {
  if (url === '/organizer_app/profile/get_profile') {
    return {
      status: true,
      response: {
        organization_name: 'Debug Organizer',
        profile_image: null,
      },
    };
  }

  if (url === '/organizer_app/profile/dashboard') {
    return {
      status: true,
      response: {
        revenue: 0,
        event_count_this_week: 0,
      },
    };
  }

  if (url === '/organizer_app/event/get_all_event') {
    return {
      status: true,
      response: {
        events: [],
      },
    };
  }

  if (url === '/organizer_app/profile/wallet_transactions') {
    return {
      status: true,
      response: {
        transactions: [],
        wallet_transactions: [],
      },
    };
  }

  return {
    status: false,
    response: {
      message: 'Debug login has no backend session for this action.',
    },
  };
};

const apiErrorResponse = (message: string, statusCode?: number) => ({
  status: false,
  statusCode,
  response: {
    message,
  },
});

export const apiRequest = async ({
  url,
  method,
  data = null,
  authToken = '',
  bearerToken = '',
  contentType = 'application/json',
  params,
}: ApiConfig) => {
  try {
    if (isDebugBypassSession(bearerToken)) {
      return debugBypassResponse(url);
    }

    const headers = {
      'Content-Type': contentType,
      ...(authToken && {'auth-token': authToken}),
      ...(bearerToken && {Authorization: `Bearer ${bearerToken}`}),
    };

    //

    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      data,
      headers,
      params,
    });

    // console.log('API Response:', JSON.stringify(response));

    // Ensure response is a plain serializable object
    return JSON.parse(JSON.stringify(response.data));
  } catch (error: any) {
    if (error.response) {
      return apiErrorResponse(
        error.response.data?.response ||
          error.response.data?.message ||
          'Server error occurred',
        error.response.status,
      );
    } else if (error.request) {
      return apiErrorResponse('No response received from server');
    } else {
      return apiErrorResponse(error.message || 'Unknown error occurred');
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
}: ApiConfig) => {
  try {
    if (isDebugBypassSession(bearerToken)) {
      return debugBypassResponse(url);
    }

    const headers = {
      'Content-Type': contentType,
      ...(authToken && {'auth-token': authToken}),
      ...(bearerToken && {Authorization: `Bearer ${bearerToken}`}),
    };
   

    //

    const response = await axios({
      method,
      url: `${BASE_URL}${url}`,
      headers,
      params,
    });

    // Ensure response is a plain serializable object
    return JSON.parse(JSON.stringify(response.data));
  } catch (error: any) {
    if (error.response) {
      return apiErrorResponse(
        error.response.data?.response ||
          error.response.data?.message ||
          'Server error occurred',
        error.response.status,
      );
    } else if (error.request) {
      return apiErrorResponse('No response received from server');
    } else {
      return apiErrorResponse(error.message || 'Unknown error occurred');
    }
  }
};
