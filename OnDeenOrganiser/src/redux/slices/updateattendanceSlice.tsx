import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';

export const updateattendanceAPI = createAsyncThunk(
  'organizer_app/event/update_attendance',
  async (
    qrcode: string | {qrcode: string; event_id?: number; roleType?: number},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;
    const payload = typeof qrcode === 'string' ? {qrcode} : qrcode;
    const roleType = typeof qrcode === 'string' ? 3 : Number(qrcode.roleType) || 3;
    if (typeof payload !== 'string' && 'roleType' in payload) {
      delete payload.roleType;
    }

    try {
      const response = await apiRequest({
        url: roleType === 5
          ? '/buddy_app/event/update_attendance'
          : '/organizer_app/event/update_attendance',
        method: 'POST',
        data: payload,
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });
      if (response?.status === true) return response;
      return rejectWithValue(response?.response?.message || 'Unable to verify this QR code.');
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Unable to verify this QR code.');
    }
  },
);

const updateattendanceSlice = createSlice({
  name: 'updateattendance',
  initialState: {
    status: 'idle',
    error: null,
    updateattendance: null,
  },
  reducers: {
    setupdateattendance(state, action) {
      state.updateattendance = action.payload;
    },
    cleanupdateattendance(state) {
      state.updateattendance = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(updateattendanceAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateattendanceAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.updateattendance = action.payload.response;
        state.error = null;
      })
      .addCase(updateattendanceAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) || action.error.message || 'Unable to verify this QR code.';
      });
  },
});

export const {cleanupdateattendance, setupdateattendance} =
  updateattendanceSlice.actions;
export default updateattendanceSlice.reducer;
