import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';

export const callFilterAPIForList = createAsyncThunk(
  'xyz/applyFilter',
  async (data: any, {getState, rejectWithValue}) => {
    const state = getState() as RootState;
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;
    // console.log(
    //   data,
    //   'Local Stored DATA',
    // );
    const dattata = {
      category_id: data?.categories ? data?.categories : [],
      start_date: data?.startDate ? data?.startDate : '',
      end_date: data?.endDate ? data?.endDate : '',
      journey_level_id: data?.journeyLevels ? data?.journeyLevels : [],
      organizer_id: data?.organizers ? data?.organizers : [],
      price_type: data?.isFree == true ? [0] : data?.isFree == false ? [1] : [],
      sort_Filter: data?.sort_Filter ? data?.sort_Filter : [],
      speaker_id: data?.speakers ? data?.speakers : [],
      location: '',
      upcoming_days: '',
      latitude: data?.latitude ? data?.latitude : '',
      longitude: data?.longitude ? data?.longitude : '',
      keyword: data?.keyword ,
    };
    // console.log('dattata',dattata);

    
    try {
      const response = await apiRequest({
        url: '/customer_app/event/event',
        method: 'POST',
        data: dattata,
        authToken: token,
        bearerToken: bearerToken || accessTokenVerifyOtp || accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      if (!response || !response.status) {
        // console.log('API Call Failed:', response);
        return rejectWithValue(
          response?.response?.message || 'Failed to apply filter',
        );
      }

      return response.response;
    } catch (error: any) {
      // console.error('API Error:', error);
      return rejectWithValue(error.message || 'Failed to apply filter');
    }
  },
);

const mainpageSlice = createSlice({
  name: 'mainpagelist',
  initialState: {
    filterStatus: 'idle',
    error: null as string | null,
    filterApplyData: null as any,
    new_notification_count: null as any,
  },
  reducers: {
    clearFilterApplyData(state) {
      state.filterStatus = 'idle';
      state.error = null;
      state.filterApplyData = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(callFilterAPIForList.pending, state => {
        state.filterStatus = 'loading';
        state.error = null;
      })
      .addCase(callFilterAPIForList.fulfilled, (state, action) => {
        state.filterStatus = 'succeeded';
        state.filterApplyData = action.payload;
        state.new_notification_count = action.payload.new_notification_count;
      })
      .addCase(callFilterAPIForList.rejected, (state, action) => {
        state.filterStatus = 'failed';
        state.error =
          typeof action.payload === 'string' ? action.payload : 'Unknown error';
        state.filterApplyData = null;
      });
  },
});

export const {clearFilterApplyData} = mainpageSlice.actions;
export default mainpageSlice.reducer;
