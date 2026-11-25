import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {showResponce} from '../../responce/showResponce';

export const participantbyidAPI = createAsyncThunk(
  'event/participant_list',
  async (id: {id: string}, {getState, rejectWithValue}) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;

    try {
      const response = await apiRequest({
        url: '/organizer_app/event/participant_list',
        method: 'POST',
        data: {
          event_id: id,
        },
        authToken: token,
        bearerToken: bearerToken,
        contentType: 'application/json',
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }
      //

      return response;
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to login');
    }
  },
);

const participantidSlice = createSlice({
  name: 'participantlist',
  initialState: {
    status: 'idle',
    error: null,
    participantlist: null,
  },
  reducers: {
    setParticipantlistbyid(state, action) {
      state.participantlist = action.payload;
    },
    cleanparticipantlistbyid(state) {
      state.participantlist = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(participantbyidAPI.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(participantbyidAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.participantlist = action.payload.response;
        state.error = null;
      })
      .addCase(participantbyidAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const {cleanparticipantlistbyid, setParticipantlistbyid} =
  participantidSlice.actions;
export default participantidSlice.reducer;
