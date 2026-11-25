import { makeApiCall } from './apiHelper';
import { store } from '../../store';
import { extractAuthTokens } from './extractAuthTokens';

export const callAuthorizedApi = ({ url, method = 'GET', data = {}, params = {} }) => {
  const state = store.getState();
  const { authToken, bearerToken } = extractAuthTokens(state);

  return makeApiCall({
    url,
    method,
    data,
    params,
    authToken,
    bearerToken,
  });
};
