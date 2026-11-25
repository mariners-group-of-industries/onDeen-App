
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';


export const getallmastereventListing = createAsyncThunk(
  'event/get_all_event',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    const bearerToken = (getState() as any).user.loginToken;
    
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/event/get_master_data',
        method: 'GET',
        authToken: token,
        bearerToken: bearerToken,
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        showResponce(response?.response?.message, 3);
      }

      return response; 
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to fetch categories');
    }
  }
);

const getmasterdataSlice = createSlice({
  name: 'getmasterdata',
  initialState: {
    status: 'idle',
    error: null,
    getmasterdata: null, 
  },
  reducers: {
    setAllmasterevent(state, action) {
      state.getmasterdata = action.payload;
    },
    cleangeAllmasterevent(state) {
      state.getmasterdata = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getallmastereventListing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getallmastereventListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.getmasterdata = action.payload.response;  
        state.error = null;
      })
      .addCase(getallmastereventListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleangeAllmasterevent, setAllmasterevent } = getmasterdataSlice.actions;
export default getmasterdataSlice.reducer;
