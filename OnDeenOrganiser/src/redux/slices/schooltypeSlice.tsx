// schooltypeSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiGetRequest, apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';

export const schooltypeListing = createAsyncThunk(
  'school_type_list/listing',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as any).token.token?.access_token;
    try {
      const response = await apiGetRequest({
        url: '/organizer_app/profile/school_type_list',
        method: 'GET',
        authToken: token,
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

const schooltypeSlice = createSlice({
  name: 'schooltype',
  initialState: {
    status: 'idle',
    error: null,
    schooltype: null, 
  },
  reducers: {
    setSchooltype(state, action) {
      state.schooltype = action.payload;
    },
    cleanSchooltype(state) {
      state.schooltype = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(schooltypeListing.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(schooltypeListing.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schooltype = action.payload.response;  
        state.error = null;
      })
      .addCase(schooltypeListing.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleanSchooltype, setSchooltype } = schooltypeSlice.actions;
export default schooltypeSlice.reducer;
