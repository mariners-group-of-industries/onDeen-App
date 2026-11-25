
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiRequest } from '../../services/api';
import { showResponce } from '../../responce/showResponce';


export const imageuploadAPI = createAsyncThunk(
  'image_upload',
  async (
    data: {data: object},
    {getState, rejectWithValue},
  ) => {
    const token = (getState() as any).token.token?.access_token;

    try {
      const response = await apiRequest({
        url: '/image_upload',
        method: 'POST',
        data: data,
        authToken: token,
        contentType: 'application/json',
      });
      if (response?.status) {
        // showResponce(response?.response?.message, 1);
      }
      if (!response?.status) {
        // showResponce(response?.response?.message, 3);
      }
      
      return response;
    } catch (error: any) {
      ;
      return rejectWithValue('Failed to login');
    }
  },
);

const imageuploadSlice = createSlice({
  name: 'imageupload',
  initialState: {
    status: 'idle',
    error: null,
    imageupload: null, 
  },
  reducers: {
    seImageupload(state, action) {
      state.imageupload = action.payload;
    },
    cleanimageupload(state) {
      state.imageupload = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(imageuploadAPI.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(imageuploadAPI.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.imageupload = action.payload.response;  
        state.error = null;
      })
      .addCase(imageuploadAPI.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Unknown error occurred';
      });
  },
});

export const { cleanimageupload, seImageupload } = imageuploadSlice.actions;
export default imageuploadSlice.reducer;
