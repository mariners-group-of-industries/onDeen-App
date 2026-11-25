import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { RootState } from '../store';

interface AllQrCodesState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  data: any[]; // Storing QR codes response
  message: string | null;
  error: string | null;
  apiStatus: boolean | null;
}

const initialState: AllQrCodesState = {
  status: 'idle',
  data: [],
  message: null,
  error: null,
  apiStatus: null,
};

// Helper function to get auth tokens
const getAuthTokens = (state: RootState) => ({
  authToken: state.token?.token?.access_token,
  bearerToken: state.user?.loginToken,
});

export const fetchAllQrCodes = createAsyncThunk(
  'allQrCodes/fetchAllQrCodes',
  async ({ participantId }: { participantId: number }, { getState, rejectWithValue }) => {
    const { authToken } = getAuthTokens(getState() as RootState);
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;

    try {
      const response = await apiRequest({
        url: `/customer_app/event/ticket_qrcodes`,
        method: 'POST',
        authToken,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        data: {
          participant_id: participantId,
        },
        contentType: 'application/json',
      });

     
      return response;
    } catch (error: any) {

        
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch QR codes.');
    }
  }
);

const allQrCodesSlice = createSlice({
  name: 'allQrCodes',
  initialState,
  reducers: {
    resetApiStatus: (state) => {
      state.apiStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllQrCodes.pending, (state) => {
        state.status = 'loading';
        state.apiStatus = null;
      })
      .addCase(fetchAllQrCodes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload || [];
        state.message = action.payload.message;
        state.apiStatus = action.payload.status;
      })
      .addCase(fetchAllQrCodes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.apiStatus = false;
      });
  },
});

export const { resetApiStatus } = allQrCodesSlice.actions;
export default allQrCodesSlice.reducer;
