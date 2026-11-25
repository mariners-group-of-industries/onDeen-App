import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {apiGetRequest, apiRequest} from '../../services/api';
import {RootState} from '../store';

interface Event {
  ar_title: string | null;
  end_date: string;
  id: number;
  price: number;
  price_type: number;
  primary_image: string;
  start_date: string;
  tags: string;
  title: string;
}

interface Category {
  ar_title: string | null;
  id: number;
  image: string | null;
  title: string;
}
interface Organizer {
  ar_title: string | null;
  id: number;
  image: string | null;
  title: string;
}

interface Banner {
  current_page: number;
  events: Event[];
  pages: number;
  per_page: number;
  total: number;
}

interface Recent {
  current_page: number;
  events: Event[];
  pages: number;
  per_page: number;
  total: number;
}

interface HomepageResponse {
  banner: Banner;
  HomeCategory: Category[];
  recent: Recent;
  organizer: Organizer;
}

interface EventType {
  ar_title: string | null;
  id: number;
  image: string | null;
  title: string;
}

interface HomepageState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  banner: Banner | null;
  HomeCategory: Category[] | null;
  organizer: Organizer[] | null;
  recent: Recent | null;
  eventTypes: EventType[] | null;
}

const initialState: HomepageState = {
  status: 'idle',
  error: null,
  banner: null,
  HomeCategory: null,
  recent: null,
  eventTypes: null,
  organizer: null,
};

export const fetchHomepageData = createAsyncThunk(
  'customer_app/home/home',
  async (_, {getState, rejectWithValue}) => {
    const token = (getState() as RootState).token?.token?.access_token;
    const bearerToken = (getState() as RootState).user?.loginToken;
    const accessTokenVerifyOtp = (getState() as RootState).verifyOtp.verifyOtp_access_token;
    const accessTokenNewRegister = (getState() as RootState).registerUser.access_token;

    try {
      const response = await apiGetRequest({
        url: '/customer_app/home/home',
        method: 'GET',
        authToken: token,
        bearerToken:bearerToken||accessTokenVerifyOtp||accessTokenNewRegister,
        contentType: 'application/json',
      });
      
      return response.response;
    } catch (error: any) {

      const message =
        error.response?.data?.message || 'Failed to fetch homepage data'; // Enhanced error message
      return rejectWithValue(message);
    }
  },
);

const homepageSlice = createSlice({
  name: 'homepage',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchHomepageData.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchHomepageData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.banner = action.payload.banner;
        state.HomeCategory = action.payload.category;
        state.organizer = action.payload.organizer;
        state.recent = action.payload.recent;
        state.eventTypes = action.payload.event_types; // Store event types
      })
      .addCase(fetchHomepageData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export default homepageSlice.reducer;
