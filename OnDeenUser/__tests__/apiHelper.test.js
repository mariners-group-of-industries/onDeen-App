import axios from 'axios';
import { makeApiCall } from '../src/redux/callapis/apimethodimp/apiHelper';

jest.mock('axios', () => jest.fn());
jest.mock('react-native-localize', () => ({
  getTimeZone: () => 'Europe/London',
}));
jest.mock('../src/helpers/debugApiMocks', () => ({
  getDebugApiResponse: () => null,
}));

describe('makeApiCall request bodies', () => {
  beforeEach(() => {
    axios.mockReset();
    axios.mockResolvedValue({ data: { status: true } });
  });

  it('omits a request body for GET calls', async () => {
    await makeApiCall({
      url: '/customer_app/users/gamification_summary',
      method: 'GET',
      data: {},
      params: { requested_at: 123 },
      bearerToken: 'test-token',
    });

    expect(axios).toHaveBeenCalledTimes(1);
    expect(axios.mock.calls[0][0]).not.toHaveProperty('data');
    expect(axios.mock.calls[0][0]).toMatchObject({
      method: 'GET',
      params: { requested_at: 123 },
    });
  });

  it('keeps the request body for POST calls', async () => {
    const data = { event_id: 3 };

    await makeApiCall({
      url: '/customer_app/event/event',
      method: 'POST',
      data,
    });

    expect(axios.mock.calls[0][0]).toMatchObject({
      method: 'POST',
      data,
    });
  });
});
