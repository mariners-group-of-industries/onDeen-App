import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {RootState} from '../store';

const auth = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken:
    state.user?.loginToken ||
    state.verifyOtp?.verifyOtp_access_token ||
    state.registerUser?.access_token,
});

export const fetchOneToOneSessions = createAsyncThunk(
  'oneToOneSessions/fetch',
  async (_, {getState, rejectWithValue}) => {
    const tokens = auth(getState() as RootState);
    const response = await apiRequest({
      url: '/organizer_app/event/get_request_buddy',
      method: 'POST',
      data: {type: 2},
      ...tokens,
    });
    if (!response?.status) {
      return rejectWithValue(response?.response?.message || response?.response || 'Unable to load sessions');
    }
    return response.response || [];
  },
);

export const updateOneToOneSession = createAsyncThunk(
  'oneToOneSessions/update',
  async (data: Record<string, any>, {getState, rejectWithValue}) => {
    const tokens = auth(getState() as RootState);
    const response = await apiRequest({
      url: '/organizer_app/event/update_status_request_buddy',
      method: 'POST',
      data,
      ...tokens,
    });
    if (!response?.status) {
      return rejectWithValue(response?.response?.message || response?.response || 'Unable to update session');
    }
    return response.response;
  },
);

export const fetchOneToOneAvailability = createAsyncThunk(
  'oneToOneSessions/fetchAvailability',
  async (speakerId: number, {getState, rejectWithValue}) => {
    const tokens = auth(getState() as RootState);
    const response = await apiGetRequest({
      url: '/organizer_app/speakers/get_availability',
      method: 'GET',
      params: {speaker_id: speakerId},
      ...tokens,
    });
    if (!response?.status) {
      return rejectWithValue(response?.response?.message || response?.response || 'Unable to load availability');
    }
    return {speakerId, availability: response.response};
  },
);

export const saveOneToOneAvailability = createAsyncThunk(
  'oneToOneSessions/saveAvailability',
  async (data: Record<string, any>, {getState, rejectWithValue}) => {
    const tokens = auth(getState() as RootState);
    const response = await apiRequest({
      url: '/organizer_app/speakers/save_availability',
      method: 'POST',
      data,
      ...tokens,
    });
    if (!response?.status) {
      return rejectWithValue(response?.response?.message || response?.response || 'Unable to save availability');
    }
    return response.response;
  },
);

const oneToOneSessionsSlice = createSlice({
  name: 'oneToOneSessions',
  initialState: {
    data: [] as any[],
    status: 'idle',
    updateStatus: 'idle',
    availability: null as any,
    availabilitySpeakerId: null as number | null,
    availabilityStatus: 'idle',
    availabilitySaveStatus: 'idle',
    error: null as string | null,
  },
  reducers: {
    clearOneToOneError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchOneToOneSessions.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchOneToOneSessions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchOneToOneSessions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = String(action.payload || 'Unable to load sessions');
      })
      .addCase(updateOneToOneSession.pending, state => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateOneToOneSession.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const updated = action.payload?.session;
        if (updated?.id) {
          state.data = state.data.map(item => item.id === updated.id ? {...item, ...updated} : item);
        }
      })
      .addCase(updateOneToOneSession.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = String(action.payload || 'Unable to update session');
      })
      .addCase(fetchOneToOneAvailability.pending, state => {
        state.availabilityStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchOneToOneAvailability.fulfilled, (state, action) => {
        state.availabilityStatus = 'succeeded';
        state.availabilitySpeakerId = action.payload.speakerId;
        state.availability = action.payload.availability;
      })
      .addCase(fetchOneToOneAvailability.rejected, (state, action) => {
        state.availabilityStatus = 'failed';
        state.error = String(action.payload || 'Unable to load availability');
      })
      .addCase(saveOneToOneAvailability.pending, state => {
        state.availabilitySaveStatus = 'loading';
        state.error = null;
      })
      .addCase(saveOneToOneAvailability.fulfilled, state => {
        state.availabilitySaveStatus = 'succeeded';
      })
      .addCase(saveOneToOneAvailability.rejected, (state, action) => {
        state.availabilitySaveStatus = 'failed';
        state.error = String(action.payload || 'Unable to save availability');
      });
  },
});

export const {clearOneToOneError} = oneToOneSessionsSlice.actions;
export default oneToOneSessionsSlice.reducer;
