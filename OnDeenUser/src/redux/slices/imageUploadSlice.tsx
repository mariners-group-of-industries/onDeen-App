import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiRequest} from '../../services/api';
import {RootState} from '../store';
import axios from 'axios';
import { BASE_URL } from '../../helpers/Constant';

interface ImageUploadState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  imageUrl: string | null;
}

const initialState: ImageUploadState = {
  status: 'idle',
  error: null,
  imageUrl: null,
};

// Async Thunk for uploading image
export const uploadImage = createAsyncThunk(
  'image/upload',
  async (
    { file, module }: { file: string; module: string },
    { getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const token = state.token?.token?.access_token;

    const OLD_BASE_URL = 'http://43.205.18.14:8080'; // Old base URL

    try {
      const response = await axios.post(
        `${BASE_URL}/image_upload`,
        { file, module },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'auth-token': token }),
          },
        }
      );
      
      if (!response.data.status) {

        return rejectWithValue(response.data.message);
      }
      // Success case
      return response.data.response.url;
    } catch (error: any) {
      // Detailed error handling
      if (error.response) {

        return rejectWithValue(error.response.data?.message || 'Image upload failed.');
      } else {

        return rejectWithValue(error.message || 'Image upload failed.');
      }
    }
  }
);



const imageUploadSlice = createSlice({
  name: 'imageUpload',
  initialState,
  reducers: {
    resetImageUploadState: state => {
      state.status = 'idle';
      state.error = null;
      state.imageUrl = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(uploadImage.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.imageUrl = action.payload;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const {resetImageUploadState} = imageUploadSlice.actions;
export default imageUploadSlice.reducer;
