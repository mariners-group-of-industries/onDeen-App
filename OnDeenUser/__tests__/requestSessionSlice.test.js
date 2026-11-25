import {apiRequest} from '../src/services/api';
import {requestSessionCall} from '../src/redux/slices/requestSessionSlice';

jest.mock('@reduxjs/toolkit', () => ({
  createSlice: () => ({reducer: () => null}),
  createAsyncThunk: (type, payloadCreator) => payload => async (dispatch, getState) => {
    const result = await payloadCreator(payload, {
      dispatch,
      getState,
      rejectWithValue: value => ({rejected: true, value}),
    });

    if (result?.rejected) {
      return {type: `${type}/rejected`, payload: result.value};
    }
    return {type: `${type}/fulfilled`, payload: result};
  },
}));

jest.mock('../src/services/api', () => ({
  apiRequest: jest.fn(),
}));

const state = {
  token: {token: {access_token: 'app-token'}},
  user: {loginToken: 'user-token'},
  verifyOtp: {verifyOtp_access_token: null},
  registerUser: {access_token: null},
};

const request = {
  eventId: 1,
  type: 2,
  speakerId: 16,
  date: '2026-09-05',
  time: '17:00:00',
  userComment: 'Reference session request',
};

describe('requestSessionCall', () => {
  beforeEach(() => {
    apiRequest.mockReset();
  });

  it('surfaces the Backend slot validation message', async () => {
    apiRequest.mockResolvedValue({
      status: false,
      response: {message: 'No available slot for this time'},
    });

    const action = await requestSessionCall(request)(jest.fn(), () => state, undefined);

    expect(action.type).toBe('session/requestSession/rejected');
    expect(action.payload).toBe('No available slot for this time');
  });

  it('returns the pending session payload on success', async () => {
    apiRequest.mockResolvedValue({
      status: true,
      response: {
        message: 'Session request sent and pending approval.',
        request_session: 1,
        session_id: 6,
        session_status: 0,
      },
    });

    const action = await requestSessionCall(request)(jest.fn(), () => state, undefined);

    expect(action.type).toBe('session/requestSession/fulfilled');
    expect(action.payload).toMatchObject({session_id: 6, session_status: 0});
  });
});
