// services/apiHelper.js
import axios from 'axios';
import { BASE_URL } from '../../../helpers/Constant';
import { getTimeZone } from 'react-native-localize';
import { getDebugApiResponse } from '../../../helpers/debugApiMocks';

export const makeApiCall = async ({
  url,
  method = 'POST',
  data = null,
  params = null,
  authToken = '',
  bearerToken = '',
  contentType = 'application/json',
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
      Timezone: getTimeZone(),
      ...(authToken && { 'auth-token': authToken }),
      ...(bearerToken && { Authorization: `Bearer ${bearerToken}` }),
    };





    const normalizedMethod = String(method || 'POST').toUpperCase();
    const requestConfig = {
      method: normalizedMethod,
      url: `${BASE_URL}${url}`,
      params,
      headers,
      timeout: 12000,
    };

    if (normalizedMethod !== 'GET' && normalizedMethod !== 'HEAD') {
      requestConfig.data = data;
    }

    const response = await axios(requestConfig);
    // console.log(response?.data, 'response?.dataresponse?.dataresponse?.dataresponse?.data');

    return response?.data;
  } catch (error) {
    const errData = error?.response?.data;
    console.log('[ERROR RESPONSE]', errData); // Optional: Log for debugging
    return error?.response?.data
  }

};
